import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicServicesService } from './clinicservices.service';
import { ClinicServicesController } from './clinicservices.controller';
import { ClinicService } from './entities/clinicservice.entity';
import { Clinique } from 'src/clinique/entities/clinique.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ClinicService, Clinique])],
    controllers: [ClinicServicesController],
    providers: [ClinicServicesService],
    exports: [ClinicServicesService],
})
export class ClinicServicesModule {}
