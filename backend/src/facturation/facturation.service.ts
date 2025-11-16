import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Facturation, FacturationStatus } from './entities/facturation.entity';
import { Patient } from 'src/users/entities/patient.entity';
import { Clinique } from 'src/clinique/entities/clinique.entity';
import { Rdv } from 'src/rdv/entities/rdv.entity';
import { CreateFacturationDto } from './dto/create-facturation.dto';
import { UpdateFacturationDto } from './dto/update-facturation.dto';

@Injectable()
export class FacturationService {
    constructor(
        @InjectRepository(Facturation)
        private readonly facturatationRepository: Repository<Facturation>,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        @InjectRepository(Clinique)
        private readonly cliniqueRepository: Repository<Clinique>,
        @InjectRepository(Rdv)
        private readonly rdvRepository: Repository<Rdv>,
    ) {}

    async create(createFacturationDto: CreateFacturationDto): Promise<Facturation> {
        const patient = await this.patientRepository.findOne({
            where: { id: createFacturationDto.patientId },
        });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        const clinique = await this.cliniqueRepository.findOne({
            where: { id: createFacturationDto.cliniqueId },
        });

        if (!clinique) {
            throw new NotFoundException('Clinique not found');
        }

        let rdv: Rdv | undefined;
        if (createFacturationDto.rdvId) {
            const foundRdv = await this.rdvRepository.findOne({
                where: { id: createFacturationDto.rdvId },
            });

            if (!foundRdv) {
                throw new NotFoundException('Appointment (RDV) not found');
            }
            rdv = foundRdv;
        }

        const invoiceNumber = await this.generateInvoiceNumber();

        const facturation = this.facturatationRepository.create({
            ...createFacturationDto,
            invoiceNumber,
            patient,
            clinique,
            rdv,
            status: FacturationStatus.ISSUED,
        });

        return this.facturatationRepository.save(facturation);
    }

    async findAll(filters?: { status?: FacturationStatus; cliniqueId?: string; patientId?: string }): Promise<Facturation[]> {
        const query = this.facturatationRepository.createQueryBuilder('facturation');

        if (filters?.status) {
            query.andWhere('facturation.status = :status', { status: filters.status });
        }

        if (filters?.cliniqueId) {
            query.andWhere('facturation.clinique.id = :cliniqueId', { cliniqueId: filters.cliniqueId });
        }

        if (filters?.patientId) {
            query.andWhere('facturation.patient.id = :patientId', { patientId: filters.patientId });
        }

        return query
            .leftJoinAndSelect('facturation.patient', 'patient')
            .leftJoinAndSelect('facturation.clinique', 'clinique')
            .leftJoinAndSelect('facturation.payments', 'payments')
            .orderBy('facturation.createdAt', 'DESC')
            .getMany();
    }

    async findOne(id: string): Promise<Facturation> {
        const facturation = await this.facturatationRepository.findOne({
            where: { id },
            relations: ['patient', 'clinique', 'payments'],
        });

        if (!facturation) {
            throw new NotFoundException(`Facturation with ID ${id} not found`);
        }

        return facturation;
    }

    async findByInvoiceNumber(invoiceNumber: string): Promise<Facturation> {
        const facturation = await this.facturatationRepository.findOne({
            where: { invoiceNumber },
            relations: ['patient', 'clinique', 'payments'],
        });

        if (!facturation) {
            throw new NotFoundException(`Invoice ${invoiceNumber} not found`);
        }

        return facturation;
    }

    async update(id: string, updateFacturationDto: UpdateFacturationDto): Promise<Facturation> {
        const facturation = await this.findOne(id);

        Object.assign(facturation, updateFacturationDto);

        return this.facturatationRepository.save(facturation);
    }

    async updateStatus(id: string, status: FacturationStatus): Promise<Facturation> {
        const facturation = await this.findOne(id);
        facturation.status = status;
        return this.facturatationRepository.save(facturation);
    }

    async updatePaidAmount(id: string, amount: number): Promise<Facturation> {
        const facturation = await this.findOne(id);
        const newPaidAmount = Number(facturation.paidAmount) + amount;

        if (newPaidAmount > Number(facturation.totalAmount)) {
            throw new BadRequestException('Payment amount exceeds invoice total');
        }

        facturation.paidAmount = newPaidAmount;

        // Update status based on paid amount
        if (newPaidAmount === 0) {
            facturation.status = FacturationStatus.ISSUED;
        } else if (newPaidAmount < Number(facturation.totalAmount)) {
            facturation.status = FacturationStatus.PARTIALLY_PAID;
        } else if (newPaidAmount === Number(facturation.totalAmount)) {
            facturation.status = FacturationStatus.PAID;
        }

        return this.facturatationRepository.save(facturation);
    }

    async remove(id: string): Promise<void> {
        const facturation = await this.findOne(id);
        await this.facturatationRepository.remove(facturation);
    }

    async getOverdueInvoices(): Promise<Facturation[]> {
        return this.facturatationRepository.find({
            where: {
                dueDate: LessThanOrEqual(new Date()),
                status: FacturationStatus.ISSUED,
            },
            relations: ['patient', 'clinique'],
        });
    }

    async getPatientInvoices(patientId: string): Promise<Facturation[]> {
        return this.findAll({ patientId });
    }

    async getClinicInvoices(cliniqueId: string): Promise<Facturation[]> {
        return this.findAll({ cliniqueId });
    }

    async getInvoiceByRdv(rdvId: string): Promise<Facturation> {
        const facturation = await this.facturatationRepository.findOne({
            where: { rdv: { id: rdvId } },
            relations: ['patient', 'clinique', 'payments', 'rdv'],
        });

        if (!facturation) {
            throw new NotFoundException(`No invoice found for appointment ${rdvId}`);
        }

        return facturation;
    }

    async getRdvInvoices(): Promise<Facturation[]> {
        return this.facturatationRepository
            .createQueryBuilder('facturation')
            .where('facturation.rdv IS NOT NULL')
            .leftJoinAndSelect('facturation.rdv', 'rdv')
            .leftJoinAndSelect('facturation.patient', 'patient')
            .leftJoinAndSelect('facturation.clinique', 'clinique')
            .orderBy('facturation.createdAt', 'DESC')
            .getMany();
    }

    private async generateInvoiceNumber(): Promise<string> {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}${month}${day}`;
        const prefix = `INV-${dateString}`;

        const lastInvoice = await this.facturatationRepository
            .createQueryBuilder('facturation')
            .where('facturation.invoiceNumber LIKE :prefix', { prefix: `${prefix}%` })
            .orderBy('facturation.createdAt', 'DESC')
            .limit(1)
            .getOne();

        const count = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[2]) : 0;

        return `${prefix}-${String(count + 1).padStart(5, '0')}`;
    }
}
