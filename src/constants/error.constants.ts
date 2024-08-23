import { HttpStatus } from '@nestjs/common';

export interface IError {
  statusCode: HttpStatus;
  message: string;
}

export default {
  ERROR_NOT_FOUND_TUTORIAL: {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'Tutorial not found',
  },
  ERROR_TITLE_ALREADY_EXISTS: {
    statusCode: HttpStatus.CONFLICT,
    message: 'Title already exists',
  },
};
