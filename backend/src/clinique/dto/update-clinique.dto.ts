import { PartialType } from '@nestjs/mapped-types';
import { CreateCliniqueDto } from './create-clinique.dto';

export class UpdateCliniqueDto extends PartialType(CreateCliniqueDto) {}
