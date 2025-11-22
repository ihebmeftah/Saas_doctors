import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { userRole } from 'src/users/entities/user.entity';
import { CurrUser } from 'src/shared/decorators/loggeduser.decorator';
import type { LoggedUser } from 'src/auth/strategy/jwt.strategy';
import { Patient } from '../users/entities/patient.entity';

@Controller('payment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Get('my-payments')
    @Roles(userRole.PATIENT)
    getMyPayments(@CurrUser() user: LoggedUser) {
        return this.paymentService.getPatientPayments(user.id);
    }

    @Post()
    @Roles(userRole.RECEP, userRole.PATIENT)
    create(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentService.create(createPaymentDto);
    }

    @Get()
    @Roles(userRole.RECEP, userRole.ADMIN)
    findAll(
        @Query('status') status?: PaymentStatus,
        @Query('facturatationId') facturatationId?: string,
        @Query('paymentMethod') paymentMethod?: PaymentMethod,
    ) {
        return this.paymentService.findAll({ status, facturatationId, paymentMethod });
    }

    @Get('transaction/:transactionId')
    @Roles(userRole.RECEP, userRole.PATIENT)
    findByTransactionId(@Param('transactionId') transactionId: string) {
        return this.paymentService.findByTransactionId(transactionId);
    }

    @Get('facturation/:facturatationId')
    @Roles(userRole.RECEP, userRole.PATIENT)
    getPaymentsByFacturation(@Param('facturatationId') facturatationId: string) {
        return this.paymentService.getPaymentsByFacturation(facturatationId);
    }

    @Get('rdv/:rdvId')
    @Roles(userRole.RECEP, userRole.PATIENT)
    getPaymentsByRdv(@Param('rdvId') rdvId: string) {
        return this.paymentService.getPaymentsByRdv(rdvId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.paymentService.findOne(id);
    }

    @Patch(':id')
    @Roles(userRole.RECEP)
    update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
        return this.paymentService.update(id, updatePaymentDto);
    }

    @Post(':id/process')
    @Roles(userRole.RECEP)
    processPayment(@Param('id') id: string) {
        return this.paymentService.processPayment(id);
    }

    @Post(':id/refund')
    @Roles(userRole.RECEP)
    refundPayment(@Param('id') id: string) {
        return this.paymentService.refundPayment(id);
    }

    @Delete(':id')
    @Roles(userRole.RECEP)
    remove(@Param('id') id: string) {
        return this.paymentService.remove(id);
    }
}
