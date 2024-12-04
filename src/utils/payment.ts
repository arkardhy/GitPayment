import { Position } from '../types';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export const DAILY_RATES: Record<Position, number> = {
  training: 50000,
  karyawan: 50000,
  eksekutif: 25000,
  direksi: 0,
  'staff ahli': 25000,
  'komisaris utama': 0
};

export const calculateDailyPayment = (position: Position): number => {
  return DAILY_RATES[position];
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount);
};

export const cancelPreviousLeaves = async (employeeId: string, date: Date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('employee_id', employeeId)
    .eq('date', dateStr)
    .eq('is_leave', true);

  if (error) {
    throw error;
  }
};