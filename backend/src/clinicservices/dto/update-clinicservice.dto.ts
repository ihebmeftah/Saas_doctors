import { PartialType } from '@nestjs/mapped-types';
import { CreateClinicServiceDto } from './create-clinicservice.dto';

export class UpdateClinicServiceDto extends PartialType(CreateClinicServiceDto) {}
