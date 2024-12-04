import React from 'react';
import { Employee } from '../types';
import { calculateDailyPayment, formatCurrency } from '../utils/payment';
import { Receipt, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentPreviewProps {
  selectedEmployee: Employee | null;
  isLeave: boolean;
  dateRange?: { from: Date; to?: Date };
  selectedDate: Date;
}

export function PaymentPreview({ selectedEmployee, isLeave, dateRange, selectedDate }: PaymentPreviewProps) {
  if (!selectedEmployee) return null;

  const dailyRate = calculateDailyPayment(selectedEmployee.position);
  const daysCount = dateRange?.from && dateRange?.to 
    ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1;
  
  const totalAmount = isLeave ? 0 : dailyRate * daysCount;

  return (
    <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E8F0]">
      <div className="flex items-center mb-4">
        <Receipt className="w-5 h-5 text-[#2D85B2] mr-2" />
        <h3 className="text-sm font-semibold text-[#105283]">Payment Preview</h3>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#46525A]">Daily Rate:</span>
          <span className="text-sm font-medium text-[#105283]">{formatCurrency(dailyRate)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-[#46525A]">Period:</span>
          <div className="flex items-center text-sm text-[#105283]">
            <Calendar className="w-4 h-4 mr-1 text-[#2D85B2]" />
            {dateRange?.from && dateRange?.to ? (
              <span>{format(dateRange.from, 'dd MMM')} - {format(dateRange.to, 'dd MMM yyyy')}</span>
            ) : (
              <span>{format(selectedDate, 'dd MMMM yyyy')}</span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-[#46525A]">Days Count:</span>
          <span className="text-sm font-medium text-[#105283]">{daysCount} days</span>
        </div>

        <div className="pt-3 mt-3 border-t border-[#E2E8F0]">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[#46525A]">Total Amount:</span>
            <span className="text-base font-semibold text-[#105283]">
              {isLeave ? 'Unpaid Leave' : formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}