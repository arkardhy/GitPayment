import React, { useEffect } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { Users, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/payment';
import { calculateDailyPayment } from '../utils/payment';
import { EmployeeEditModal } from './EmployeeEditModal';

export function EmployeeList() {
  const { employees, loading, fetchEmployees, deleteEmployee } = useEmployees();
  const [editingEmployee, setEditingEmployee] = React.useState<string | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = React.useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const success = await deleteEmployee(id);
      if (success) {
        await fetchEmployees();
      } else {
        setShowDeleteWarning(true);
        setTimeout(() => setShowDeleteWarning(false), 5000);
      }
    }
  };

  const getPaymentInfo = (position: string) => {
    const dailyRate = calculateDailyPayment(position as any);
    if (position === 'direksi' || position === 'komisaris utama') {
      return <span className="text-gray-500">No daily payment</span>;
    }
    return (
      <>
        <p className="text-sm font-medium text-gray-900">
          {formatCurrency(dailyRate)}
        </p>
        <p className="text-xs text-gray-500">per day</p>
      </>
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mt-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow mt-4">
        <div className="flex items-center mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="ml-2 text-lg font-semibold text-gray-900">Employee List</h2>
        </div>

        {showDeleteWarning && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center text-yellow-800">
              <AlertCircle className="w-4 h-4 mr-2" />
              <p className="text-sm">
                Employees with payment records cannot be deleted to maintain payment history integrity.
              </p>
            </div>
          </div>
        )}
        
        <div className="divide-y divide-gray-200">
          {employees.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No employees found</p>
          ) : (
            employees.map((employee) => (
              <div key={employee.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{employee.position}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right mr-4">
                      {getPaymentInfo(employee.position)}
                    </div>
                    <button
                      onClick={() => setEditingEmployee(employee.id)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Edit employee"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete employee"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingEmployee && (
        <EmployeeEditModal
          employeeId={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSuccess={() => {
            setEditingEmployee(null);
            fetchEmployees();
          }}
        />
      )}
    </>
  );
}