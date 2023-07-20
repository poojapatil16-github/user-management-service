import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from 'src/entities/service.entity'; 
import { Partner } from 'src/entities/partner.entity';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async getAllServices(): Promise<Service[]> {
    return this.serviceRepository.find();
  }

  async getServicesByPartnerId(partnerid: number): Promise<Service[]> {
    return this.getAllServicesWithPartnerDetails(partnerid);
  }

  async createService(partner: Partner, data: Service): Promise<Service> {
    const service = this.serviceRepository.create({
        ...data,
        partner, // Assign the partner to the service
      });
      return this.serviceRepository.save(service);
  }

  private async getAllServicesWithPartnerDetails(partnerid: number) {
    return await this.serviceRepository
      .createQueryBuilder('service')
      .where('service.partnerId = :partnerId', { partnerId: partnerid })
      .getMany();
  }
}
