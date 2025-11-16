import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FacturationService } from './facturation.service';
import { CreateFacturationDto } from './dto/create-facturation.dto';
import { UpdateFacturationDto } from './dto/update-facturation.dto';
import { FacturationStatus } from './entities/facturation.entity';

@Controller('facturation')
export class FacturationController {
    constructor(private readonly facturatationService: FacturationService) {}

    @Post()
    create(@Body() createFacturationDto: CreateFacturationDto) {
        return this.facturatationService.create(createFacturationDto);
    }

    @Get()
    findAll(
        @Query('status') status?: FacturationStatus,
        @Query('cliniqueId') cliniqueId?: string,
        @Query('patientId') patientId?: string,
    ) {
        return this.facturatationService.findAll({ status, cliniqueId, patientId });
    }

    @Get('invoice/:invoiceNumber')
    findByInvoiceNumber(@Param('invoiceNumber') invoiceNumber: string) {
        return this.facturatationService.findByInvoiceNumber(invoiceNumber);
    }

    @Get('patient/:patientId')
    getPatientInvoices(@Param('patientId') patientId: string) {
        return this.facturatationService.getPatientInvoices(patientId);
    }

    @Get('clinic/:cliniqueId')
    getClinicInvoices(@Param('cliniqueId') cliniqueId: string) {
        return this.facturatationService.getClinicInvoices(cliniqueId);
    }

    @Get('overdue/all')
    getOverdueInvoices() {
        return this.facturatationService.getOverdueInvoices();
    }

    @Get('rdv/:rdvId')
    getInvoiceByRdv(@Param('rdvId') rdvId: string) {
        return this.facturatationService.getInvoiceByRdv(rdvId);
    }

    @Get('rdv/all/list')
    getRdvInvoices() {
        return this.facturatationService.getRdvInvoices();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.facturatationService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFacturationDto: UpdateFacturationDto) {
        return this.facturatationService.update(id, updateFacturationDto);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: FacturationStatus) {
        return this.facturatationService.updateStatus(id, status);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.facturatationService.remove(id);
    }
}
