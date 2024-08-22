/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '../dto/login.dto';
import { SignUpDto } from '../dto/signup.dto';
import { User } from '../schemas/user.schema';
import { AuthService } from './auth.service';

const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const token = 'jwtToken';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const mockJwtService = {
  sign: jest.fn().mockReturnValue('token'),
};

const mockLogger = {
  error: jest.fn(),
};

const signUpDto: SignUpDto = {
  name: 'Khevin',
  email: 'khevin@example.com',
  password: 'Password123',
};

const loginDto: LoginDto = {
  email: 'khevin@example.com',
  password: 'Password123',
};

describe('AuthService', () => {
  const mockUser = {
    _id: '61c0ccf11d7bf83d153d7c06',
    name: 'Khevin',
    email: 'khevin@gmail.com',
    password: 'Password123',
  };

  let authService: AuthService;
  let userModel: typeof mockUserModel;
  let jwtService: JwtService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userModel = module.get<typeof mockUserModel>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signUp', () => {
    it('should register the new user', async () => {
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValueOnce('hashedPassword' as never);
      jest
        .spyOn(userModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockUser));

      jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');

      await authService.signUp(signUpDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: signUpDto.email,
      });

      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email is already registered', async () => {
      mockUserModel.findOne.mockResolvedValue({ email: signUpDto.email });

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return a token if email and password are valid', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(mockUser);

      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await authService.login(loginDto);

      expect(result).toEqual({ token });
      expect(userModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(jwtService.sign).toHaveBeenCalledWith({ id: mockUser._id });
    });

    it('should throw invalid email error', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(1);

      expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw invalid password error', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);

      expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
