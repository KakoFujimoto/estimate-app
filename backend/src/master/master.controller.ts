import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateCustomerDto,
  CreateItemMasterDto,
  UpdateCompanyDto,
  UpdateCustomerDto,
  UpdateItemMasterDto,
} from './dto/master.dto';
import { MasterService } from './master.service';

type AuthRequest = {
  user: { userId: number; companyId: number; email: string };
};

@Controller('masters')
@UseGuards(JwtAuthGuard)
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  @Get('company')
  getCompany(@Req() req: AuthRequest) {
    return this.masterService.getCompany(req.user.companyId);
  }

  @Put('company')
  updateCompany(@Body() dto: UpdateCompanyDto, @Req() req: AuthRequest) {
    return this.masterService.updateCompany(req.user.companyId, dto);
  }

  @Get('customers')
  findCustomers(@Req() req: AuthRequest) {
    return this.masterService.findCustomers(req.user.companyId);
  }

  @Post('customers')
  createCustomer(@Body() dto: CreateCustomerDto, @Req() req: AuthRequest) {
    return this.masterService.createCustomer(req.user.companyId, dto);
  }

  @Put('customers/bulk')
  replaceCustomers(
    @Body() customers: UpdateCustomerDto[],
    @Req() req: AuthRequest,
  ) {
    return this.masterService.replaceCustomers(req.user.companyId, customers);
  }

  @Put('customers/:id')
  updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
    @Req() req: AuthRequest,
  ) {
    return this.masterService.updateCustomer(id, req.user.companyId, dto);
  }

  @Delete('customers/:id')
  removeCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.masterService.removeCustomer(id, req.user.companyId);
  }

  @Get('items')
  findItems(@Req() req: AuthRequest) {
    return this.masterService.findItems(req.user.companyId);
  }

  @Post('items')
  createItem(@Body() dto: CreateItemMasterDto, @Req() req: AuthRequest) {
    return this.masterService.createItem(req.user.companyId, dto);
  }

  @Put('items/bulk')
  replaceItems(@Body() items: UpdateItemMasterDto[], @Req() req: AuthRequest) {
    return this.masterService.replaceItems(req.user.companyId, items);
  }

  @Put('items/:id')
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemMasterDto,
    @Req() req: AuthRequest,
  ) {
    return this.masterService.updateItem(id, req.user.companyId, dto);
  }

  @Delete('items/:id')
  removeItem(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.masterService.removeItem(id, req.user.companyId);
  }
}
