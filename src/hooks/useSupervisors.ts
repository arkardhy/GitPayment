import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Employee } from '../types';

const SUPERVISOR_POSITIONS = ['eksekutif', 'direksi', 'komisaris utama'];

export function useSupervisors() {
  const [supervisors, setSupervisors] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSupervisors = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .in('position', SUPERVISOR_POSITIONS)
        .order('name');

      if (error) throw error;
      
      const mappedSupervisors = (data || []).map(supervisor => ({
        id: supervisor.id,
        name: supervisor.name,
        position: supervisor.position,
        joinDate: supervisor.join_date
      }));
      
      setSupervisors(mappedSupervisors);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
      toast.error('Failed to fetch supervisors');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    supervisors,
    loading,
    fetchSupervisors,
  };
}