import { IsDateString, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateRdvDto {
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    patientId: string;
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    doctorId: string;
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    cliniqueId: string;
    @IsNotEmpty()
    @IsDateString()
    //example : "2023-10-15T14:30:00.000Z"
    rdvDate: string;
    @IsString()
    @IsNotEmpty()
    reason: string;
}
