import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CreateTutorialDto } from '../dto/create-tutorial.dto';
import { UpdateTutorialDto } from '../dto/update-tutorial.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { TutorialService } from '../service/tutorial.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('tutorial')
@Controller('tutorial')
export class TutorialController {
  constructor(private readonly tutorialService: TutorialService) {}
  @Post()
  async create(@Body() createTutorialDto: CreateTutorialDto) {
    return this.tutorialService.create(createTutorialDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tutorialService.findOne(id);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  async findAll(@Query() query: any) {
    return this.tutorialService.findAll(query);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTutorialDto: UpdateTutorialDto,
  ) {
    return this.tutorialService.update(id, updateTutorialDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.tutorialService.remove(id);
  }
}
