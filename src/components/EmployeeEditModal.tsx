import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Position } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface EmployeeEditModalProps {
  employeeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const positions: Position[] = ['training', 'karyawan', 'eksekutif', 'direksi', 'staff ahli', 'komisaris utama'];

export function EmployeeEditModal({ employeeId, onClose, onSuccess }: EmployeeEditModalProps) {
  const [position, setPosition] = useState<Position>('karyawan');
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [originalPosition, setOriginalPosition] = useState<Position>('karyawan');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', employeeId)
          .single();

        if (error) throw error;
        if (data) {
          setPosition(data.position as Position);
          setOriginalPosition(data.position as Position);
          setName(data.name);
          setOriginalName(data.name);
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        toast.error('Failed to fetch employee details');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!name.trim()) {
        toast.error('Name cannot be empty');
        return;
      }

      const { error } = await supabase
        .from('employees')
        .update({ position, name: name.trim() })
        .eq('id', employeeId);

      if (error) throw error;
      
      toast.success('Employee updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return null;
  }

  const hasChanges = name.trim() !== originalName || position !== originalPosition;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Edit Employee</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Enter employee name"
              disabled={saving}
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value as Position)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={saving}
            >
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos.charAt(0).toUpperCase() + pos.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !hasChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}