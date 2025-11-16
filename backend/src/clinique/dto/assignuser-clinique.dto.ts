import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { userRole } from 'src/users/entities/user.entity';

export class AssignUserCliniqueDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  cliniqueId: string;
  @IsIn([userRole.DOCTOR, userRole.RECEP])
  role: userRole;
  @IsNotEmpty({ each: true })
  @IsUUID('4', { each: true })
  userIds: string[];
}
