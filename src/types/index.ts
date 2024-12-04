export type Position = 'training' | 'karyawan' | 'eksekutif' | 'direksi' | 'staff ahli' | 'komisaris utama';

export interface Employee {
  id: string;
  name: string;
  position: Position;
  joinDate: string;
}

export interface Payment {
  id: string;
  employeeId: string;
  date: string;
  amount: number;
  status: 'paid';
  isLeave: boolean;
}

export interface PaymentSummary {
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
}

export interface DateRange {
  from: Date;
  to?: Date;
}