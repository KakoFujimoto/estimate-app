import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, PasswordResetDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('password-reset')
  passwordReset(@Body() dto: PasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }
}
