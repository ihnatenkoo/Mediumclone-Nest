import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { FollowEntity } from './follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FollowEntity])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
