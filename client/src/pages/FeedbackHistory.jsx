import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, MessageSquare, Search, Filter } from 'lucide-react';
import { getUserFeedback } from '../services/feedback';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Loader from '../components/UI/Loader';
import StarRating from '../components/Feedback/StarRating';

const FeedbackHistory = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('');
  
  useEffect(() => {
    fetchFeedbacks();
  }, []);
  
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await getUserFeedback();
      setFeedbacks(data);
      setFilteredFeedbacks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load feedback history. Please try again later.');
      console.error('Error fetching feedback history:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Filter feedbacks based on search term and rating filter
    let filtered = [...feedbacks];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(feedback => 
        feedback.canteenId?.name?.toLowerCase().includes(term) ||
        feedback.comment?.toLowerCase().includes(term)
      );
    }
    
    if (filterRating) {
      const rating = parseInt(filterRating);
      filtered = filtered.filter(feedback => 
        Math.floor(feedback.rating) === rating
      );
    }
    
    setFilteredFeedbacks(filtered);
  }, [searchTerm, filterRating, feedbacks]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    setFilterRating(e.target.value);
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={fetchFeedbacks}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feedback History</h1>
            <p className="text-gray-600">
              View all your past feedback and ratings
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} className="mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by canteen or comment..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={filterRating}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </Card>
      
      {/* Feedback List */}
      {filteredFeedbacks.length === 0 ? (
        <Card className="p-6 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Feedback Found</h3>
          <p className="text-gray-600 mb-6">
            {feedbacks.length === 0 
              ? "You haven't provided any feedback yet." 
              : "No feedback matches your search criteria."}
          </p>
          {feedbacks.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterRating('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredFeedbacks.map((feedback) => (
            <Card key={feedback._id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {feedback.canteenId?.name || 'Unknown Canteen'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {formatDate(feedback.createdAt)}
                  </p>
                  <div className="mb-3">
                    <StarRating rating={feedback.rating} />
                  </div>
                </div>
                
                <div className="mt-2 md:mt-0">
                  <Link to={`/orders/${feedback.orderId._id || feedback.orderId}`}>
                    <Button variant="outline" size="sm">
                      View Order
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Food Quality</p>
                  <StarRating rating={feedback.foodQuality} size="sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Service Speed</p>
                  <StarRating rating={feedback.serviceSpeed} size="sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">App Experience</p>
                  <StarRating rating={feedback.appExperience} size="sm" />
                </div>
              </div>
              
              {feedback.comment && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Your Comment</h4>
                  <p className="text-sm p-3 bg-gray-50 rounded-md">{feedback.comment}</p>
                </div>
              )}
              
              {feedback.staffResponse && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Canteen Response</h4>
                  <div className="text-sm p-3 bg-blue-50 rounded-md">
                    <p className="text-blue-800">{feedback.staffResponse}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackHistory;
