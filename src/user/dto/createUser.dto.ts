import { IsEmail, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @MinLength(3, {
    message: 'Username must contain more than 2 symbols',
  })
  @MaxLength(9, {
    message: 'Username must contain less than 10 symbols',
  })
  readonly username: string;

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
