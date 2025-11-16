import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class CreateCliniqueDto {
        @IsString()
        @IsNotEmpty()
        name : string;
        @IsString()
        @IsNotEmpty()
        address : string;
        @IsPhoneNumber("TN")
        phone : string;
        @IsEmail()
        email : string;
}
