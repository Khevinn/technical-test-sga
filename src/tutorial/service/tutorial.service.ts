import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Tutorial } from '../schemas/tutorial.schema';
import { CreateTutorialDto } from '../dto/create-tutorial.dto';
import { SearchTutorialDto } from '../dto/search-tutorial.dto';
import { UpdateTutorialDto } from '../dto/update-tutorial.dto';

@Injectable()
export class TutorialService {
  constructor(
    @InjectModel('Tutorial') private readonly tutorialModel: Model<Tutorial>,
    private logger: Logger,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createTutorialDto: CreateTutorialDto): Promise<Tutorial> {
    try {
      const existingTutorial = await this.tutorialModel.findOne({
        title: createTutorialDto.title,
      });

      if (existingTutorial) {
        throw new ConflictException('Title already exists');
      }

      const createdTutorial =
        await this.tutorialModel.create(createTutorialDto);
      return createdTutorial;
    } catch (error) {
      this.logger.error({
        message: error,
        error,
        context: this.create.name,
      });
      throw new InternalServerErrorException(
        'An error occurred while creating the tutorial',
      );
    }
  }

  async findOne(id: string): Promise<Tutorial> {
    try {
      const tutorial = await this.tutorialModel.findById(id);
      if (!tutorial) {
        throw new NotFoundException('Tutorial not found');
      }
      return tutorial;
    } catch (error) {
      this.logger.error({
        message: error,
        error,
        context: this.create.name,
      });
      throw new InternalServerErrorException(
        'An error occurred while retrieving the tutorial',
      );
    }
  }

  async findAll(query: SearchTutorialDto): Promise<Tutorial[]> {
    try {
      const { pageSize = 1, pageNumber = 10 } = query;

      const filters = this.buildFilters(query);
      const hasFilters = Object.keys(filters).length > 0;

      if (!hasFilters) {
        const tutorialsCache: Tutorial[] = await this.cacheManager.get('key');
        if (tutorialsCache) {
          return tutorialsCache;
        }
      }

      const tutorials = await this.tutorialModel
        .find(filters)
        .skip((pageSize - 1) * pageNumber)
        .limit(Number(pageNumber))
        .exec();

      if (hasFilters) {
        await this.cacheManager.del('key');
      } else {
        await this.cacheManager.set('key', tutorials);
      }

      return tutorials;
    } catch (error) {
      this.logger.error({
        message: error,
        error,
        context: this.findAll.name,
      });
      throw new InternalServerErrorException('Failed to retrieve tutorials');
    }
  }

  async update(
    id: string,
    updateTutorialDto: UpdateTutorialDto,
  ): Promise<Tutorial> {
    try {
      const updatedTutorial = await this.tutorialModel.findByIdAndUpdate(
        id,
        { $set: updateTutorialDto },
        { new: true, runValidators: true },
      );

      if (!updatedTutorial) {
        throw new NotFoundException('Tutorial not found');
      }

      return updatedTutorial;
    } catch (error) {
      this.logger.error({
        message: error,
        error,
        context: this.update.name,
      });
      throw new InternalServerErrorException('Failed to update tutorial');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.tutorialModel.findByIdAndDelete(id);

      if (!result) {
        throw new NotFoundException('Tutorial not found');
      }
    } catch (error) {
      this.logger.error({
        message: error,
        error,
        context: this.remove.name,
      });
      throw new InternalServerErrorException('Failed to remove tutorial');
    }
  }

  //Pontos de melhoria, outra abordagem para remover esses ifs aninhados
  buildFilters(query: SearchTutorialDto) {
    const { title, createdAt, updatedAt } = query;
    const filters: any = {};

    if (title) {
      filters.title = { $regex: title, $options: 'i' };
    }

    if (createdAt) {
      const startOfDay = new Date(createdAt);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(createdAt);
      endOfDay.setUTCHours(23, 59, 59, 999);
      filters.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    if (updatedAt) {
      const startOfDay = new Date(updatedAt);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(updatedAt);
      endOfDay.setUTCHours(23, 59, 59, 999);
      filters.updatedAt = { $gte: startOfDay, $lte: endOfDay };
    }

    return filters;
  }
}
