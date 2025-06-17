const Card = ({
  children,
  className = '',
  padding = 'normal',
  shadow = 'md',
  border = false,
  ...props
}) => {
  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    normal: 'p-4',
    lg: 'p-6',
  };

  // Shadow classes
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };

  // Border classes
  const borderClasses = border ? 'border border-primary-300' : '';

  // Combine all classes
  const cardClasses = `bg-primary-50 rounded-lg ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClasses} ${className}`;

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
