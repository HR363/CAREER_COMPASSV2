import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';
import { USER_ROLES } from '../../common/constants';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(['ADMIN', 'MENTOR', 'STUDENT'])
  role?: string;
}
