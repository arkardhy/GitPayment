import React, { useState } from 'react';
import { PaymentCalendar } from '../components/PaymentCalendar';
import { EmployeePaymentList } from '../components/EmployeePaymentList';
import { useEmployees } from '../hooks/useEmployees';
import type { Payment } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { startOfMonth, endOfMonth } from 'date-fns';

export function AttendancePage() {
  const { employees, fetchEmployees } = useEmployees();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  React.useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  React.useEffect(() => {
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
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Attendance Calendar</h1>
      
      <div className="space-y-8">
        <PaymentCalendar
          payments={payments}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
        <EmployeePaymentList 
          employees={employees}
          payments={payments}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
}