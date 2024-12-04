import React, { useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Payment, Employee } from '../types';
import { Calendar } from 'lucide-react';
import { PaymentActions } from './PaymentActions';
import { EmployeeSearch } from './EmployeeSearch';
import { CalendarLegend } from './CalendarLegend';
import { useEmployees } from '../hooks/useEmployees';
import 'react-day-picker/dist/style.css';

interface PaymentCalendarProps {
  payments: Payment[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  onPaymentUpdate?: () => void;
}

export function PaymentCalendar({ 
  payments, 
  onDateSelect, 
  selectedDate,
  onPaymentUpdate 
}: PaymentCalendarProps) {
  const [range, setRange] = React.useState<DateRange | undefined>();
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const { employees, fetchEmployees } = useEmployees();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const getDayStatus = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    
    // Only show status if an employee is selected
    if (!selectedEmployee) return undefined;
    
    const payment = payments.find(p => 
      p.date === dateStr && 
      p.employeeId === selectedEmployee.id
    );
    
    if (!payment) return undefined;
    if (payment.isLeave) return 'leave';
    return payment.status;
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    setRange(range);
    if (range?.from) {
      onDateSelect(range.from);
    }
  };

  const handleEmployeeSelect = (employee: Employee | null) => {
    setSelectedEmployee(employee);
    setRange(undefined); // Reset date range when employee changes
  };

  const handlePaymentRecorded = () => {
    onPaymentUpdate?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="ml-2 text-lg font-semibold text-gray-900">Attendance Calendar</h2>
          </div>
          <div className="w-72">
            <EmployeeSearch
              employees={employees}
              value={selectedEmployee}
              onSelect={handleEmployeeSelect}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={handleRangeSelect}
              modifiers={{
                paid: (date) => getDayStatus(date) === 'paid',
                leave: (date) => getDayStatus(date) === 'leave'
              }}
              modifiersStyles={{
                paid: { 
                  backgroundColor: '#10B981',
                  color: 'white',
                  fontWeight: 'bold'
                },
                leave: { 
                  backgroundColor: '#EF4444',
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
              styles={{
                caption: { color: '#374151' },
                head_cell: { color: '#6B7280' },
                table: { width: '100%' },
                cell: { 
                  width: '40px',
                  height: '40px',
                  margin: '2px'
                },
                day: {
                  margin: 0,
                  width: '40px',
                  height: '40px',
                  fontSize: '0.875rem'
                }
              }}
              className="border rounded-lg p-2"
            />
            {selectedEmployee ? (
              <CalendarLegend />
            ) : (
              <p className="text-sm text-gray-500 text-center mt-4">
                Select an employee to view their attendance
              </p>
            )}
          </div>

          <PaymentActions 
            selectedDate={selectedDate} 
            dateRange={range}
            selectedEmployee={selectedEmployee}
            onPaymentRecorded={handlePaymentRecorded}
          />
        </div>

        {range?.from && range?.to && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Selected range:</p>
            <p className="font-medium">
              {format(range.from, 'PPP')} - {format(range.to, 'PPP')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}