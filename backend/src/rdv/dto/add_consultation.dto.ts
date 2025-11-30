import { IsEnum, IsNotEmpty, IsOptional, IsString, Validate, ValidateIf } from "class-validator";
import { rdvStatus } from "../entities/rdv.entity";

export class AddConsultationDto {
    @IsEnum(rdvStatus)
    @IsNotEmpty()
    status: rdvStatus
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    examination: string;
    @Validate((o) => o.status === rdvStatus.COMPLETED)
    @IsOptional()
    @IsNotEmpty({ message: 'diagnosis is required when status is COMPLETED' })
    @IsString()
    diagnosis?: string;
    @Validate((o) => o.status === rdvStatus.COMPLETED)
    @IsOptional()
    @IsNotEmpty({ message: 'treatment is required when status is COMPLETED' })
    @IsString()
    treatment?: string;
}