import React from 'react';
import { EmployeeList } from '../components/EmployeeList';

export function EmployeesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Employees</h1>
      <EmployeeList />
    </div>
  );
}