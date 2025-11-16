import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { userRole } from 'src/users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guard/auth.guard';
import { CurrUser } from 'src/shared/decorators/loggeduser.decorator';
import type { LoggedUser } from './strategy/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('curr')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@CurrUser() currUser: LoggedUser) {
    return currUser;
  }
}
