import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, Min } from "class-validator"

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    firstName: string
    @IsString()
    @IsNotEmpty()
    lastName: string
    @IsEmail()
    email: string
    @IsPhoneNumber("TN")
    @IsNotEmpty()
    phone: number
    @IsString()
    @IsNotEmpty()
    @Length(6, 20)
    password: string
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