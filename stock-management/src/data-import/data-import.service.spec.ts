import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { DataImportService } from './data-import.service';

describe('DataImportService', () => {
  let service: DataImportService;
  let supabaseService: SupabaseService;

  const mockSupabaseService = {
    insertData: jest.fn().mockResolvedValue(true),
    getData: jest.fn().mockResolvedValue({
      data: [{ id: 1, name: 'sample' }],
      total: 1,
    }),
    getDataByCurrencyOrType: jest.fn().mockResolvedValue({
      currencies: ['USD', 'EUR'],
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataImportService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<DataImportService>(DataImportService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });

  describe('processData', () => {
    it('should process valid JSON file and insert data', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.json',
        encoding: '7bit',
        mimetype: 'application/json',
        buffer: Buffer.from(
          JSON.stringify({
            hits: {
              hits: [
                {
                  _source: {
                    symbol: 'AAPL',
                    dateTime: '2024-06-12T12:00:00Z',
                    startPrice: 100,
                    highestPrice: 150,
                    lowestPrice: 90,
                    endPrice: 120,
                    volume: 5000,
                    source: 'test',
                    type: 'stock',
                    currency: 'USD',
                  },
                },
              ],
            },
          }),
        ),
        size: 1024,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      await service.processData(mockFile, 'stock');

      expect(mockSupabaseService.insertData).toHaveBeenCalledWith([
        {
          datatype: 'stock',
          symbol: 'AAPL',
          datetime: '2024-06-12T12:00:00Z',
          startprice: 100,
          highestprice: 150,
          lowestprice: 90,
          endprice: 120,
          volume: 5000,
          source: 'test',
          type: 'stock',
          currency: 'USD',
          metadata: {},
        },
      ]);
    });
  });

  describe('readData', () => {
    it('should return paginated data', async () => {
      const result = await service.readData(1, 10, 'AAPL', 'dateTime', 'asc');

      expect(mockSupabaseService.getData).toHaveBeenCalledWith(
        1,
        10,
        'AAPL',
        'dateTime',
        'asc',
      );
      expect(result).toEqual({
        data: [{ id: 1, name: 'sample' }],
        total: 1,
      });
    });
  });

  describe('getAvailableTypesAndCurrencies', () => {
    it('should return available currencies', async () => {
      const result = await service.getAvailableTypesAndCurrencies();

      expect(mockSupabaseService.getDataByCurrencyOrType).toHaveBeenCalled();
      expect(result).toEqual({
        currencies: ['USD', 'EUR'],
      });
    });
  });
});
