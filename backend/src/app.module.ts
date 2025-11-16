import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { CliniqueModule } from './clinique/clinique.module';
import { RdvModule } from './rdv/rdv.module';
import { ClinicServicesModule } from './clinicservices/clinicservices.module';
import { FacturationModule } from './facturation/facturation.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    CliniqueModule,
    RdvModule,
    ClinicServicesModule,
    FacturationModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
