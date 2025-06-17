const Card = ({
  children,
  className = '',
  padding = 'normal',
  shadow = 'md',
  border = false,
  hover = false,
  variant = 'default',
  ...props
}) => {
  // Padding classes
  const paddingClasses = {
    none: '',
    xs: 'p-2',
    sm: 'p-3',
    normal: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Shadow classes
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-card',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // Border classes
  const borderClasses = border ? 'border border-neutral-200' : '';

  // Hover effect classes
  const hoverClasses = hover ? 'transition-all duration-300 hover:shadow-hover hover:-translate-y-1' : '';

  // Variant classes
  const variantClasses = {
    default: 'bg-primary-50',
    primary: 'bg-primary-100',
    secondary: 'bg-secondary-50',
    accent: 'bg-accent-50',
    neutral: 'bg-primary-200',
    warm: 'bg-primary-100',
  };

  // Combine all classes
  const cardClasses = `${variantClasses[variant]} rounded-xl ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClasses} ${hoverClasses} ${className}`;

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
