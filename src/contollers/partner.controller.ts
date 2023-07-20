import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Partner } from 'src/entities/partner.entity';
import { PartnerService } from 'src/services/partner.service';

@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Get()
  async getAllPartners() {
    return this.partnerService.getAllPartners();
  }

  @Get(':id/services')
  async getServicesForPartner(@Param('id') partnerId: number) {
    return this.partnerService.getServicesForPartner(partnerId);
  }

  @Post('/register')
  async createPartner(@Body() partnerData: Partial<Partner>): Promise<Partner> {
    return this.partnerService.createPartner(partnerData);
  }
}
