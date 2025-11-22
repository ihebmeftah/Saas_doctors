import { IsEmail, IsInt, IsOptional, IsPhoneNumber, IsString, Length, Min } from "class-validator"

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

    @IsString()
    @IsOptional()
    cin?: string

    @IsInt()
    @Min(0)
    @IsOptional()
    age?: number

    @IsString()
    @IsOptional()
    gender?: string
}
