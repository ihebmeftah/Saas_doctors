import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseEnumPipe } from '@nestjs/common';
import { RdvService } from './rdv.service';
import { CreateRdvDto } from './dto/create-rdv.dto';
import { CurrUser } from 'src/shared/decorators/loggeduser.decorator';
import type { LoggedUser } from 'src/auth/strategy/jwt.strategy';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { userRole } from '../users/entities/user.entity';
import { rdvStatus } from './entities/rdv.entity';
import { AddConsultationDto } from './dto/add_consultation.dto';

@Controller('rdv')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RdvController {
  constructor(private readonly rdvService: RdvService) { }

  @Get()
  findAll() {
    return this.rdvService.findAll();
  }

  @Get('my-appointments')
  @Roles(userRole.PATIENT)
  getMyAppointments(@CurrUser() user: LoggedUser) {
    return this.rdvService.getPatientAppointments(user.id);
  }

  @Get('doctor-appointments')
  @Roles(userRole.DOCTOR)
  getDoctorAppointments(@CurrUser() user: LoggedUser) {
    return this.rdvService.getDoctorAppointments(user.id);
  }

  @Get('doctor-stats')
  @Roles(userRole.DOCTOR)
  getDoctorStats(@CurrUser() user: LoggedUser) {
    return this.rdvService.getDoctorTodayStats(user.id);
  }

  @Get('doctor-patients')
  @Roles(userRole.DOCTOR)
  getDoctorPatients(@CurrUser() user: LoggedUser) {
    return this.rdvService.getDoctorPatients(user.id);
  }

  @Get('receptionist-appointments')
  @Roles(userRole.RECEP)
  getReceptionistAppointments(@CurrUser() user: LoggedUser) {
    return this.rdvService.getReceptionistAppointments(user.id);
  }

  @Post()
  @Roles(userRole.RECEP, userRole.PATIENT)
  createRdv(@Body() createRdvDto: CreateRdvDto, @CurrUser() user: LoggedUser) {
    return this.rdvService.createRdv(createRdvDto, user);
  }

  @Get(':id')
  findRDVById(@Param('id') id: string) {
    return this.rdvService.findRDVById(id);
  }

  @Patch(':id/change-status')
  @Roles(userRole.RECEP, userRole.DOCTOR)
  changeStatus(
    @Param('id') id: string,
    @Body() addConsultationDto: AddConsultationDto
  ) {
    return this.rdvService.changeStatus(id, addConsultationDto);
  }
}


