import React from 'react';
import { supabase } from '../lib/supabase';
import { Download } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'react-hot-toast';
import { calculateDailyPayment } from '../utils/payment';

interface ExportButtonProps {
  month: Date;
}

interface EmployeePaymentSummary {
  employeeName: string;
  position: string;
  totalAmount: number;
  paidDays: number;
  leaveDays: number;
  unpaidDays: number;
  dailyRate: number;
}

export function ExportButton({ month }: ExportButtonProps) {
  const handleExport = async () => {
    const startDate = startOfMonth(month);
    const endDate = endOfMonth(month);
    const daysInMonth = getDaysInMonth(month);

    try {
      // Fetch all employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, position');

      if (employeesError) throw employeesError;

      // Fetch all payments for the month
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());

      if (paymentsError) throw paymentsError;

      // Calculate summary for each employee
      const summaries: EmployeePaymentSummary[] = (employees || []).map(employee => {
        const employeePayments = (payments || []).filter(p => p.employee_id === employee.id);
        const dailyRate = calculateDailyPayment(employee.position);
        const paidDays = employeePayments.filter(p => p.status === 'paid' && !p.is_leave).length;
        const leaveDays = employeePayments.filter(p => p.is_leave).length;
        const unpaidDays = daysInMonth - paidDays - leaveDays;
        const totalAmount = paidDays * dailyRate;

        return {
          employeeName: employee.name,
          position: employee.position,
          totalAmount,
          paidDays,
          leaveDays,
          unpaidDays,
          dailyRate
        };
      });

      // Create CSV content with headers
      const headers = [
        'Employee Name',
        'Position',
        'Daily Rate',
        'Total Paid Days',
        'Leave Days',
        'Unpaid Days',
        'Total Working Days',
        'Total Amount'
      ];

      const rows = summaries.map(summary => [
        summary.employeeName,
        summary.position,
        summary.dailyRate,
        summary.paidDays,
        summary.leaveDays,
        summary.unpaidDays,
        daysInMonth,
        summary.totalAmount
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-summary-${format(month, 'yyyy-MM')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Payment summary exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export payment summary');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    >
      <Download className="w-4 h-4 mr-2" />
      Export Summary
    </button>
  );
}