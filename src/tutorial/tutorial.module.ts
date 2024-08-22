import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TutorialSchema } from './schemas/tutorial.schema';
import { TutorialController } from './controller/tutorial.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { TutorialService } from './service/tutorial.service';
// import * as redisStore from 'cache-manager-redis-store';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Tutorial', schema: TutorialSchema }]),
    //Em produção recomendando usar o redis ou outra alternativa para não salvar o cache em memória
    CacheModule.register({
      max: 1000,
      ttl: 100000,
      isGlobal: true,
    }),
  ],
  controllers: [TutorialController],
  providers: [TutorialService, Logger],
})
export class TutorialModule {}
