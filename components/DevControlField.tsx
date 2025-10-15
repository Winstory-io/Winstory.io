import React from 'react';
import { devControlsStyles } from '@/lib/styles/devControlsStyles';

interface DevControlFieldProps {
  label: string;
  type: 'number' | 'text' | 'select' | 'checkbox';
  value: any;
  onChange: (value: any) => void;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export const DevControlField: React.FC<DevControlFieldProps> = ({
  label,
  type,
  value,
  onChange,
  options = [],
  min,
  max,
  step,
  placeholder
}) => {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    Object.assign(e.target.style, devControlsStyles.inputFocus);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    Object.assign(e.target.style, devControlsStyles.inputBlur);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    Object.assign(e.currentTarget.style, devControlsStyles.buttonHover);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    Object.assign(e.currentTarget.style, devControlsStyles.button);
  };

  if (type === 'checkbox') {
    return (
      <label style={devControlsStyles.checkbox}>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          style={{ accentColor: '#FFD600' }}
        />
        <span>{label}</span>
      </label>
    );
  }

  if (type === 'select') {
    return (
      <div style={devControlsStyles.fieldContainer}>
        <label style={devControlsStyles.label}>{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={devControlsStyles.input}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div style={devControlsStyles.fieldContainer}>
      <label style={devControlsStyles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          if (type === 'number') {
            onChange(parseInt(e.target.value));
          } else {
            onChange(e.target.value);
          }
        }}
        style={devControlsStyles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
      />
    </div>
  );
};
