import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const SUPABASE_URL = this.configService.get<string>('SUPABASE_URL');

    const SUPABASE_ANON_KEY =
      this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase URL or Key is missing');
    }

    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // Example: Function to get data from a Supabase table
  async getData(
    page: number,
    pageSize: number,
    searchQuery?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Base query
      let query = this.supabase
        .from('stockdata')
        .select('*', { count: 'exact' });

      if (searchQuery) {
        const searchTerm = `%${searchQuery}%`;

        // Fields to search in
        const fields = ['symbol', 'datatype', 'source', 'type', 'currency'];

        const orConditions = fields
          .map((field) => `${field}.ilike.${searchTerm}`)
          .join(',');

        // Apply the OR condition to the query
        query = query.or(orConditions);
      }

      // Apply sorting if provided
      if (sortBy) {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        data,
        totalRecords: count || 0,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error) {}
  }

  // Example: Function to insert data into a Supabase table
  async insertData(newData: any) {
    const { data, error } = await this.supabase
      .from('stockdata')
      .insert(newData);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async getDataByCurrencyOrType() {
    try {
      const { data, error } = await this.supabase
        .from('stockdata')
        .select('currency', { count: 'exact' })
        .neq('currency', null);

      const currencies = Array.from(new Set(data.map((item) => item.currency)));

      return { currencies };
    } catch (error) {
      throw new Error('An error occurred while fetching data.');
    }
  }
}
