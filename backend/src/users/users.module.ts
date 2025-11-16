import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from "./entities/doctor.entity";
import { Patient } from "./entities/patient.entity";
import { Admin } from "./entities/admin.entity";
import { Receptionist } from "./entities/receptioniste.entity"; import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Doctor, Receptionist, Admin])
  ],
  providers: [
    UsersService,
  ],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule { }
