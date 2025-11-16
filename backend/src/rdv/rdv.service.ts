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
