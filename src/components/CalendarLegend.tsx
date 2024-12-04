import React from 'react';

export function CalendarLegend() {
  return (
    <div className="flex gap-4 mt-4 justify-center">
      <div className="flex items-center">
        <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
        <span className="text-sm text-gray-600">Paid</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 rounded bg-red-500 mr-2"></div>
        <span className="text-sm text-gray-600">Leave</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300 mr-2"></div>
        <span className="text-sm text-gray-600">No Record</span>
      </div>
    </div>
  );
}