import { IsEmail, IsOptional, IsPhoneNumber, IsString, Length } from "class-validator"

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    firstName?: string

    @IsString()
    @IsOptional()
    lastName?: string

    @IsEmail()
    @IsOptional()
    email?: string

    @IsPhoneNumber("TN")
    @IsOptional()
    phone?: number

    @IsString()
    @IsOptional()
    @Length(6, 20)
    password?: string

    @IsString()
    @IsOptional()
    speciality?: string
}
