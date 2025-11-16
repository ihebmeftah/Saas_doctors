import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus, PaymentMethod } from './entities/payment.entity';

@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post()
    create(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentService.create(createPaymentDto);
    }

    @Get()
    findAll(
        @Query('status') status?: PaymentStatus,
        @Query('facturatationId') facturatationId?: string,
        @Query('paymentMethod') paymentMethod?: PaymentMethod,
    ) {
        return this.paymentService.findAll({ status, facturatationId, paymentMethod });
    }

    @Get('transaction/:transactionId')
    findByTransactionId(@Param('transactionId') transactionId: string) {
        return this.paymentService.findByTransactionId(transactionId);
    }

    @Get('facturation/:facturatationId')
    getPaymentsByFacturation(@Param('facturatationId') facturatationId: string) {
        return this.paymentService.getPaymentsByFacturation(facturatationId);
    }

    @Get('rdv/:rdvId')
    getPaymentsByRdv(@Param('rdvId') rdvId: string) {
        return this.paymentService.getPaymentsByRdv(rdvId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.paymentService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
        return this.paymentService.update(id, updatePaymentDto);
    }

    @Post(':id/process')
    processPayment(@Param('id') id: string) {
        return this.paymentService.processPayment(id);
    }

    @Post(':id/refund')
    refundPayment(@Param('id') id: string) {
        return this.paymentService.refundPayment(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.paymentService.remove(id);
    }
}
