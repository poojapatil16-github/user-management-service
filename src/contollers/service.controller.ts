// service.controller.ts

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Service } from 'src/entities/service.entity';
import { ServiceService } from 'src/services/service.service'; 
import { PartnerService } from 'src/services/partner.service'; // Import the PartnerService

@Controller('services')
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    private readonly partnerService: PartnerService, // Inject the PartnerService
  ) {}

  @Get()
  async getAllServices() {
    return this.serviceService.getAllServices();
  }

  @Get('partners/:partnerId')
  async getServicesByPartnerId(@Param('partnerId') partnerId: number): Promise<Service[]> {
    return this.serviceService.getServicesByPartnerId(partnerId);
  }

  @Post('partners/:partnerId/services')
  async createService(@Param('partnerId') partnerId: number, @Body() data: Service): Promise<Service> {
    // Fetch the Partner object using the PartnerService
    const partner = await this.partnerService.getPartnerById(partnerId);

    // Create the service and associate it with the partner
    return this.serviceService.createService(partner, data);
  }
}
