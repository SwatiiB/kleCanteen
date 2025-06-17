import { Star } from 'lucide-react';

const StarRating = ({ rating, size = 'md', showText = true }) => {
  // Convert rating to a number between 0 and 5
  const numericRating = Math.min(5, Math.max(0, Number(rating) || 0));
  
  // Size classes
  const sizeClasses = {
    sm: 16,
    md: 20,
    lg: 24
  };
  
  const starSize = sizeClasses[size] || sizeClasses.md;
  
  // Get text representation
  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Very Good';
    if (rating >= 2.5) return 'Good';
    if (rating >= 1.5) return 'Fair';
    if (rating > 0) return 'Poor';
    return 'Not Rated';
  };
  
  return (
    <div className="flex items-center">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          // Full star
          if (star <= Math.floor(numericRating)) {
            return (
              <Star
                key={star}
                size={starSize}
                fill="#FBBF24"
                stroke="#FBBF24"
                className="mr-0.5"
              />
            );
          }
          
          // Half star
          if (star === Math.ceil(numericRating) && !Number.isInteger(numericRating)) {
            return (
              <div key={star} className="relative mr-0.5">
                {/* Background star (empty) */}
                <Star
                  size={starSize}
                  fill="none"
                  stroke="#9CA3AF"
                />
                {/* Foreground star (half filled) - using clip-path */}
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${(numericRating % 1) * 100}%` }}>
                  <Star
                    size={starSize}
                    fill="#FBBF24"
                    stroke="#FBBF24"
                  />
                </div>
              </div>
            );
          }
          
          // Empty star
          return (
            <Star
              key={star}
              size={starSize}
              fill="none"
              stroke="#9CA3AF"
              className="mr-0.5"
            />
          );
        })}
      </div>
      
      {showText && (
        <span className="ml-2 text-sm text-gray-600">
          {numericRating > 0 ? `${numericRating.toFixed(1)} - ${getRatingText(numericRating)}` : 'Not Rated'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
