import React from 'react';
import { PaymentSummary } from '../components/PaymentSummary';
import { ExportButton } from '../components/ExportButton';
import { useEmployees } from '../hooks/useEmployees';
import { useState, useEffect } from 'react';
import type { Payment, PaymentSummary as Summary } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';
import { calculateDailyPayment } from '../utils/payment';

export function DashboardPage() {
  const { employees, fetchEmployees } = useEmployees();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [summary, setSummary] = useState<Summary>({
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0
  });

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchPayments();
  }, [selectedDate]);

  const fetchPayments = async () => {
    try {
      const start = startOfMonth(selectedDate).toISOString();
      const end = endOfMonth(selectedDate).toISOString();

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .gte('date', start)
        .lte('date', end);
      
      if (error) throw error;
      
      const mappedPayments = (data || []).map(p => ({
        id: p.id,
        employeeId: p.employee_id,
        date: p.date,
        amount: p.amount,
        status: p.status,
        isLeave: p.is_leave
      }));

      setPayments(mappedPayments);
      calculateSummary(mappedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    }
  };

  const calculateSummary = (payments: Payment[]) => {
    const daysInMonth = getDaysInMonth(selectedDate);
    
    const totalPossibleAmount = employees.reduce((total, employee) => {
      const dailyRate = calculateDailyPayment(employee.position);
      return total + (dailyRate * daysInMonth);
    }, 0);

    const paidAmount = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    setSummary({
      totalAmount: totalPossibleAmount,
      paidAmount: paidAmount,
      unpaidAmount: totalPossibleAmount - paidAmount
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <ExportButton month={selectedDate} />
      </div>

      <PaymentSummary summary={summary} selectedDate={selectedDate} />
    </div>
  );
}