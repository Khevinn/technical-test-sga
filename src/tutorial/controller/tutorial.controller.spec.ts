import { Test, TestingModule } from '@nestjs/testing';
import { TutorialController } from './tutorial.controller';
import { TutorialService } from '../service/tutorial.service';
import { CreateTutorialDto } from '../dto/create-tutorial.dto';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';

const mockTutorialService = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockCacheManager = {};

describe('TutorialController', () => {
  let controller: TutorialController;
  let service: typeof mockTutorialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [TutorialController],
      providers: [
        {
          provide: TutorialService,
          useValue: mockTutorialService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<TutorialController>(TutorialController);
    service = module.get(TutorialService);

    jest.clearAllMocks();
  });

  it('should create a tutorial and return it', async () => {
    const createTutorialDto: CreateTutorialDto = {
      title: 'First Tutorial',
      content: 'Content 1',
    };

    const result = { id: '1', ...createTutorialDto };
    jest.spyOn(service, 'create').mockResolvedValue(result);

    const response = await controller.create(createTutorialDto);

    expect(service.create).toHaveBeenCalledWith(createTutorialDto);
    expect(response).toEqual(result);
  });

  it('should return a tutorial by ID', async () => {
    const id = '1';
    const result = {
      id,
      title: 'First Tutorial',
      content: 'Content 1',
    };

    jest.spyOn(service, 'findOne').mockResolvedValue(result);

    const response = await controller.findOne(id);

    expect(service.findOne).toHaveBeenCalledWith(id);
    expect(response).toEqual(result);
  });

  it('should return a list of tutorials', async () => {
    const query = {};
    const result = [
      { id: '1', title: 'Tutorial 1', content: 'Content 1' },
      { id: '2', title: 'Tutorial 2', content: 'Content 2' },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue(result);

    const response = await controller.findAll(query);

    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(response).toEqual(result);
  });

  it('should update a tutorial and return the updated tutorial', async () => {
    const id = '1';
    const updateTutorialDto = {
      title: 'Updated Title',
      content: 'Updated content',
    };
    const updatedTutorial = { id, ...updateTutorialDto };

    jest.spyOn(service, 'update').mockResolvedValue(updatedTutorial);

    const response = await controller.update(id, updateTutorialDto);

    expect(service.update).toHaveBeenCalledWith(id, updateTutorialDto);
    expect(response).toEqual(updatedTutorial);
  });

  it('should call remove on the service with the correct id', async () => {
    const id = '1';

    jest.spyOn(service, 'remove').mockResolvedValue(undefined);

    await controller.remove(id);

    expect(service.remove).toHaveBeenCalledWith(id);
    expect(service.remove).toHaveBeenCalledTimes(1);
  });
});
