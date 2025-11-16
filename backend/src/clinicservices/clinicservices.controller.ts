import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ClinicServicesService } from './clinicservices.service';
import { CreateClinicServiceDto } from './dto/create-clinicservice.dto';
import { UpdateClinicServiceDto } from './dto/update-clinicservice.dto';

@Controller('clinic-services')
export class ClinicServicesController {
    constructor(private readonly clinicServicesService: ClinicServicesService) {}

    @Post()
    create(@Body() createClinicServiceDto: CreateClinicServiceDto) {
        return this.clinicServicesService.create(createClinicServiceDto);
    }

    @Get()
    findAll(@Query('cliniqueId') cliniqueId?: string) {
        return this.clinicServicesService.findAll(cliniqueId);
    }

    @Get('clinic/:cliniqueId')
    findByClinic(@Param('cliniqueId') cliniqueId: string) {
        return this.clinicServicesService.findByClinicId(cliniqueId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clinicServicesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateClinicServiceDto: UpdateClinicServiceDto) {
        return this.clinicServicesService.update(id, updateClinicServiceDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.clinicServicesService.remove(id);
    }
}
