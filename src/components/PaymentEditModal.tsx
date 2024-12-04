import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Payment } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { calculateDailyPayment } from '../utils/payment';

interface PaymentEditModalProps {
  payment: Payment & { employee_name?: string };
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentEditModal({ payment, onClose, onSuccess }: PaymentEditModalProps) {
  const [isLeave, setIsLeave] = useState(payment.isLeave);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get employee details to calculate correct amount
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('position')
        .eq('id', payment.employeeId)
        .single();

      if (employeeError) throw employeeError;

      const amount = isLeave ? 0 : calculateDailyPayment(employeeData.position);

      const { error } = await supabase
        .from('payments')
        .update({
          is_leave: isLeave,
          amount: amount
        })
        .eq('id', payment.id);

      if (error) throw error;

      toast.success('Payment record updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-[#105283] mb-4">
          Edit Payment Record
        </h2>

        <div className="mb-6">
          <p className="text-sm text-[#46525A]">
            <span className="font-medium">Employee:</span> {payment.employee_name}
          </p>
          <p className="text-sm text-[#46525A]">
            <span className="font-medium">Date:</span> {format(new Date(payment.date), 'dd MMMM yyyy')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center">
            <input
              id="isLeave"
              type="checkbox"
              checked={isLeave}
              onChange={(e) => setIsLeave(e.target.checked)}
              className="h-4 w-4 text-[#2D85B2] focus:ring-[#2D85B2] border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="isLeave" className="ml-2 block text-sm text-[#46525A]">
              Mark as unpaid leave day
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#46525A] bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#105283] rounded-lg hover:bg-[#2D85B2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#105283] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}