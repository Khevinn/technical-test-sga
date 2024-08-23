import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTutorialDto } from '../dto/create-tutorial.dto';
import { SearchTutorialDto } from '../dto/search-tutorial.dto';
import { UpdateTutorialDto } from '../dto/update-tutorial.dto';
import { Tutorial } from '../schemas/tutorial.schema';
import { TutorialService } from './tutorial.service';

const mockTutorialModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

const mockLogger = {
  error: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const id = '321';

describe('TutorialService', () => {
  let service: TutorialService;
  let tutorialModel: typeof mockTutorialModel;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorialService,
        { provide: getModelToken(Tutorial.name), useValue: mockTutorialModel },
        { provide: Logger, useValue: mockLogger },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<TutorialService>(TutorialService);
    tutorialModel = module.get<typeof mockTutorialModel>(
      getModelToken(Tutorial.name),
    );
  });

  describe('create', () => {
    it('should create a tutorial and return it', async () => {
      const createTutorialDto: CreateTutorialDto = {
        title: 'New Tutorial',
        content: 'Tutorial Content',
      };
      const createdTutorial = { ...createTutorialDto, _id: '1' };

      jest.spyOn(tutorialModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(tutorialModel, 'create').mockResolvedValue(createdTutorial);

      const result = await service.create(createTutorialDto);

      expect(result).toEqual(createdTutorial);
      expect(tutorialModel.findOne).toHaveBeenCalledWith({
        title: createTutorialDto.title,
      });
      expect(tutorialModel.create).toHaveBeenCalledWith(createTutorialDto);
    });

    it('should throw an error if tutorial with the same title already exists', async () => {
      const createTutorialDto: CreateTutorialDto = {
        title: 'Duplicate Title',
        content: 'Tutorial Content',
      };
      const existingTutorial = { ...createTutorialDto, _id: '1' };

      jest.spyOn(tutorialModel, 'findOne').mockResolvedValue(existingTutorial);

      await expect(service.create(createTutorialDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(tutorialModel.findOne).toHaveBeenCalledWith({
        title: createTutorialDto.title,
      });
      expect(tutorialModel.create).not.toHaveBeenCalled();
    });

    it('should throw an error if an unexpected error occurs', async () => {
      const createTutorialDto: CreateTutorialDto = {
        title: 'New Tutorial',
        content: 'Tutorial Content',
      };

      jest
        .spyOn(tutorialModel, 'findOne')
        .mockRejectedValue(new Error('Unexpected Error'));

      await expect(service.create(createTutorialDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(tutorialModel.findOne).toHaveBeenCalledWith({
        title: createTutorialDto.title,
      });
      expect(tutorialModel.create).not.toHaveBeenCalled();
    });

    describe('findOne', () => {
      it('should return a tutorial if found', async () => {
        const tutorial = {
          _id: id,
          title: 'Test Tutorial',
          content: 'content test',
        };

        mockTutorialModel.findById.mockResolvedValue(tutorial);

        const result = await service.findOne(id);

        expect(result).toEqual(tutorial);
        expect(mockTutorialModel.findById).toHaveBeenCalledWith(id);
      });

      it('should throw a error if tutorial not found', async () => {
        mockTutorialModel.findById.mockResolvedValue(null);

        await expect(service.findOne(id)).rejects.toThrow(
          InternalServerErrorException,
        );
        expect(mockTutorialModel.findById).toHaveBeenCalledWith(id);
      });

      it('should throw an error if an unexpected error occurs', async () => {
        mockTutorialModel.findById.mockRejectedValue(
          new Error('Database error'),
        );

        await expect(service.findOne(id)).rejects.toThrow(
          InternalServerErrorException,
        );
        expect(mockTutorialModel.findById).toHaveBeenCalledWith(id);
      });
    });

    describe('findAll', () => {
      it('should return tutorials from cache if available', async () => {
        const cachedTutorials: Tutorial[] = [
          {
            title: 'Cached Tutorial',
            content: 'This is cached',
          },
        ];

        mockCacheManager.get.mockResolvedValue(cachedTutorials);

        const result = await service.findAll({});

        expect(result).toEqual(cachedTutorials);
        expect(mockCacheManager.get).toHaveBeenCalledWith('key');
        expect(mockTutorialModel.find).not.toHaveBeenCalled();
      });

      it('should return tutorials with filters applied and cache the result', async () => {
        const query: SearchTutorialDto = {
          title: 'Test',
          createdAt: '2024-01-01',
          updatedAt: '2024-12-31',
          pageSize: 1,
          pageNumber: 10,
        };

        const filteredTutorials: Tutorial[] = [
          {
            title: 'Filtered Tutorial',
            content: 'Filtered content',
          },
        ];

        mockCacheManager.get.mockResolvedValue(null);
        mockCacheManager.del.mockResolvedValue(true);

        mockTutorialModel.find.mockReturnValueOnce(mockTutorialModel);
        mockTutorialModel.skip.mockReturnValueOnce(mockTutorialModel);
        mockTutorialModel.limit.mockReturnValueOnce(mockTutorialModel);
        mockTutorialModel.exec.mockResolvedValue(filteredTutorials);

        const result = await service.findAll(query);

        expect(result).toEqual(filteredTutorials);
      });

      it('should throw an error if an error occurs during data retrieval', async () => {
        const query: SearchTutorialDto = {
          title: 'Test',
          createdAt: '2024-01-01',
          updatedAt: '2024-12-31',
          pageSize: 1,
          pageNumber: 10,
        };

        mockCacheManager.get.mockResolvedValue(null);
        mockTutorialModel.find.mockReturnValue(mockTutorialModel);
        mockTutorialModel.skip.mockReturnValue(mockTutorialModel);
        mockTutorialModel.limit.mockReturnValue(mockTutorialModel);
        mockTutorialModel.exec.mockRejectedValue(new Error('Database error'));

        await expect(service.findAll(query)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });

    describe('update', () => {
      it('should update a tutorial and return it', async () => {
        const updateDto: UpdateTutorialDto = {
          title: 'Updated Title',
          content: 'Updated content',
        };
        const updatedTutorial: Tutorial = {
          id,
          ...updateDto,
        } as any;

        mockTutorialModel.findByIdAndUpdate.mockResolvedValue(updatedTutorial);

        const result = await service.update(id, updateDto);

        expect(result).toEqual(updatedTutorial);
        expect(mockTutorialModel.findByIdAndUpdate).toHaveBeenCalledWith(
          id,
          { $set: updateDto },
          { new: true, runValidators: true },
        );
      });

      it('should throw an error if the tutorial is not found', async () => {
        const updateDto: UpdateTutorialDto = {
          title: 'Updated Title',
          content: 'Updated content',
        };

        mockTutorialModel.findByIdAndUpdate.mockResolvedValue(null);

        await expect(service.update(id, updateDto)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });

    describe('delete', () => {
      it('should remove a tutorial successfully', async () => {
        const removedTutorial: Tutorial = { id } as any;

        mockTutorialModel.findByIdAndDelete.mockResolvedValue(removedTutorial);

        await expect(service.remove(id)).resolves.toBeUndefined();
        expect(mockTutorialModel.findByIdAndDelete).toHaveBeenCalledWith(id);
      });

      it('should throw InternalServerErrorException on unexpected error', async () => {
        mockTutorialModel.findByIdAndDelete.mockRejectedValue(
          new Error('Database error'),
        );

        await expect(service.remove(id)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });
  });
});
