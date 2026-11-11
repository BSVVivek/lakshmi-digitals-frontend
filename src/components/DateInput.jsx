import { useRef } from 'react';
import { isValidDate } from '../utils/date';

export default function DateInput({ id, label, value, onChange, required = false }) {
  const textInputRef = useRef(null);
  const pickerValue = toPickerDate(value);

  const handleTextChange = (event) => {
    const nextValue = event.target.value;
    event.target.setCustomValidity(
      nextValue && !isValidDate(nextValue) ? 'Enter a valid date in dd-MM-yyyy format.' : '',
    );
    onChange(nextValue);
  };

  const handlePickerChange = (event) => {
    const nextValue = event.target.value;
    const formattedValue = nextValue ? formatPickerDate(nextValue) : '';
    if (textInputRef.current) textInputRef.current.setCustomValidity('');
    onChange(formattedValue);
  };

  return (
    <div className="date-entry">
      <input
        ref={textInputRef}
        id={id}
        className="date-entry-text"
        type="text"
        placeholder="dd-MM-yyyy"
        aria-label={label}
        title="Enter a date as dd-MM-yyyy or select one from the calendar."
        value={value}
        onChange={handleTextChange}
        pattern="[0-9]{2}-[0-9]{2}-[0-9]{4}"
        required={required}
      />
      <input
        className="date-entry-picker"
        type="date"
        aria-label={`Choose ${label.toLowerCase()} from calendar`}
        title="Choose from calendar"
        value={pickerValue}
        onChange={handlePickerChange}
      />
    </div>
  );
}

function toPickerDate(value) {
  if (!isValidDate(value)) return '';
  const [day, month, year] = value.split('-');
  return `${year}-${month}-${day}`;
}

function formatPickerDate(value) {
  const [year, month, day] = value.split('-');
  return `${day}-${month}-${year}`;
}
