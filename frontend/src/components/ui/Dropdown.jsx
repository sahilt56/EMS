import React from 'react';

/**
 * Reusable Dropdown Select input
 */
export const Dropdown = ({
  label,
  options = [],
  value,
  onChange,
  required = false,
  error = '',
  className = ''
}) => {
  return (
    <div className={`flex flex-col space-y-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full px-4 py-2.5 bg-darkSurface border rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
            error
              ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
              : 'border-darkBorder focus:ring-brand-500/20 focus:border-brand-500'
          }`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-darkSurface">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
    </div>
  );
};

export default Dropdown;
