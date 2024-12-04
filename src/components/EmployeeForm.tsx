import React, { useState } from 'react';
import { Position } from '../types';
import { useEmployees } from '../hooks/useEmployees';
import { UserPlus, Building2, BriefcaseIcon, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const positions: Position[] = ['training', 'karyawan', 'eksekutif', 'direksi', 'staff ahli', 'komisaris utama'];

export function EmployeeForm() {
  const [name, setName] = useState('');
  const [position, setPosition] = useState<Position>('karyawan');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addEmployee } = useEmployees();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addEmployee(name.trim(), position);
      if (success) {
        setName('');
        setPosition('karyawan');
        toast.success('Employee added successfully');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-10 rounded-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Add New Employee</h2>
              <p className="text-blue-100 text-sm">Enter the details of the new employee below</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Employee Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter employee name"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value as Position)}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={isSubmitting}
                >
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Join Date</p>
                <p className="text-sm font-medium text-gray-900">{format(new Date(), 'dd MMMM yyyy')}</p>
              </div>
            </div>
          </div>

          {position === 'direksi' || position === 'komisaris utama' ? (
            <div className="flex items-start space-x-3 bg-yellow-50 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Note: {position === 'direksi' ? 'Director' : 'Chief Commissioner'} Position
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  This position is not eligible for daily payments. Special compensation rules apply.
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setName('');
                setPosition('karyawan');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}