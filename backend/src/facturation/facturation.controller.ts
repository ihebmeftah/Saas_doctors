import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FacturationService } from './facturation.service';
import { CreateFacturationDto } from './dto/create-facturation.dto';
import { UpdateFacturationDto } from './dto/update-facturation.dto';
import { FacturationStatus } from './entities/facturation.entity';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { userRole } from 'src/users/entities/user.entity';
import { CurrUser } from 'src/shared/decorators/loggeduser.decorator';
import type { LoggedUser } from 'src/auth/strategy/jwt.strategy';
import { Receptionist } from '../users/entities/receptioniste.entity';

@Controller('facturation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacturationController {
    constructor(private readonly facturatationService: FacturationService) { }

    @Get('my-invoices')
    @Roles(userRole.PATIENT)
    getMyInvoices(@CurrUser() user: LoggedUser) {
        return this.facturatationService.getPatientInvoices(user.id);
    }

    @Get('receptionist/invoices')
    @Roles(userRole.RECEP)
    async getReceptionistInvoices(@CurrUser() user: LoggedUser) {
        return this.facturatationService.getReceptionistInvoices(user.id);
    }

    @Get('receptionist/completed-appointments')
    @Roles(userRole.RECEP)
    async getCompletedAppointmentsWithoutInvoice(@CurrUser() user: LoggedUser) {
        return this.facturatationService.getCompletedAppointmentsWithoutInvoice(user.id);
    }

    @Post()
    @Roles(userRole.RECEP)
    create(@Body() createFacturationDto: CreateFacturationDto) {
        return this.facturatationService.create(createFacturationDto);
    }

    @Get()
    @Roles(userRole.RECEP)
    findAll(
        @Query('status') status?: FacturationStatus,
        @Query('cliniqueId') cliniqueId?: string,
        @Query('patientId') patientId?: string,
    ) {
        return this.facturatationService.findAll({ status, cliniqueId, patientId });
    }

    @Get('invoice/:invoiceNumber')
    @Roles(userRole.RECEP, userRole.DOCTOR, userRole.PATIENT)
    findByInvoiceNumber(@Param('invoiceNumber') invoiceNumber: string) {
        return this.facturatationService.findByInvoiceNumber(invoiceNumber);
    }

    @Get('patient/:patientId')
    @Roles(userRole.RECEP, userRole.DOCTOR, userRole.PATIENT)
    getPatientInvoices(@Param('patientId') patientId: string) {
        return this.facturatationService.getPatientInvoices(patientId);
    }

    @Get('clinic/:cliniqueId')
    @Roles(userRole.RECEP, userRole.ADMIN)
    getClinicInvoices(@Param('cliniqueId') cliniqueId: string) {
        return this.facturatationService.getClinicInvoices(cliniqueId);
    }

    @Get('overdue/all')
    @Roles(userRole.RECEP, userRole.ADMIN)
    getOverdueInvoices() {
        return this.facturatationService.getOverdueInvoices();
    }

    @Get('rdv/all/list')
    @Roles(userRole.RECEP, userRole.ADMIN)
    getRdvInvoices() {
        return this.facturatationService.getRdvInvoices();
    }

    @Get('rdv/:rdvId')
    @Roles(userRole.RECEP, userRole.ADMIN)
    getInvoiceByRdv(@Param('rdvId') rdvId: string) {
        return this.facturatationService.getInvoiceByRdv(rdvId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.facturatationService.findOne(id);
    }

    @Patch(':id')
    @Roles(userRole.RECEP)
    update(@Param('id') id: string, @Body() updateFacturationDto: UpdateFacturationDto) {
        return this.facturatationService.update(id, updateFacturationDto);
    }

    @Patch(':id/status')
    @Roles(userRole.RECEP)
    updateStatus(@Param('id') id: string, @Body('status') status: FacturationStatus) {
        return this.facturatationService.updateStatus(id, status);
    }

    @Delete(':id')
    @Roles(userRole.RECEP)
    remove(@Param('id') id: string) {
        return this.facturatationService.remove(id);
    }
}
