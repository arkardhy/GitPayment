import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeSearchProps {
  employees: Employee[];
  onSelect: (employee: Employee | null) => void;
  value: Employee | null;
}

export function EmployeeSearch({ employees, onSelect, value }: EmployeeSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const handleSelect = (employee: Employee) => {
    onSelect(employee);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search employees..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {value && !isOpen && (
        <div className="mt-2 p-2 bg-blue-50 rounded-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">{value.name}</p>
            <p className="text-xs text-blue-700 capitalize">{value.position}</p>
          </div>
          <button
            onClick={() => onSelect(null)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear
          </button>
        </div>
      )}

      {isOpen && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
          {filteredEmployees.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No employees found
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <li
                  key={employee.id}
                  onClick={() => handleSelect(employee)}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {employee.name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {employee.position}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}