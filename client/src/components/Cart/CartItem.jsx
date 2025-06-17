import { Plus, Minus, Trash2 } from 'lucide-react';
import Button from '../UI/Button';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { _id, name, price, quantity, image } = item;

  // Debug image data
  console.log('CartItem image data:', {
    itemName: name,
    imageType: typeof image,
    imageValue: image,
    hasUrl: image && image.url
  });

  const handleIncrement = () => {
    onUpdateQuantity(_id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onUpdateQuantity(_id, quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(_id);
  };

  return (
    <div className="flex items-center py-4 border-b">
      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
        <img
          src={
            (image && image.url) ? image.url :
            (typeof image === 'string') ? image :
            'https://via.placeholder.com/80x80?text=Food'
          }
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/80x80?text=Food';
          }}
        />
      </div>

      <div className="ml-4 flex-grow">
        <h3 className="text-base font-medium text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600">₹{price.toFixed(2)} each</p>
      </div>

      <div className="flex items-center">
        <div className="flex items-center border rounded-md mr-4">
          <button
            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            onClick={handleDecrement}
          >
            <Minus size={16} />
          </button>
          <span className="px-3 py-1">{quantity}</span>
          <button
            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            onClick={handleIncrement}
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="w-20 text-right font-medium">
          ₹{(price * quantity).toFixed(2)}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="ml-4 text-red-600 hover:text-red-800"
          onClick={handleRemove}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
