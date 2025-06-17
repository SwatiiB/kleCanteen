const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  fullWidth = false,
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-md focus-visible:ring-primary-400',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 hover:shadow-md focus-visible:ring-secondary-400',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 hover:shadow-md focus-visible:ring-accent-400',
    outline: 'border-2 border-primary-500 text-primary-600 bg-transparent hover:bg-primary-50 focus-visible:ring-primary-400',
    'outline-secondary': 'border-2 border-secondary-500 text-secondary-600 bg-transparent hover:bg-secondary-50 focus-visible:ring-secondary-400',
    'outline-accent': 'border-2 border-accent-500 text-accent-600 bg-transparent hover:bg-accent-50 focus-visible:ring-accent-400',
    neutral: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 hover:shadow-sm focus-visible:ring-neutral-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md focus-visible:ring-red-400',
    success: 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md focus-visible:ring-green-400',
  };

  // Size classes
  const sizeClasses = {
    xs: 'h-7 px-2.5 text-xs',
    sm: 'h-9 px-3.5 text-sm',
    md: 'h-11 px-5 py-2.5 text-base',
    lg: 'h-13 px-7 py-3 text-lg',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
