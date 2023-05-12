import {
  IsEmail,
  IsOptional,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @MinLength(3, {
    message: 'Username must contain more than 2 symbols',
  })
  @MaxLength(9, {
    message: 'Username must contain less than 10 symbols',
  })
  readonly username: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @MinLength(5, {
    message: 'Password must contain more than 4 symbols',
  })
  @MaxLength(14, {
    message: 'Password must contain less than 15 symbols',
  })
  readonly password: string;

  @IsOptional()
  @MaxLength(299, {
    message: 'Bio must contain less than 300 symbols',
  })
  readonly bio: string;

  @IsOptional()
  @IsUrl()
  readonly image: string;
}
