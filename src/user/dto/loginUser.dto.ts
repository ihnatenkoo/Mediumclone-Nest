import { IsEmail, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  readonly email: string;

  @MinLength(5, {
    message: 'Password must contain more than 4 symbols',
  })
  @MaxLength(14, {
    message: 'Password must contain less than 15 symbols',
  })
  readonly password: string;
}
