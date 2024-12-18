import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { DataImportService } from './data-import.service';

@Controller('data-import')
export class DataImportController {
  constructor(private readonly dataImportService: DataImportService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async importData(
    @UploadedFile() file: Express.Multer.File,
    @Body('dataType') dataType: string,
  ) {
    if (!file) {
      return { message: 'No file uploaded!' };
    }

    if (!dataType) {
      return { message: 'DataType is required!' };
    }

    // Pass the file and dataType to the service for processing
    try {
      const result = await this.dataImportService.processData(file, dataType);
      return { message: 'Data successfully imported!', result };
    } catch (error) {
      return { message: 'Error while importing data.', error: error.message };
    }
  }

  @Get()
  async readData(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('searchQuery') searchQuery?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    try {
      const pageNumber = parseInt(page, 10) || 1;
      const size = parseInt(pageSize, 10) || 10;
      return await this.dataImportService.readData(
        pageNumber,
        size,
        searchQuery,
        sortBy,
        sortOrder,
      );
    } catch (error) {
      console.log('__readData', error);
    }
  }

  @Get('/getAvailableTypesAndCurrencies')
  async getAvailableTypesAndCurrencies() {
    try {
      return await this.dataImportService.getAvailableTypesAndCurrencies();
    } catch (error) {
      console.log('__readData', error);
    }
  }
}
