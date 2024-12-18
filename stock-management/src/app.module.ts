import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DataImportModule } from './data-import/data-import.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DataImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
