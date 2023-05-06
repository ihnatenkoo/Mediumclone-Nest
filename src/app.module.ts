import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from './tag/tag.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';

@Module({
  imports: [TagModule, TypeOrmModule.forRoot(dataSourceOptions)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
