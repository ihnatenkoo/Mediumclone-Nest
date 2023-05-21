import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  PipeTransform,
} from '@nestjs/common';
import { ValidationError, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class BackendValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata) {
    const object = plainToClass(metadata.metatype, value);

    if (typeof object !== 'object') {
      return value;
    }

    const errors = await validate(object);

    if (!errors.length) {
      return value;
    }

    throw new HttpException(
      { errors: this.formatError(errors) },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  formatError(errors: Array<ValidationError>) {
    const result = errors.reduce((acc, error) => {
      acc[error.property] = Object.values(error.constraints);
      return acc;
    }, {});

    return result;
  }
}
