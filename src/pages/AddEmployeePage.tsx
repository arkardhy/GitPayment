import React from 'react';
import { EmployeeForm } from '../components/EmployeeForm';

export function AddEmployeePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Add Employee</h1>
      <EmployeeForm />
    </div>
  );
}