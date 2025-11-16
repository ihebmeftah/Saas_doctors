import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturationService } from './facturation.service';
import { FacturationController } from './facturation.controller';
import { Facturation } from './entities/facturation.entity';
import { Patient } from 'src/users/entities/patient.entity';
import { Clinique } from 'src/clinique/entities/clinique.entity';
import { Rdv } from 'src/rdv/entities/rdv.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Facturation, Patient, Clinique, Rdv])],
    controllers: [FacturationController],
    providers: [FacturationService],
    exports: [FacturationService],
})
export class FacturationModule {}
