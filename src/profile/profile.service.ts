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

  async getProfile(
    username: string,
    currentUserId: number | null,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
    }

    if (currentUserId) {
      const followingRecord = await this.followRepository.findOne({
        where: { followerId: currentUserId, followingId: user.id },
      });

      return { ...user, following: Boolean(followingRecord) };
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

    const followRecord = await this.followRepository.findOne({
      where: { followerId: currentUserId, followingId: followingUser.id },
    });

    if (!followRecord) {
      const followRecord = new FollowEntity();
      followRecord.followerId = currentUserId;
      followRecord.followingId = followingUser.id;
      await this.followRepository.save(followRecord);
    }

    return { ...followingUser, following: true };
  }

  async unfollowProfile(
    currentUserId: number,
    unfollowUsername: string,
  ): Promise<ProfileType> {
    const unfollowUser = await this.userRepository.findOne({
      where: { username: unfollowUsername },
    });

    if (!unfollowUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (unfollowUser.id === currentUserId) {
      throw new HttpException(
        'You cant unfollow of yourself',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: unfollowUser.id,
    });

    return { ...unfollowUser, following: false };
  }

  buildProfileResponse(profile: ProfileType): IProfileResponse {
    const { username, bio, image, following } = profile;

    return { profile: { username, bio, image, following } };
  }
}
