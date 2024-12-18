import { Module } from '@nestjs/common';
import { DataImportService } from './data-import.service';
import { DataImportController } from './data-import.controller';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  controllers: [DataImportController],
  providers: [DataImportService, SupabaseService],
})
export class DataImportModule {}
