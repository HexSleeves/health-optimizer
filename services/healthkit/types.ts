// Re-export types from the main types file
export * from '@/types/healthkit';

// Service-specific types

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface HealthKitQueryOptions {
  dateRange?: DateRange;
  limit?: number;
  ascending?: boolean;
}

export interface HealthKitWriteResult {
  success: boolean;
  error?: string;
}
