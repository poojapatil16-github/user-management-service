import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import * as amqp from 'amqplib';
import { Service } from 'src/entities/service.entity';
import { Partner } from 'src/entities/partner.entity';
import { User } from 'src/entities/user.entity';
import axios from 'axios';

@Injectable()
export class SubscriptionService implements OnModuleInit{
  constructor(@InjectRepository(Subscription) private subscriptionRepository: Repository<Subscription>,
              @InjectRepository(Service) private serviceRepository: Repository<Service>,
              @InjectRepository(Partner) private partnereRepository: Repository<Partner>,
              @InjectRepository(User) private userRepository: Repository<User>) {}

  async onModuleInit(): Promise<void> {
    await this.initCallbackQueueListener();
  }

  async subscribe(subscriptionData: { userId: number, partnerId: number, serviceId: number }) {
    const { userId, partnerId, serviceId } = subscriptionData;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const partner = await this.partnereRepository.findOne({ where: { id: partnerId } });
    const service = await this.serviceRepository.findOne({ where: { id: serviceId } });
    
    if (!user || !partner || !service) {
      // Handle the case where user, partner, or service is not found
      return { message: 'User, partner, or service not found' };
    }

    const existingSubscription = await this.findExistingSubscription(user, service);

    if (existingSubscription && existingSubscription.status !== 'unsubscribed') {
      return { message: 'Subscription already exists', status: existingSubscription.status };
    }

    try {

      const response = await this.callApiToSubcribeOrUnsuscribe(user, partner, service, "subscribe");

      // Check the response from the other service and handle accordingly
      if (response.status) {
        // Create a new subscription
        let subscription: Subscription;
        if(!existingSubscription){
          subscription = this.subscriptionRepository.create({
            user,
            service,
            status: 'PENDING',
          });
  
          await this.subscriptionRepository.save(subscription);
        }else{
          subscription = existingSubscription;
          subscription.status = 'PENDING';
        }
        return { message: 'Subscription request sent' , status: subscription.status};
      } else {
        return { message: 'Failed to subscribe', status: existingSubscription.status};
      }
    } catch (error) {
      // Handle any errors that occur during the REST call
      console.error('Error subscribing:', error.message);
      return { message: 'Error subscribing' };
    }
}

  async unsubscribe(unsubscriptionData: { userId: number, partnerId: number, serviceId: number }) {
    //Find the subscription by userId and partnerId
    const { userId, partnerId, serviceId } = unsubscriptionData;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const partner = await this.partnereRepository.findOne({ where: { id: partnerId } });
    const service = await this.serviceRepository.findOne({ where: { id: serviceId } });

    if (!user || !service || !partner) {
      // Handle the case where user or service is not found
      return { message: 'User or service or partner not found' };
    }

    const existingSubscription = await this.findExistingSubscription(user, service);
    if (!existingSubscription) {
      return { message: 'Subscription not found' };
    } else if(existingSubscription.status == 'unsubscribed'){
      return { message: 'Service is already unsubscribed' };
    }

    // Call API to unsubscribe
    const unsubscribeResult = await this.callApiToSubcribeOrUnsuscribe(user, partner, service ,"unsubscribe");

    if (unsubscribeResult.status) {
      existingSubscription.status = 'Pending';
      await this.subscriptionRepository.save(existingSubscription);
      return { message: 'Sent for Unsubscribed successfully' , status: existingSubscription.status};
    } else {
      return { message: 'Failed to unsubscribe' };
    }
  }

  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    return await this.subscriptionRepository
    .createQueryBuilder('subscription')
    .leftJoinAndSelect('subscription.service', 'service')
    .where('subscription.userId = :userId', { userId: userId })
    .getMany();
  }

  async getUserSubscriptionsByUserIdAndPartnerId(userId: number, partnerId: number): Promise<Subscription[]> {
    return await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.service', 'service')
      .where('subscription.userId = :userId', { userId: userId })
      .andWhere('service.partner.id = :partnerId', { partnerId: partnerId })
      .getMany();
  }

  async updateSubscriptionStatus(subscriptionData: any): Promise<void> {
    try {
      const { email,partnerCode,serviceCode,status,subscriptionKey, subscriptionDetails } = subscriptionData;
      const user = await this.userRepository.findOne({ where: { email: email } });
      const service = await this.serviceRepository.findOne({ where: { serviceCode: serviceCode } });
      const partner = await this.partnereRepository.findOne({ where: { partnerCode: partnerCode } });

      if (user && partner && service) {
        const existingSubscription = await this.subscriptionRepository
        .createQueryBuilder('subscription')
        .where('subscription.userId = :userId', { userId: user.id })
        .andWhere('subscription.serviceId = :serviceId', { serviceId: service.id })
        .getOne();

        console.log();
        if (!existingSubscription) {
          throw new NotFoundException(`No subsription found for service ${serviceCode} `);
        }
        existingSubscription.status = status;
        existingSubscription.subscriptionKey = subscriptionKey;
        
        // Save the updated user in the database
        await this.subscriptionRepository.save(existingSubscription);
      }
    }catch (error) {
      if (error instanceof NotFoundException) {
        console.log(error.message);
        return;
      }
      throw error;
    }
  }

  private async initCallbackQueueListener(): Promise<void> {
    const connection = await amqp.connect('amqp://127.0.0.1:5672');
    const channel = await connection.createChannel();

    const queue = 'service_subscription_queue';
    await channel.assertQueue(queue, { durable: false });

    console.log('Waiting for messages in the callback queue...');

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const messageContent = msg.content.toString();
        const subscriptionData = JSON.parse(messageContent);

        // Update the subscription status
        await this.updateSubscriptionStatus(subscriptionData);

        channel.ack(msg);
      }
    });
  }

  private async findExistingSubscription(user: User, service: Service) {
    return await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .where('subscription.userId = :userId', { userId: user.id })
      .andWhere('subscription.serviceId = :serviceId', { serviceId: service.id })
      .getOne();
  }



  private async callApiToSubcribeOrUnsuscribe(user: User, partner: Partner, service: Service, action: string) {
    return await axios.post('http://localhost:4000/subscriptions/'+action, {
      email: user.email,
      partnerCode: partner.partnerCode,
      serviceCode: service.serviceCode,
    });
  }
}
