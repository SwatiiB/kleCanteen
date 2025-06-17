import { forwardRef } from 'react';

const Checkbox = forwardRef(({ 
  label, 
  id, 
  name, 
  checked, 
  onChange, 
  error = '', 
  className = '',
  disabled = false,
  ...props 
}, ref) => {
  return (
    <div className="flex items-center">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {label && (
        <label 
          htmlFor={id} 
          className="ml-2 block text-sm text-gray-700"
        >
          {label}
        </label>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
