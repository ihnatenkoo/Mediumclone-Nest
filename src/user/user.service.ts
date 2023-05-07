import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class UserService {
  createUser(createUserDto: CreateUserDto) {
    return createUserDto;
  }
}
