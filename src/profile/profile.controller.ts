import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { User } from 'src/user/decorators/user.decorator';
import { IProfileResponse } from './types/profileResponse.interface';
import { ProfileService } from './profile.service';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @Param('username') username: string,
  ): Promise<IProfileResponse> {
    const profile = await this.profileService.getProfile(username);

    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @User('id') currentUserId: number,
    @Param('username') followingUsername: string,
  ): Promise<IProfileResponse> {
    const profile = await this.profileService.followProfile(
      currentUserId,
      followingUsername,
    );

    return this.profileService.buildProfileResponse(profile);
  }
}
