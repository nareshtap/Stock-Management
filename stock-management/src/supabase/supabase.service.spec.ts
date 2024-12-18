import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('SupabaseService', () => {
  let service: SupabaseService;
  let configService: ConfigService;
  let supabaseMock: any;

  beforeEach(async () => {
    // Mock SupabaseClient methods
    supabaseMock = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: [],
            error: null,
            count: 0,
          }),
        }),
        insert: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    };

    // Mock the createClient function to return the mock supabase client
    (createClient as jest.Mock).mockReturnValue(supabaseMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'SUPABASE_URL') return 'https://fakeurl.supabase.co';
              if (key === 'SUPABASE_ANON_KEY') return 'fakeanonkey';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('insertData', () => {
    it('should insert new data and return inserted data', async () => {
      const newData = { symbol: 'AAPL', price: 150 };
      const mockInsertedData = [{ id: 1, ...newData }];

      // Mock the response for insert
      supabaseMock.from.mockReturnValue({
        insert: jest
          .fn()
          .mockResolvedValue({ data: mockInsertedData, error: null }),
      });

      const result = await service.insertData(newData);

      expect(result).toEqual(mockInsertedData);
    });

    it('should throw an error if insert fails', async () => {
      const newData = { symbol: 'AAPL', price: 150 };
      const mockError = { message: 'Error inserting data' };

      supabaseMock.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      try {
        await service.insertData(newData);
      } catch (error) {
        expect(error.message).toBe(mockError.message);
      }
    });
  });

  describe('getData', () => {
    it('should return paginated and sorted data', async () => {
      const mockData = [
        { id: 1, symbol: 'AAPL', price: 150 },
        { id: 2, symbol: 'GOOGL', price: 2800 },
      ];
      const mockCount = 2;

      supabaseMock.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockResolvedValue({
            data: mockData,
            error: null,
            count: mockCount,
          }),
        }),
      });

      const result = await service.getData(1, 2, 'AAPL', 'price', 'asc');

      expect(result.data).toEqual(mockData);
      expect(result.totalRecords).toBe(mockCount);
      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(1);
    });
  });

  it('should return empty data if no results match the search query', async () => {
    const mockData = [];
    const mockCount = 0;

    supabaseMock.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest
          .fn()
          .mockResolvedValue({ data: mockData, error: null, count: mockCount }),
      }),
    });

    const result = await service.getData(
      1,
      2,
      'non-existent-symbol',
      'price',
      'asc',
    );

    expect(result.data).toEqual(mockData);
    expect(result.totalRecords).toBe(mockCount);
  });

  it('should throw an error if Supabase query fails', async () => {
    const mockError = { message: 'Error fetching data' };

    // Mock the query to simulate a Supabase error
    supabaseMock.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest
          .fn()
          .mockResolvedValue({ data: null, error: mockError, count: 0 }),
      }),
    });

    try {
      await service.getData(1, 2, 'AAPL', 'price', 'asc');
    } catch (error) {
      expect(error.message).toBe(mockError.message);
    }
  });

  describe('getDataByCurrencyOrType', () => {
    it('should return currencies (USD, EUR) on successful data fetch', async () => {
      const mockData = [
        { currency: 'USD' },
        { currency: 'EUR' },
        { currency: 'USD' },
      ];

      supabaseMock.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          neq: jest.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      });

      const result = await service.getDataByCurrencyOrType();
      expect(result.currencies).toEqual(['USD', 'EUR']);
    });

    it('should throw an error when Supabase query fails', async () => {
      const mockResponse = {
        data: null,
        error: new Error('An error occurred while fetching data.'),
      };

      supabaseMock.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          neq: jest.fn().mockResolvedValue(mockResponse),
        }),
      });

      await expect(service.getDataByCurrencyOrType()).rejects.toThrow(
        'An error occurred while fetching data.',
      );
    });

    it('should throw an error for unexpected errors', async () => {
      supabaseMock.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(service.getDataByCurrencyOrType()).rejects.toThrow(
        'An error occurred while fetching data.',
      );
    });
  });
});
