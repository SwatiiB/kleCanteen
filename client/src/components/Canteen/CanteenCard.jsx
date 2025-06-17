import { Link } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import StarRating from '../Feedback/StarRating';

const CanteenCard = ({ canteen }) => {
  const {
    _id,
    name,
    description,
    location,
    image,
    isAvailable,
    availability,
    openingTime,
    closingTime,
    ratings
  } = canteen;

  // Use the correct property name with fallback
  const isCanteenAvailable = isAvailable !== undefined ? isAvailable : availability;

  // Format opening and closing times if available
  const formatTime = (timeString) => {
    if (!timeString) return '';

    try {
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours, 10));
      time.setMinutes(parseInt(minutes, 10));

      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return timeString;
    }
  };

  const openTime = formatTime(openingTime);
  const closeTime = formatTime(closingTime);

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={(image && image.url) ? image.url : (image || 'https://via.placeholder.com/300x200?text=Canteen')}
          alt={name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isCanteenAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isCanteenAvailable ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{name}</h3>
          {ratings && ratings.averageRating > 0 && (
            <div className="flex items-center">
              <StarRating rating={ratings.averageRating} size="sm" showText={false} />
              <span className="ml-1 text-sm font-medium text-gray-700">
                {ratings.averageRating}
              </span>
              <span className="ml-1 text-xs text-gray-500">
                ({ratings.totalRatings})
              </span>
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-4 flex-grow">{description}</p>

        <div className="space-y-2 mb-4">
          {location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin size={16} className="mr-2" />
              <span>{location}</span>
            </div>
          )}

          {(openTime && closeTime) && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-2" />
              <span>{openTime} - {closeTime}</span>
            </div>
          )}

          {ratings && ratings.averageRating > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <Star size={16} className="mr-2 text-yellow-400" />
              <span>
                Food Quality: {ratings.foodQuality} • Service: {ratings.serviceSpeed}
              </span>
            </div>
          )}
        </div>

        <Link to={`/canteens/${_id}`} className="mt-auto">
          <Button variant="primary" fullWidth>
            View Menu
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default CanteenCard;
