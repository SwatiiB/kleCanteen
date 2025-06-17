import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Card from '../UI/Card';
import Button from '../UI/Button';

const MenuItem = ({ item, onAddToCart }) => {
  // Get current location for redirect after login
  const location = useLocation();

  // Handle both property naming conventions (itemName vs name, availability vs isAvailable)
  const {
    _id,
    name,
    itemName,
    description,
    price,
    category,
    image,
    isAvailable,
    availability
  } = item;

  // Use the correct property names with fallbacks
  const displayName = itemName || name || 'Unnamed Item';
  const isItemAvailable = isAvailable !== undefined ? isAvailable : (availability !== undefined ? availability : true);

  // Debug the item properties
  console.log('MenuItem props:', {
    id: _id,
    name: displayName,
    available: isItemAvailable,
    price: price || 0,
    hasImage: !!image
  });
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    // Pass the current path for redirect after login if needed
    onAddToCart({ ...item, quantity }, location.pathname);
    setQuantity(1); // Reset quantity after adding to cart
  };

  return (
    <Card
      className="h-full flex flex-col overflow-hidden"
      hover={true}
      shadow="card"
    >
      <div className="relative">
        <img
          src={
            (image && image.url) ? image.url :
            (typeof image === 'string') ? image :
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80'
          }
          alt={displayName}
          className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            console.log('Image failed to load, using placeholder');
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80';
          }}
        />

        {/* Price tag */}
        <div className="absolute top-0 right-0">
          <div className="bg-primary-500 text-white px-3 py-1 font-bold rounded-bl-lg shadow-md">
            ₹{(price || 0).toFixed(2)}
          </div>
        </div>

        {/* Category tag */}
        {category && (
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm text-primary-700 shadow-sm">
              {category}
            </span>
          </div>
        )}

        {/* Availability badge */}
        <div className="absolute bottom-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
            isItemAvailable
              ? 'bg-secondary-500 text-white'
              : 'bg-neutral-200 text-neutral-700'
          }`}>
            {isItemAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-neutral-800 mb-2">{displayName}</h3>
        <p className="text-neutral-600 text-sm mb-5 flex-grow line-clamp-2">{description}</p>

        {isItemAvailable ? (
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center border-2 border-primary-200 rounded-lg overflow-hidden shadow-sm">
                <button
                  className="px-3 py-2 text-primary-600 hover:bg-primary-50 transition-colors"
                  onClick={handleDecrement}
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 font-medium text-neutral-800 bg-primary-50">{quantity}</span>
                <button
                  className="px-3 py-2 text-primary-600 hover:bg-primary-50 transition-colors"
                  onClick={handleIncrement}
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="font-bold text-primary-600">₹{((price || 0) * quantity).toFixed(2)}</span>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleAddToCart}
              className="flex items-center justify-center py-2.5"
            >
              <ShoppingCart size={18} className="mr-2" />
              Add to Cart
            </Button>
          </div>
        ) : (
          <div className="mt-auto">
            <Button
              variant="neutral"
              fullWidth
              disabled
              className="py-2.5"
            >
              Currently Unavailable
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MenuItem;
