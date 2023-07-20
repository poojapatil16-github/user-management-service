import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UserController } from './contollers/user.controller';
import { SubscriptionController } from './contollers/subscription.controller';
import { SubscriptionService } from './services/subscription.service';
import { Subscription } from './entities/subscription.entity';
import { UserRepository } from './repositories/user.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { PartnerController } from './contollers/partner.controller';
import { ServiceController } from './contollers/service.controller';
import { PartnerService } from './services/partner.service';
import { ServiceService } from './services/service.service';
import { Partner } from './entities/partner.entity';
import { Service } from './entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'rootroot',
      database: 'userManagement',
      entities: [User,Subscription, Partner, Service],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([User, UserRepository, Subscription, Partner, Service]),
    PassportModule,
    JwtModule.register({
      secret: 'secret-key', // Replace with your own secret key
      signOptions: { expiresIn: '1h' }, // Replace with your desired token expiration
    }),
  ],
  controllers: [UserController, SubscriptionController, PartnerController, ServiceController],
  providers: [UserService, PartnerService, ServiceService, SubscriptionService, JwtStrategy],
})
export class AppModule {}