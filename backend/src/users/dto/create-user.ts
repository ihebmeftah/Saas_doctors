import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Length } from "class-validator"

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
}