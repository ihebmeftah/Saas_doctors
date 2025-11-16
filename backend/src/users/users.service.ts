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
      ...(await this.recepRepo.find(where)),
      ...(await this.patientRepo.find(where)),
      ...(await this.doctorRepo.find(where)),
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
    user ??= await this.recepRepo.findOne({ where: { email } });
    user ??= await this.patientRepo.findOne({ where: { email } });
    user ??= await this.doctorRepo.findOne({ where: { email } });
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
  async deleteUserById(id: string, role: userRole) {
    await this.findUserById(id, role);
    let result;
    if (role === userRole.ADMIN || userRole.SUPER_ADMIN)
      result = await this.adminRepo.delete(id);
    if (role === userRole.RECEP) result = await this.recepRepo.delete(id);
    if (role === userRole.PATIENT) result = await this.patientRepo.delete(id);
    if (role === userRole.DOCTOR) result = await this.doctorRepo.delete(id);
    if (result?.affected === 0)
      throw new NotFoundException('User with this id does not exist');
    return { message: `${role} deleted successfully` };
  }
}
