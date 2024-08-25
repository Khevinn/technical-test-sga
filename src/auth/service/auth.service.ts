import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '../dto/login.dto';
import { SignUpDto } from '../dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    private logger: Logger,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const { name, email, password } = signUpDto;

      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new BadRequestException(`Email: ${email} is already registered`);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.userModel.create({
        name,
        email,
        password: hashedPassword,
      });

      this.jwtService.sign({ id: user._id });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error({
        message: `Sign-up failed for email: ${signUpDto.email}.`,
        error,
        context: this.signUp.name,
      });
      throw new InternalServerErrorException(
        'An error occurred during sign-up',
      );
    }
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    try {
      const { email, password } = loginDto;

      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new UnauthorizedException('User with this email does not exist');
      }

      const isPasswordMatched = await bcrypt.compare(password, user.password);

      if (!isPasswordMatched) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const token = this.jwtService.sign({ id: user._id });

      return { token };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error({
        message: `Login failed for email: ${loginDto.email}.`,
        error,
        context: this.login.name,
      });
      throw new InternalServerErrorException('Failed authentication');
    }
  }
}
