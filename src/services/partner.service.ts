import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from 'src/entities/partner.entity';
import { Service } from 'src/entities/service.entity';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async getAllPartners(): Promise<Partner[]> {
    return this.partnerRepository.find();
  }

  async getServicesForPartner(partnerId: number): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { partner: { id: partnerId } },
    });
  }

  async createPartner(partnerData: Partial<Partner>): Promise<Partner> {
    const newPartner = this.partnerRepository.create(partnerData);
    return this.partnerRepository.save(newPartner);
  }

  async getPartnerById(id: number): Promise<Partner> {
    const partner = await this.partnerRepository.findOne( { where: { id } });
    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }
    return partner;
  }
}
