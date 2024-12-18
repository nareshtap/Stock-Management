import { Test, TestingModule } from '@nestjs/testing';
import { DataImportController } from './data-import.controller';
import { DataImportService } from './data-import.service';

describe('DataImportController', () => {
  let controller: DataImportController;
  let service: DataImportService; // Declare 'service'

  const mockDataImportService = {
    processData: jest.fn().mockResolvedValue({ success: true }),
    readData: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    getAvailableTypesAndCurrencies: jest.fn().mockResolvedValue({
      types: ['Type1', 'Type2'],
      currencies: ['USD', 'EUR'],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataImportController],
      providers: [
        {
          provide: DataImportService,
          useValue: mockDataImportService,
        },
      ],
    }).compile();

    controller = module.get<DataImportController>(DataImportController);
    service = module.get<DataImportService>(DataImportService); // Initialize 'service'
  });

  // it('should be defined', () => {
  //   expect(controller).toBeDefined();
  // });

  describe('importData', () => {
    it('should return a success message when file and dataType are provided', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.csv',
        encoding: '7bit',
        mimetype: 'text/csv',
        buffer: Buffer.from('sample data'),
        size: 1000,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      const result = await controller.importData(mockFile, 'dataType1');
      expect(service.processData).toHaveBeenCalledWith(mockFile, 'dataType1');
      expect(result).toEqual({
        message: 'Data successfully imported!',
        result: { success: true },
      });
    });
  });

  describe('readData', () => {
    it('should return paginated data with default values', async () => {
      const result = await controller.readData('1', '10');
      expect(service.readData).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        'asc',
      );
      expect(result).toEqual({ data: [], total: 0 });
    });

    it('should return paginated data with provided parameters', async () => {
      const result = await controller.readData(
        '2',
        '20',
        'test',
        'name',
        'desc',
      );
      expect(service.readData).toHaveBeenCalledWith(
        2,
        20,
        'test',
        'name',
        'desc',
      );
      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe('getAvailableTypesAndCurrencies', () => {
    it('should return available types and currencies', async () => {
      const result = await controller.getAvailableTypesAndCurrencies();
      expect(service.getAvailableTypesAndCurrencies).toHaveBeenCalled();
      expect(result).toEqual({
        types: ['Type1', 'Type2'],
        currencies: ['USD', 'EUR'],
      });
    });
  });
});
