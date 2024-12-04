import React from 'react';
import { EmployeeForm } from './EmployeeForm';
import { EmployeeList } from './EmployeeList';
import { PaymentCalendar } from './PaymentCalendar';
import { PaymentSummary } from './PaymentSummary';
import { EmployeePaymentList } from './EmployeePaymentList';
import { ExportButton } from './ExportButton';
import { useEmployees } from '../hooks/useEmployees';
import { Building2, LogOut } from 'lucide-react';
import { useState } from 'react';
import type { Payment, PaymentSummary as Summary } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';
import { calculateDailyPayment } from '../utils/payment';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';

export function Dashboard() {
  const navigate = useNavigate();
  const { employees, fetchEmployees } = useEmployees();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [summary, setSummary] = useState<Summary>({
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0
  });

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

  const handleLogout = () => {
    storage.clearAdminToken();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">
              Trans Kota Kita Payment System
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ExportButton month={selectedDate} />
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <EmployeeForm />
            <EmployeeList />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <PaymentSummary summary={summary} selectedDate={selectedDate} />
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
      </div>
    </div>
  );
}