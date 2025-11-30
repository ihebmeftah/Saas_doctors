import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { Admin } from './entities/admin.entity';
import { Receptionist } from './entities/receptioniste.entity';
import { userRole } from './entities/user.entity';
import { Rdv } from 'src/rdv/entities/rdv.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
    @InjectRepository(Receptionist)
    private readonly recepRepo: Repository<Receptionist>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Doctor) private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(Rdv) private readonly rdvRepo: Repository<Rdv>,
  ) { }
  async getUsers(role?: userRole, ids?: string[]) {
    const where = {
      where: ids && { id: In(ids) },
    };
    if (role === userRole.ADMIN || role === userRole.SUPER_ADMIN)
      return this.adminRepo.find(where);
    if (role === userRole.RECEP) return this.recepRepo.find({ ...where, relations: { clinique: true } });
    if (role === userRole.PATIENT) return this.patientRepo.find(where);
    if (role === userRole.DOCTOR) return this.doctorRepo.find({ ...where, relations: { clinique: true } });
    return [
      ...(await this.adminRepo.find(where)),
      ...(await this.recepRepo.find({ ...where, relations: { clinique: true } })),
      ...(await this.patientRepo.find(where)),
      ...(await this.doctorRepo.find({ ...where, relations: { clinique: true } })),
    ];
  }
  async createReceptionist(userDto: CreateUserDto) {
    const existed = await this.recepRepo.existsBy([
      { email: userDto.email },
      { phone: userDto.phone },
    ]);
    if (existed) {
      throw new ConflictException(
        'User with this email or phone number already exists',
      );
    }
    userDto.password = await bcrypt.hash('Doctor@123', 10)
    const createdUser = this.recepRepo.create({
      ...userDto,
      role: userRole.RECEP,
    });
    const savedUser = await this.recepRepo.save(createdUser);
    return savedUser;
  }

  async createPatient(userDto: CreateUserDto) {
    const existed = await this.patientRepo.existsBy([
      { email: userDto.email },
      { phone: userDto.phone },
    ]);
    if (existed) {
      throw new ConflictException(
        'User with this email or phone number already exists',
      );
    }
    userDto.password = await bcrypt.hash('Doctor@123', 10)
    const createdUser = this.patientRepo.create({
      ...userDto,
      role: userRole.PATIENT,
    });
    const savedUser = await this.patientRepo.save(createdUser);
    return savedUser;
  }

  async createAdmin(userDto: CreateUserDto) {
    const existed = await this.adminRepo.existsBy([
      { email: userDto.email },
      { phone: userDto.phone },
    ]);
    if (existed) {
      throw new ConflictException(
        'User with this email or phone number already exists',
      );
    }
    userDto.password = await bcrypt.hash('Doctor@123', 10)
    const createdUser = this.adminRepo.create({
      ...userDto,
      role: userRole.ADMIN,
    });
    const savedUser = await this.adminRepo.save(createdUser);
    return savedUser;
  }
  async createDoctor(userDto: CreateUserDto) {
    const existed = await this.doctorRepo.existsBy([
      { email: userDto.email },
      { phone: userDto.phone },
    ]);
    if (existed) {
      throw new ConflictException(
        'User with this email or phone number already exists',
      );
    }
    userDto.password = await bcrypt.hash('Doctor@123', 10)
    const createdUser = this.doctorRepo.create({
      ...userDto,
      role: userRole.DOCTOR,
    });
    const savedUser = await this.doctorRepo.save(createdUser);
    return savedUser;
  }
  async findByEmail(email: string) {
    let user = await this.adminRepo.findOne({ where: { email } });
    user ??= await this.recepRepo.findOne({ where: { email }, relations: { clinique: true } });
    user ??= await this.patientRepo.findOne({ where: { email } });
    user ??= await this.doctorRepo.findOne({ where: { email }, relations: { clinique: true } });
    if (!user) {
      throw new NotFoundException(`User with this email does not exist`);
    }
    return user;
  }

  async findUserById(id: string, role: userRole) {
    let user: Admin | Receptionist | Patient | Doctor | null = null;
    if (role === userRole.ADMIN || userRole.SUPER_ADMIN)
      user = await this.adminRepo.findOne({ where: { id } });
    if (role === userRole.RECEP)
      user = await this.recepRepo.findOne({ where: { id }, relations: { clinique: true } });
    if (role === userRole.PATIENT)
      user = await this.patientRepo.findOne({ where: { id } });
    if (role === userRole.DOCTOR)
      user = await this.doctorRepo.findOne({ where: { id }, relations: { clinique: true } });
    if (!user)
      throw new NotFoundException(`${role} with this id does not exist`);
    return user;
  }
  async updateUser(id: string, role: userRole, updateDto: Partial<CreateUserDto>) {
    const user = await this.findUserById(id, role);

    // Check for conflicts if email or phone is being updated
    if (updateDto.email && updateDto.email !== user.email) {
      const emailExists = await this.findByEmailCheck(updateDto.email);
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }

    Object.assign(user, updateDto);

    let savedUser;
    if (role === userRole.ADMIN || role === userRole.SUPER_ADMIN)
      savedUser = await this.adminRepo.save(user as Admin);
    if (role === userRole.RECEP)
      savedUser = await this.recepRepo.save(user as Receptionist);
    if (role === userRole.PATIENT)
      savedUser = await this.patientRepo.save(user as Patient);
    if (role === userRole.DOCTOR)
      savedUser = await this.doctorRepo.save(user as Doctor);

    return savedUser;
  }

  async findByEmailCheck(email: string) {
    let user = await this.adminRepo.findOne({ where: { email } });
    user ??= await this.recepRepo.findOne({ where: { email } });
    user ??= await this.patientRepo.findOne({ where: { email } });
    user ??= await this.doctorRepo.findOne({ where: { email } });
    return user;
  }

  async deleteUserById(id: string, role: userRole) {
    await this.findUserById(id, role);
    let result;
    if (role === userRole.ADMIN || userRole.SUPER_ADMIN)
      result = await this.adminRepo.softDelete(id);
    if (role === userRole.RECEP) result = await this.recepRepo.softDelete(id);
    if (role === userRole.PATIENT) result = await this.patientRepo.softDelete(id);
    if (role === userRole.DOCTOR) result = await this.doctorRepo.softDelete(id);
    if (result?.affected === 0)
      throw new NotFoundException('User with this id does not exist');
    return { message: `${role} deleted successfully` };
  }
  async restoreDeletedUser(id: string, role: userRole) {
    let result;
    if (role === userRole.ADMIN || userRole.SUPER_ADMIN)
      result = await this.adminRepo.restore(id);
    if (role === userRole.RECEP) result = await this.recepRepo.restore(id);
    if (role === userRole.PATIENT) result = await this.patientRepo.restore(id);
    if (role === userRole.DOCTOR) result = await this.doctorRepo.restore(id);
    if (result?.affected === 0)
      throw new NotFoundException('User with this id does not exist');
    return { message: `${role} restored successfully` };
  }

  async getDeletedUsers(role?: userRole, ids?: string[]) {
    const where = {
      where: ids && { id: In(ids) },
      withDeleted: true,
    };
    if (role === userRole.ADMIN || role === userRole.SUPER_ADMIN)
      return this.adminRepo.find(where);
    if (role === userRole.RECEP) return this.recepRepo.find({ ...where, relations: { clinique: true } });
    if (role === userRole.PATIENT) return this.patientRepo.find(where);
    if (role === userRole.DOCTOR) return this.doctorRepo.find({ ...where, relations: { clinique: true } });
    return [
      ...(await this.adminRepo.find(where)),
      ...(await this.recepRepo.find({ ...where, relations: { clinique: true } })),
      ...(await this.patientRepo.find(where)),
      ...(await this.doctorRepo.find({ ...where, relations: { clinique: true } })),
    ];
  }

  async getDoctorsByClinic(clinicId: string) {
    return await this.doctorRepo.find({
      where: { clinique: { id: clinicId } },
      relations: { clinique: true },
    });
  }

  async getPatientsByClinic(clinicId: string) {
    // Get all patients who have appointments in this clinic
    const rdvs = await this.rdvRepo.find({
      where: { clinique: { id: clinicId } },
      relations: ['patient'],
    });

    // Extract unique patients
    const uniquePatients = Array.from(
      new Map(rdvs.map(rdv => [rdv.patient.id, rdv.patient])).values()
    );

    return uniquePatients;
  }

  async getPatients() {
    return await this.patientRepo.find({
      order: { createdAt: 'DESC' },
    });
  }
}
