import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRdvDto } from './dto/create-rdv.dto';
import { UpdateRdvDto } from './dto/update-rdv.dto';
import { Rdv, rdvStatus } from './entities/rdv.entity';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { CliniqueService } from 'src/clinique/clinique.service';
import { userRole } from 'src/users/entities/user.entity';
import { LoggedUser } from 'src/auth/strategy/jwt.strategy';
import moment from 'moment';
import { AddConsultationDto } from './dto/add_consultation.dto';

@Injectable()
export class RdvService {
  constructor(
    @InjectRepository(Rdv)
    private readonly rdvRepository: Repository<Rdv>,
    private readonly usersService: UsersService,
    private readonly clinicSer: CliniqueService,
  ) { }
  async findAll() {
    const start = moment().startOf('isoWeek').toDate();
    const end = moment().endOf('isoWeek').toDate();
    return await this.rdvRepository.find({
      relations: { doctor: true, patient: true },
      where: {
        rdvDate: Between(start, end),
      },
    });
  }

  async getPatientAppointments(patientId: string) {
    return await this.rdvRepository.find({
      where: { patient: { id: patientId } },
      relations: { doctor: true, patient: true, clinique: true, receptionist: true },
      order: { rdvDate: 'DESC' },
    });
  }

  async getDoctorAppointments(doctorId: string) {
    return await this.rdvRepository.find({
      where: {
        doctor: { id: doctorId },
      },
      relations: { doctor: true, patient: true, clinique: true, receptionist: true },
      order: { rdvDate: 'ASC' },
    });
  }

  async getDoctorTodayStats(doctorId: string) {
    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();

    const appointments = await this.rdvRepository.find({
      where: {
        doctor: { id: doctorId },
        rdvDate: Between(startOfDay, endOfDay),
      },
      relations: { patient: true },
    });

    const total = appointments.length;
    const completed = appointments.filter(apt => apt.status === rdvStatus.COMPLETED).length;
    const pending = appointments.filter(apt => apt.status === rdvStatus.PENDING).length;
    const scheduled = appointments.filter(apt => apt.status === rdvStatus.SCHEDULED).length;
    const inProgress = appointments.filter(apt => apt.status === rdvStatus.IN_PROGRESS).length;
    const cancelled = appointments.filter(apt => apt.status === rdvStatus.CANCELLED).length;

    return {
      total,
      completed,
      pending,
      scheduled,
      inProgress,
      cancelled,
      appointments,
    };
  }

  async getDoctorPatients(doctorId: string) {
    const completedAppointments = await this.rdvRepository.find({
      where: {
        doctor: { id: doctorId },
        status: rdvStatus.COMPLETED,
      },
      relations: { patient: true, clinique: true },
      order: { rdvDate: 'DESC' },
    });

    // Group by patient and get unique patients with their latest consultation
    const patientsMap = new Map();
    completedAppointments.forEach((apt) => {
      if (!patientsMap.has(apt.patient.id)) {
        patientsMap.set(apt.patient.id, {
          patient: apt.patient,
          lastConsultation: apt.rdvDate,
          totalConsultations: 1,
          lastDiagnosis: apt.consultation?.diagnosis,
          lastTreatment: apt.consultation?.treatment,
        });
      } else {
        const existing = patientsMap.get(apt.patient.id);
        existing.totalConsultations += 1;
      }
    });

    return Array.from(patientsMap.values());
  }

  async getReceptionistAppointments(receptionistId: string) {
    const receptionist = await this.usersService.findUserById(receptionistId, userRole.RECEP) as any;

    return await this.rdvRepository.find({
      where: {
        clinique: { id: receptionist.clinique.id },
      },
      relations: { doctor: true, patient: true, clinique: true, receptionist: true },
      order: { rdvDate: 'ASC' },
    });
  }

  async createRdv(createRdvDto: CreateRdvDto, user: LoggedUser) {
    const clinic = await this.clinicSer.findOne(createRdvDto.cliniqueId);
    const patient = await this.usersService.findUserById(createRdvDto.patientId, userRole.PATIENT);
    const doctor = await this.usersService.findUserById(createRdvDto.doctorId, userRole.DOCTOR);
    let receptionist
    if (user.role === userRole.RECEP) {
      receptionist = await this.usersService.findUserById(user.id, userRole.RECEP);
    }
    const rdv = this.rdvRepository.create({
      clinique: clinic,
      patient: patient,
      doctor: doctor,
      receptionist: receptionist,
      rdvDate: new Date(createRdvDto.rdvDate),
      reason: createRdvDto.reason,
      createdBy: user.role,
    });
    return await this.rdvRepository.save(rdv);
  }
  async findRDVById(id: string) {
    const rdv = await this.rdvRepository.findOne({
      where: { id: id },
      relations: { doctor: true, patient: true },
    });
    if (!rdv) {
      throw new NotFoundException('Rdv not found');
    }
    return rdv;
  }

  async changeStatus(id: string, addconsultationDto: AddConsultationDto) {
    const rdv = await this.findRDVById(id);
    if (rdv.status === rdvStatus.COMPLETED) {
      throw new ConflictException('Consultation already completed');
    }
    rdv.status = addconsultationDto.status;
    if (addconsultationDto.status === rdvStatus.COMPLETED) {
      rdv.consultation = {
        examination: addconsultationDto.examination,
        diagnosis: addconsultationDto.diagnosis,
        treatment: addconsultationDto.treatment,
      };
    }
    return await this.rdvRepository.save(rdv);
  }
}
