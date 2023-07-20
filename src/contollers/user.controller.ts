import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return await this.userService.register(userData);
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    return await this.userService.login(email, password);
  }
}