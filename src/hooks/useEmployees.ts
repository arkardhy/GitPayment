import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Employee } from '../types';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const mappedEmployees = (data || []).map(employee => ({
        id: employee.id,
        name: employee.name,
        position: employee.position,
        joinDate: employee.join_date
      }));
      
      setEmployees(mappedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, []);

  const addEmployee = useCallback(async (name: string, position: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([
          {
            name,
            position,
            join_date: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;
      
      await fetchEmployees();
      toast.success('Employee added successfully');
      return true;
    } catch (error: any) {
      console.error('Error adding employee:', error);
      toast.error(error.message || 'Failed to add employee');
      return false;
    }
  }, [fetchEmployees]);

  const deleteEmployee = useCallback(async (id: string) => {
    try {
      // First check if employee has any payment records
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id')
        .eq('employee_id', id)
        .limit(1);

      if (paymentsError) throw paymentsError;

      if (payments && payments.length > 0) {
        toast.error('Cannot delete employee with existing payment records');
        return false;
      }

      // If no payments exist, proceed with deletion
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Employee deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
      return false;
    }
  }, []);

  return {
    employees,
    loading,
    fetchEmployees,
    addEmployee,
    deleteEmployee,
  };
}