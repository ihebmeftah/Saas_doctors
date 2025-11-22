import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Facturation } from 'src/facturation/entities/facturation.entity';
import { FacturationService } from 'src/facturation/facturation.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Facturation)
        private readonly facturatationRepository: Repository<Facturation>,
        private readonly facturatationService: FacturationService,
    ) { }

    async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
        const facturation = await this.facturatationService.findOne(createPaymentDto.facturatationId);

        if (!facturation) {
            throw new NotFoundException('Invoice not found');
        }

        const remainingAmount = Number(facturation.totalAmount) - Number(facturation.paidAmount);

        if (createPaymentDto.amount > remainingAmount) {
            throw new BadRequestException(`Payment amount exceeds remaining balance of ${remainingAmount}`);
        }

        const transactionId = await this.generateTransactionId();

        const payment = this.paymentRepository.create({
            ...createPaymentDto,
            transactionId,
            facturation,
            status: PaymentStatus.PENDING,
        });

        return this.paymentRepository.save(payment);
    }

    async findAll(filters?: { status?: PaymentStatus; facturatationId?: string; paymentMethod?: PaymentMethod }): Promise<Payment[]> {
        const query = this.paymentRepository.createQueryBuilder('payment');

        if (filters?.status) {
            query.andWhere('payment.status = :status', { status: filters.status });
        }

        if (filters?.facturatationId) {
            query.andWhere('payment.facturation.id = :facturatationId', { facturatationId: filters.facturatationId });
        }

        if (filters?.paymentMethod) {
            query.andWhere('payment.paymentMethod = :paymentMethod', { paymentMethod: filters.paymentMethod });
        }

        return query
            .leftJoinAndSelect('payment.facturation', 'facturation')
            .orderBy('payment.createdAt', 'DESC')
            .getMany();
    }

    async findOne(id: string): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['facturation'],
        });

        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        return payment;
    }

    async findByTransactionId(transactionId: string): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: { transactionId },
            relations: ['facturation'],
        });

        if (!payment) {
            throw new NotFoundException(`Payment with transaction ID ${transactionId} not found`);
        }

        return payment;
    }

    async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
        const payment = await this.findOne(id);

        if (updatePaymentDto.status) {
            if (payment.status === PaymentStatus.COMPLETED && updatePaymentDto.status !== PaymentStatus.REFUNDED) {
                throw new BadRequestException('Cannot change status of completed payments except to refund');
            }

            payment.status = updatePaymentDto.status;

            // Update completion timestamp
            if (updatePaymentDto.status === PaymentStatus.COMPLETED) {
                payment.completedAt = new Date();
                // Update facturation paid amount
                await this.facturatationService.updatePaidAmount(payment.facturation.id, Number(payment.amount));
            }

            // Update refund timestamp
            if (updatePaymentDto.status === PaymentStatus.REFUNDED) {
                payment.refundedAt = new Date();
                // Deduct from facturation paid amount
                const facturation = await this.facturatationService.findOne(payment.facturation.id);
                const newPaidAmount = Number(facturation.paidAmount) - Number(payment.amount);
                facturation.paidAmount = Math.max(0, newPaidAmount);
                await this.facturatationRepository.save(facturation);
            }
        }

        if (updatePaymentDto.notes) {
            payment.notes = updatePaymentDto.notes;
        }

        return this.paymentRepository.save(payment);
    }

    async processPayment(id: string): Promise<Payment> {
        const payment = await this.findOne(id);

        if (payment.status !== PaymentStatus.PENDING) {
            throw new BadRequestException('Only pending payments can be processed');
        }

        payment.status = PaymentStatus.PROCESSING;
        const updatedPayment = await this.paymentRepository.save(payment);

        // Simulate payment processing (in production, integrate with payment gateway)
        try {
            await this.processPaymentGateway(updatedPayment);

            // Mark as completed
            updatedPayment.status = PaymentStatus.COMPLETED;
            updatedPayment.completedAt = new Date();

            // Update facturation
            await this.facturatationService.updatePaidAmount(updatedPayment.facturation.id, Number(updatedPayment.amount));

            return this.paymentRepository.save(updatedPayment);
        } catch (error) {
            updatedPayment.status = PaymentStatus.FAILED;
            updatedPayment.notes = error.message;
            return this.paymentRepository.save(updatedPayment);
        }
    }

    async refundPayment(id: string): Promise<Payment> {
        const payment = await this.findOne(id);

        if (payment.status !== PaymentStatus.COMPLETED) {
            throw new BadRequestException('Only completed payments can be refunded');
        }

        payment.status = PaymentStatus.REFUNDED;
        payment.refundedAt = new Date();

        // Update facturation
        const facturation = await this.facturatationService.findOne(payment.facturation.id);
        const newPaidAmount = Number(facturation.paidAmount) - Number(payment.amount);
        facturation.paidAmount = Math.max(0, newPaidAmount);

        if (newPaidAmount > 0 && newPaidAmount < Number(facturation.totalAmount)) {
            facturation.status = FacturationStatus.PARTIALLY_PAID;
        } else if (newPaidAmount === 0) {
            facturation.status = FacturationStatus.ISSUED;
        }

        await this.facturatationRepository.save(facturation);
        return this.paymentRepository.save(payment);
    }

    async remove(id: string): Promise<void> {
        const payment = await this.findOne(id);

        if (payment.status === PaymentStatus.COMPLETED) {
            throw new BadRequestException('Cannot delete completed payments');
        }

        await this.paymentRepository.remove(payment);
    }

    async getPaymentsByFacturation(facturatationId: string): Promise<Payment[]> {
        return this.findAll({ facturatationId });
    }

    async getPaymentsByRdv(rdvId: string): Promise<Payment[]> {
        return this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.facturation', 'facturation')
            .where('facturation.rdv.id = :rdvId', { rdvId })
            .orderBy('payment.createdAt', 'DESC')
            .getMany();
    }

    async getPatientPayments(patientId: string): Promise<Payment[]> {
        return this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.facturation', 'facturation')
            .leftJoinAndSelect('facturation.patient', 'patient')
            .where('patient.id = :patientId', { patientId })
            .orderBy('payment.createdAt', 'DESC')
            .getMany();
    }

    private async generateTransactionId(): Promise<string> {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `TXN-${timestamp}-${random}`;
    }

    private async processPaymentGateway(payment: Payment): Promise<void> {
        // This is a placeholder for payment gateway integration
        // In production, you would integrate with services like:
        // - Stripe
        // - PayPal
        // - Square
        // - etc.

        return new Promise((resolve, reject) => {
            // Simulate processing delay
            setTimeout(() => {
                // Simulate 95% success rate
                if (Math.random() > 0.05) {
                    resolve();
                } else {
                    reject(new Error('Payment gateway connection failed'));
                }
            }, 1000);
        });
    }
}

// Import missing enum
import { FacturationStatus } from 'src/facturation/entities/facturation.entity';
