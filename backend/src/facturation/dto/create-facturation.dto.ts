import { IsString, IsNumber, IsOptional, IsDate, IsUUID, IsEnum } from 'class-validator';
import { FacturationStatus } from '../entities/facturation.entity';

export class CreateFacturationDto {
    @IsUUID()
    patientId: string;

    @IsUUID()
    cliniqueId: string;

    @IsOptional()
    @IsUUID()
    rdvId?: string;

    @IsNumber()
    totalAmount: number;

    @IsOptional()
    @IsNumber()
    taxAmount?: number;

    @IsOptional()
    @IsNumber()
    discountAmount?: number;

    @IsOptional()
    @IsDate()
    dueDate?: Date;

    @IsOptional()
    @IsString()
    description?: string;
}
