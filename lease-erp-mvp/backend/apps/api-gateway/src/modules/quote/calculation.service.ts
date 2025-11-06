import { Injectable } from '@nestjs/common';
import { CalculationParams, CalculationResult, AmortizationScheduleItem } from '@app/common/interfaces';

@Injectable()
export class CalculationService {
  /**
   * Calculate monthly payment for a financial lease
   * Formula: P * [r(1+r)^n] / [(1+r)^n - 1]
   * Where:
   * P = Principal (Asset Value - Down Payment)
   * r = Monthly interest rate (Annual Rate / 12)
   * n = Number of months
   */
  calculateMonthlyPayment(params: CalculationParams): number {
    const { assetValue, downPayment, interestRate, durationMonths } = params;

    const principal = assetValue - downPayment;
    const monthlyRate = interestRate / 12;

    if (monthlyRate === 0) {
      // No interest case
      return principal / durationMonths;
    }

    const numerator = monthlyRate * Math.pow(1 + monthlyRate, durationMonths);
    const denominator = Math.pow(1 + monthlyRate, durationMonths) - 1;

    const monthlyPayment = principal * (numerator / denominator);

    return Math.round(monthlyPayment * 100) / 100; // Round to 2 decimals
  }

  /**
   * Generate complete amortization schedule
   */
  generateAmortizationSchedule(params: CalculationParams): AmortizationScheduleItem[] {
    const { assetValue, downPayment, interestRate, durationMonths } = params;

    const principal = assetValue - downPayment;
    const monthlyRate = interestRate / 12;
    const monthlyPayment = this.calculateMonthlyPayment(params);

    const schedule: AmortizationScheduleItem[] = [];
    let balance = principal;

    for (let month = 1; month <= durationMonths; month++) {
      const interest = balance * monthlyRate;
      const principalPayment = monthlyPayment - interest;
      balance -= principalPayment;

      // Ensure balance doesn't go negative due to rounding
      if (month === durationMonths) {
        balance = 0;
      }

      schedule.push({
        month,
        payment: Math.round(monthlyPayment * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        balance: Math.round(Math.max(0, balance) * 100) / 100,
      });
    }

    return schedule;
  }

  /**
   * Calculate complete lease details
   */
  calculate(params: CalculationParams): CalculationResult {
    const monthlyPayment = this.calculateMonthlyPayment(params);
    const schedule = this.generateAmortizationSchedule(params);

    const totalAmount = monthlyPayment * params.durationMonths + params.downPayment;
    const totalInterest = totalAmount - params.assetValue;

    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      amortizationSchedule: schedule,
    };
  }

  /**
   * Calculate effective interest rate (APR)
   */
  calculateAPR(params: CalculationParams): number {
    const monthlyRate = params.interestRate / 12;
    const apr = Math.pow(1 + monthlyRate, 12) - 1;
    return Math.round(apr * 10000) / 100; // Return as percentage with 2 decimals
  }
}
