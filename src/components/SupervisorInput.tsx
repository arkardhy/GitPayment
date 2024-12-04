import React, { useEffect } from 'react';
import { UserCog } from 'lucide-react';
import { useSupervisors } from '../hooks/useSupervisors';

interface SupervisorInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SupervisorInput({ value, onChange, disabled }: SupervisorInputProps) {
  const { supervisors, loading, fetchSupervisors } = useSupervisors();

  useEffect(() => {
    fetchSupervisors();
  }, [fetchSupervisors]);

  return (
    <div>
      <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-1">
        Supervisor
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <UserCog className="h-4 w-4 text-gray-400" />
        </div>
        <select
          id="supervisor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        >
          <option value="">Select supervisor</option>
          {supervisors.map((supervisor) => (
            <option 
              key={supervisor.id} 
              value={`${supervisor.id}|${supervisor.name}|${supervisor.position}`}
            >
              {supervisor.name} ({supervisor.position})
            </option>
          ))}
        </select>
      </div>
      {loading && (
        <p className="mt-1 text-sm text-gray-500">Loading supervisors...</p>
      )}
      {!loading && supervisors.length === 0 && (
        <p className="mt-1 text-sm text-red-500">No supervisors available</p>
      )}
    </div>
  );
}