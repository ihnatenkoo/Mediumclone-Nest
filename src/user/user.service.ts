import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from './user.entity';
import { IUserResponse } from './types/userResponse.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async createUser(creteUserDto: CreateUserDto): Promise<UserEntity> {
    const newUser = new UserEntity();
    Object.assign(newUser, creteUserDto);
    return await this.userRepository.save(newUser);
  }

  generateJwt(user: UserEntity): string {
    return sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
      },
    );
  }

  buildUserResponse(user: UserEntity): IUserResponse {
    const { id, password, ...userResponse } = user;
    return {
      user: {
        ...userResponse,
        token: this.generateJwt(user),
      },
    };
  }
}
