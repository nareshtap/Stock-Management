import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DataImportService {
  constructor(private supabaseService: SupabaseService) {}

  async processData(file: Express.Multer.File, dataType: string) {
    const fileContent = file.buffer.toString('utf-8');

    let jsonData;
    try {
      jsonData = JSON.parse(fileContent);
      let data = jsonData?.hits?.hits || [];

      data = data.map(({ _source }) => {
        const {
          symbol,
          dateTime,
          startPrice,
          highestPrice,
          lowestPrice,
          endPrice,
          volume,
          source,
          type,
          currency,
          candleType,
          ...rest
        } = _source;

        return {
          datatype: dataType,
          symbol,
          datetime: dateTime || new Date(),
          startprice: startPrice || 0,
          highestprice: highestPrice || 0,
          lowestprice: lowestPrice || 0,
          endprice: endPrice || 0,
          volume: volume || 0,
          source,
          type: type || candleType,
          currency,
          metadata: rest,
        };
      });

      await this.supabaseService.insertData(data);
    } catch (error) {
      console.log('__error', error);
      throw new Error('Invalid JSON file content!');
    }
  }

  async readData(
    page: number,
    pageSize: number,
    searchQuery?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    try {
      return await this.supabaseService.getData(
        page,
        pageSize,
        searchQuery,
        sortBy,
        sortOrder,
      );
    } catch (error) {
      console.log('__readData', error);
    }
  }

  async getAvailableTypesAndCurrencies() {
    try {
      const { currencies } =
        await this.supabaseService.getDataByCurrencyOrType();
      return { currencies };
    } catch (error) {
      console.error('Error in getAvailableTypesAndCurrencies:', error);
      throw new Error('An error occurred while fetching data.');
    }
  }
}
