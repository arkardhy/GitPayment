import React, { useState } from 'react';
import { format, eachDayOfInterval } from 'date-fns';
import { DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { SupervisorInput } from './SupervisorInput';
import { sendPaymentNotification } from '../lib/discord';
import type { DateRange, Employee } from '../types';
import { calculateDailyPayment, cancelPreviousLeaves } from '../utils/payment';

interface PaymentActionsProps {
  selectedDate: Date;
  dateRange?: DateRange;
  selectedEmployee: Employee | null;
  onPaymentRecorded?: () => void;
}

export function PaymentActions({ 
  selectedDate, 
  dateRange, 
  selectedEmployee,
  onPaymentRecorded 
}: PaymentActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [isLeave, setIsLeave] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSupervisorChange = (value: string) => {
    setSelectedSupervisor(value);
    setError(null);

    if (value && selectedEmployee) {
      const [supervisorId] = value.split('|');
      if (supervisorId === selectedEmployee.id) {
        setError('Supervisor cannot record payments for themselves');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSupervisor) {
      toast.error('Please select a supervisor');
      return;
    }
    
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    const [supervisorId] = selectedSupervisor.split('|');
    if (supervisorId === selectedEmployee.id) {
      toast.error('Supervisor cannot record payments for themselves');
      return;
    }

    // Check if employee is in non-paid position
    if (selectedEmployee.position === 'direksi' || selectedEmployee.position === 'komisaris utama') {
      toast.error('This position is not eligible for daily payments');
      return;
    }

    setIsSubmitting(true);
    try {
      const [, supervisorName, supervisorPosition] = selectedSupervisor.split('|');
      const amount = isLeave ? 0 : calculateDailyPayment(selectedEmployee.position);
      
      if (dateRange?.from && dateRange?.to) {
        const daysInRange = eachDayOfInterval({ 
          start: dateRange.from, 
          end: dateRange.to 
        });

        // Cancel previous leaves for each day in range if recording payment
        if (!isLeave) {
          for (const date of daysInRange) {
            await cancelPreviousLeaves(selectedEmployee.id, date);
          }
        }

        const payments = daysInRange.map(date => ({
          employee_id: selectedEmployee.id,
          date: format(date, 'yyyy-MM-dd'),
          amount,
          status: 'paid' as const,
          is_leave: isLeave
        }));

        const { error } = await supabase
          .from('payments')
          .insert(payments);

        if (error) throw error;

        await sendPaymentNotification({
          supervisorName,
          supervisorPosition,
          employeeName: selectedEmployee.name,
          employeePosition: selectedEmployee.position,
          amount: amount * daysInRange.length,
          date: dateRange.from,
          endDate: dateRange.to,
          daysCount: daysInRange.length,
          isLeave
        });
        
        toast.success(`${isLeave ? 'Leave' : 'Payments'} recorded for ${daysInRange.length} days`);
      } else {
        // Cancel previous leave if recording payment
        if (!isLeave) {
          await cancelPreviousLeaves(selectedEmployee.id, selectedDate);
        }

        const { error } = await supabase
          .from('payments')
          .insert([{
            employee_id: selectedEmployee.id,
            date: format(selectedDate, 'yyyy-MM-dd'),
            amount,
            status: 'paid' as const,
            is_leave: isLeave
          }]);

        if (error) throw error;

        await sendPaymentNotification({
          supervisorName,
          supervisorPosition,
          employeeName: selectedEmployee.name,
          employeePosition: selectedEmployee.position,
          amount,
          date: selectedDate,
          daysCount: 1,
          isLeave
        });
        
        toast.success(`${isLeave ? 'Leave' : 'Payment'} recorded successfully`);
      }

      setSelectedSupervisor('');
      setIsLeave(false);
      setError(null);
      onPaymentRecorded?.();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full md:w-80">
      <div className="flex items-center mb-4">
        <DollarSign className="w-5 h-5 text-blue-600" />
        <h2 className="ml-2 text-lg font-semibold text-gray-900">Record Payment</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <div className="flex items-center px-3 py-2 border rounded-md bg-gray-50">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {dateRange?.from && dateRange?.to ? (
                `${format(dateRange.from, 'dd MMM')} - ${format(dateRange.to, 'dd MMM yyyy')}`
              ) : (
                format(selectedDate, 'dd MMMM yyyy')
              )}
            </span>
          </div>
        </div>

        <SupervisorInput
          value={selectedSupervisor}
          onChange={handleSupervisorChange}
          disabled={isSubmitting}
        />

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selected Employee
          </label>
          <div className="px-3 py-2 border rounded-md bg-gray-50">
            <span className="text-sm text-gray-600">
              {selectedEmployee ? (
                `${selectedEmployee.name} (${selectedEmployee.position})`
              ) : (
                'Please select an employee'
              )}
            </span>
          </div>
          {selectedEmployee && (selectedEmployee.position === 'direksi' || selectedEmployee.position === 'komisaris utama') && (
            <p className="mt-1 text-sm text-red-500">
              This position is not eligible for daily payments
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="isLeave"
            type="checkbox"
            checked={isLeave}
            onChange={(e) => setIsLeave(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="isLeave" className="ml-2 block text-sm text-gray-700">
            Mark as unpaid leave day
          </label>
        </div>

        <button
          type="submit"
          disabled={
            isSubmitting || 
            !selectedSupervisor || 
            !selectedEmployee ||
            selectedEmployee.position === 'direksi' ||
            selectedEmployee.position === 'komisaris utama' ||
            !!error
          }
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Recording...' : (
            dateRange?.from && dateRange?.to ? 
              `Record ${isLeave ? 'Leave' : 'Payments'} for Range` : 
              `Record ${isLeave ? 'Leave' : 'Payment'}`
          )}
        </button>
      </form>
    </div>
  );
}