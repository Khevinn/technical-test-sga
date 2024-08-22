import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../service/auth.service';
import { SignUpDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signUp: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  it('should try signUp', async () => {
    const signUpDto: SignUpDto = {
      name: 'Khevin',
      email: 'khevin@example.com',
      password: 'Password123',
    };

    const result = 'CREATED';
    mockAuthService.signUp.mockResolvedValue(result);

    const response = await authController.signUp(signUpDto);
    expect(response).toBe(result);
    expect(mockAuthService.signUp).toHaveBeenCalledWith(signUpDto);
    expect(mockAuthService.signUp).toHaveBeenCalledTimes(1);
  });

  it('should try login and return the token', async () => {
    const loginDto: LoginDto = {
      email: 'khevin@example.com',
      password: 'Password123',
    };

    const result = { token: 'jwt-token' };
    mockAuthService.login.mockResolvedValue(result);

    const response = await authController.login(loginDto);

    expect(response).toBe(result);

    expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    expect(mockAuthService.login).toHaveBeenCalledTimes(1);
  });
});
