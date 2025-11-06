export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

export interface TenantContext {
  tenantId: string;
  userId?: string;
  role?: string;
}

export interface JwtPayload {
  sub: string; // Auth0 user ID
  email: string;
  tenantId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface CalculationParams {
  assetValue: number;
  downPayment: number;
  interestRate: number;
  durationMonths: number;
  leaseType: string;
}

export interface AmortizationScheduleItem {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface CalculationResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  amortizationSchedule: AmortizationScheduleItem[];
}
