import { Injectable } from '@nestjs/common';

@Injectable()
export class TagService {
  findAll() {
    return ['reactjs', 'angularjs'];
  }
}
