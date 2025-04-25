import React from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange }) => {
  return (
    <div className="flex space-x-4">
      <div className="flex-1">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
        />
      </div>
      <div className="flex-1">
        <input
          type="date"
          value={endDate}
          min={startDate} // Không cho chọn ngày kết thúc trước ngày bắt đầu
          onChange={(e) => onChange(startDate, e.target.value)}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
        />
      </div>
    </div>
  );
};

export default DateRangePicker; 