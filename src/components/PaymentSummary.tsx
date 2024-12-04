import React from 'react';
import { PaymentSummary as Summary } from '../types';
import { formatCurrency } from '../utils/payment';
import { CheckCircle } from 'lucide-react';
import { format, getDaysInMonth } from 'date-fns';

interface PaymentSummaryProps {
  summary: Summary;
  selectedDate: Date;
}

export function PaymentSummary({ summary, selectedDate }: PaymentSummaryProps) {
  const totalDaysInMonth = getDaysInMonth(selectedDate);
  const paidDaysCount = Math.round(summary.paidAmount / (summary.totalAmount / totalDaysInMonth)) || 0;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Payment Summary for {format(selectedDate, 'MMMM yyyy')}
        </h2>
      </div>
      
      <div className="max-w-md">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid Amount ({paidDaysCount} days)</p>
              <p className="text-2xl font-semibold text-green-600">
                {formatCurrency(summary.paidAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}