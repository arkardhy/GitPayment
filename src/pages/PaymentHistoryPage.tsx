import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Payment } from '../types';
import { PaymentEditModal } from '../components/PaymentEditModal';
import { History, Search, Edit2, Calendar, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/payment';

export function PaymentHistoryPage() {
  const [payments, setPayments] = useState<(Payment & { employee_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          employees (
            name
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedPayments = data.map(payment => ({
        id: payment.id,
        employeeId: payment.employee_id,
        date: payment.date,
        amount: payment.amount,
        status: payment.status,
        isLeave: payment.is_leave,
        employee_name: payment.employees.name
      }));

      setPayments(formattedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (paymentId: string) => {
    setDeletingPayment(paymentId);
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('Payment record deleted successfully');
      await fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment record');
    } finally {
      setDeletingPayment(null);
    }
  };

  const confirmDelete = (paymentId: string, employeeName: string, date: string) => {
    const formattedDate = format(new Date(date), 'dd MMM yyyy');
    const confirmed = window.confirm(
      `Are you sure you want to delete the payment record for ${employeeName} on ${formattedDate}?\n\nThis action cannot be undone.`
    );
    if (confirmed) {
      handleDelete(paymentId);
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center text-[#105283]">
          <History className="w-6 h-6 mr-2" />
          <h1 className="text-2xl font-bold">Payment History</h1>
        </div>
        
        <div className="w-full sm:w-64 relative">
          <input
            type="text"
            placeholder="Search by employee name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D85B2] focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#105283]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#46525A] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#46525A] uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#46525A] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#46525A] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#46525A] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#46525A]">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-[#2D85B2]" />
                        {format(new Date(payment.date), 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#105283]">
                      {payment.employee_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#46525A]">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.isLeave
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {payment.isLeave ? 'Leave' : 'Paid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#46525A]">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setEditingPayment(payment)}
                          className="flex items-center text-[#2D85B2] hover:text-[#105283]"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(payment.id, payment.employee_name, payment.date)}
                          disabled={deletingPayment === payment.id}
                          className="flex items-center text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          {deletingPayment === payment.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-1" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-1" />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <p>No payment records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingPayment && (
        <PaymentEditModal
          payment={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSuccess={() => {
            setEditingPayment(null);
            fetchPayments();
          }}
        />
      )}
    </div>
  );
}