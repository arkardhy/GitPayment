import React, { useState, useMemo } from 'react';
import { Employee, Payment } from '../types';
import { formatCurrency, calculateDailyPayment } from '../utils/payment';
import { format, getDaysInMonth } from 'date-fns';
import { DollarSign, Search } from 'lucide-react';

interface EmployeePaymentListProps {
  employees: Employee[];
  payments: Payment[];
  selectedDate: Date;
}

export function EmployeePaymentList({ employees, payments, selectedDate }: EmployeePaymentListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const getEmployeePayments = (employeeId: string) => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const monthPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return payment.employeeId === employeeId &&
             paymentDate.getMonth() === selectedDate.getMonth() &&
             paymentDate.getFullYear() === selectedDate.getFullYear();
    });

    const employee = employees.find(e => e.id === employeeId);
    const dailyRate = employee ? calculateDailyPayment(employee.position) : 0;
    
    const leaveDays = monthPayments.filter(p => p.isLeave).length;
    const paidDays = monthPayments.filter(p => p.status === 'paid' && !p.isLeave).length;
    const paid = monthPayments
      .filter(p => p.status === 'paid' && !p.isLeave)
      .reduce((sum, p) => sum + p.amount, 0);
    
    const unpaidDays = daysInMonth - paidDays - leaveDays;
    
    return {
      paid,
      dailyRate,
      paidDays,
      unpaidDays,
      leaveDays,
      totalDays: daysInMonth
    };
  };

  return (
    <div className="bg-white rounded-lg shadow mt-8">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Employee Payments - {format(selectedDate, 'MMMM yyyy')}
        </h3>
        
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {filteredEmployees.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No employees found
          </div>
        ) : (
          filteredEmployees.map((employee) => {
            const payments = getEmployeePayments(employee.id);
            return (
              <div key={employee.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{employee.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{employee.position}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Rate: {formatCurrency(payments.dailyRate)}/day
                    </p>
                  </div>
                  <DollarSign className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <p className="text-xs text-gray-500">Paid Days</p>
                    <p className="text-sm font-medium text-green-600">
                      {payments.paidDays} of {payments.totalDays} days
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      {formatCurrency(payments.paid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Leave Days</p>
                    <p className="text-sm font-medium text-orange-600">
                      {payments.leaveDays} days
                    </p>
                    <p className="text-xs text-orange-500 mt-1">
                      {formatCurrency(0)} (Unpaid Leave)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Unpaid Days</p>
                    <p className="text-sm font-medium text-red-600">
                      {payments.unpaidDays} days
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      {formatCurrency(payments.unpaidDays * payments.dailyRate)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}