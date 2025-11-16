import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { Facturation } from 'src/facturation/entities/facturation.entity';
import { FacturationService } from 'src/facturation/facturation.service';
import { Patient } from 'src/users/entities/patient.entity';
import { Clinique } from 'src/clinique/entities/clinique.entity';
import { Rdv } from 'src/rdv/entities/rdv.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Payment, Facturation, Patient, Clinique, Rdv])],
    controllers: [PaymentController],
    providers: [PaymentService, FacturationService],
    exports: [PaymentService],
})
export class PaymentModule {}
