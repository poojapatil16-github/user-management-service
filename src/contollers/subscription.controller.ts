import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { AuthGuard } from '@nestjs/passport';
import { Subscription } from 'src/entities/subscription.entity';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @UseGuards(AuthGuard('jwt'))
  async subscribe(@Body() subscriptionData: { userId: number, partnerId: number, serviceId: number }) {
    return this.subscriptionService.subscribe(subscriptionData);
  }

  @Post('unsubscribe')
  @UseGuards(AuthGuard('jwt'))
  async unsubscribe(@Body() unsubscriptionData: { userId: number, partnerId: number, serviceId: number }) {
    return this.subscriptionService.unsubscribe(unsubscriptionData);
  }

  @Get('/user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getServicesByPartnerId(@Param('userId') userId: number): Promise<Subscription[]> {
    return this.subscriptionService.getUserSubscriptions(userId);
  }

  @Get('user/:userId/partner/:partnerId')
  @UseGuards(AuthGuard('jwt'))
  async getUserServicesByPartnerId(@Param('userId') userId: number,@Param('partnerId') partnerId: number): Promise<Subscription[]> {
    return this.subscriptionService.getUserSubscriptionsByUserIdAndPartnerId(userId,partnerId);
  }
}