import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { RegistrationResponse } from 'src/interfaces/registration.response';


@Injectable()
export class UserService{
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}


  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<RegistrationResponse> {
    const { email, password, firstName, lastName } = data;
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await this.userRepository.save(newUser);

    const payload = { sub: newUser.id, email };
    const token = jwt.sign(payload, 'secret-key', {
      expiresIn: '1h',
    });

    return { message: 'User registered successfully', token, user: newUser };

  }

  async login(email: string, password: string): Promise<RegistrationResponse> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ email: user.email, id: user.id }, 'secret-key', {
      expiresIn: '1h',
    });

    return { message: 'User registered successfully', token, user: user };
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
