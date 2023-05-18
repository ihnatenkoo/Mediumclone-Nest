import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { IProfileResponse } from './types/profileResponse.interface';
import { ProfileType } from './types/profile.type';
import { FollowEntity } from './follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async getProfile(username: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    return { ...user, following: false };
  }

  async followProfile(
    currentUserId: number,
    followingUsername: string,
  ): Promise<ProfileType> {
    const followingUser = await this.userRepository.findOne({
      where: { username: followingUsername },
    });

    if (!followingUser) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    if (currentUserId === followingUser.id) {
      throw new HttpException(
        'Follower and following cant be equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    const follow = await this.followRepository.findOne({
      where: { followerId: currentUserId, followingId: followingUser.id },
    });

    if (!follow) {
      const followRecord = new FollowEntity();
      followRecord.followerId = currentUserId;
      followRecord.followingId = followingUser.id;
      await this.followRepository.save(followRecord);
    }

    return { ...followingUser, following: true };
  }

  buildProfileResponse(profile: ProfileType): IProfileResponse {
    const { username, bio, image, following } = profile;

    return { profile: { username, bio, image, following } };
  }
}
