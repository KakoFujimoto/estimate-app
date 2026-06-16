import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEstimateDto, UpdateEstimateDto } from './dto/estimate.dto';
import { EstimateService } from './estimate.service';

type AuthRequest = {
  user: { userId: number; companyId: number; email: string };
};

@Controller('estimates')
@UseGuards(JwtAuthGuard)
export class EstimateController {
  constructor(private readonly estimateService: EstimateService) {}

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.estimateService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.estimateService.findOne(id, req.user.companyId);
  }

  @Post()
  create(@Body() dto: CreateEstimateDto, @Req() req: AuthRequest) {
    return this.estimateService.create(req.user.companyId, dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstimateDto,
    @Req() req: AuthRequest,
  ) {
    return this.estimateService.update(id, req.user.companyId, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    await this.estimateService.remove(id, req.user.companyId);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.estimateService.duplicate(id, req.user.companyId);
  }
}
