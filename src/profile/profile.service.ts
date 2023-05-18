import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileService {
  getProfile(username: string) {
    return username;
  }
}
