import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { SeedService } from './seed.service';
import { Admin } from '../users/entities/admin.entity';
import { Doctor } from '../users/entities/doctor.entity';
import { Patient } from '../users/entities/patient.entity';
import { Receptionist } from '../users/entities/receptioniste.entity';
import { Clinique } from '../clinique/entities/clinique.entity';
import { ClinicService } from '../clinicservices/entities/clinicservice.entity';
import { Rdv } from '../rdv/entities/rdv.entity';
import { Facturation } from '../facturation/entities/facturation.entity';
import { Payment } from '../payment/entities/payment.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        TypeOrmModule.forFeature([
            Admin,
            Doctor,
            Patient,
            Receptionist,
            Clinique,
            ClinicService,
            Rdv,
            Facturation,
            Payment,
        ]),
    ],
    providers: [SeedService],
})
export class SeedModule { }
