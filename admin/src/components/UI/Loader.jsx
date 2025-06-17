const Loader = ({ size = 'md', className = '' }) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };
  
  return (
    <div className={`${className} flex items-center justify-center`}>
      <div className={`${sizeClasses[size]} rounded-full border-blue-600 border-t-transparent animate-spin`}></div>
    </div>
  );
};

export default Loader;
