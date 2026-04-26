import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { EstimateService } from './estimate.service';
import type { Estimate } from './estimate.model';

@Controller('estimates')
export class EstimateController {
  constructor(private readonly estimateService: EstimateService) {}

  @Post()
  create(@Body() createEstimateDto: CreateEstimateDto): Estimate {
    return this.estimateService.create(createEstimateDto);
  }

  @Get()
  findAll(): Estimate[] {
    return this.estimateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Estimate {
    return this.estimateService.findOne(id);
  }
}
