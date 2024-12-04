import React, { useEffect } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { Employee } from '../types';
import { UserCircle } from 'lucide-react';

interface EmployeeSelectProps {
  value: Employee | null;
  onChange: (employee: Employee | null) => void;
}

export function EmployeeSelect({ value, onChange }: EmployeeSelectProps) {
  const { employees, loading, fetchEmployees } = useEmployees();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  if (loading) {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <UserCircle className="h-5 w-5 text-gray-400" />
        </div>
        <select
          disabled
          className="pl-10 pr-4 py-2 border border-gray-300 bg-gray-50 rounded-md shadow-sm text-sm text-gray-500"
        >
          <option>Loading employees...</option>
        </select>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <UserCircle className="h-5 w-5 text-gray-400" />
      </div>
      <select
        value={value?.id || ''}
        onChange={(e) => {
          const employee = employees.find(emp => emp.id === e.target.value);
          onChange(employee || null);
        }}
        className="pl-10 pr-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <option value="">Select Employee</option>
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.name} ({employee.position})
          </option>
        ))}
      </select>
    </div>
  );
}