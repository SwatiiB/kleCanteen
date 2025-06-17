import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Star, 
  ChevronDown, 
  ChevronUp,
  Building,
  User,
  Calendar
} from 'lucide-react';
import { getAllFeedback } from '../../services/feedback';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Loader from '../../components/UI/Loader';
import Select from '../../components/UI/Select';

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterResolved, setFilterResolved] = useState('all');
  const [filterCanteen, setFilterCanteen] = useState('');
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    resolvedFeedback: 0,
    averageRating: 0,
    foodQuality: 0,
    serviceSpeed: 0,
    appExperience: 0
  });
  const [canteens, setCanteens] = useState([]);
  
  useEffect(() => {
    fetchFeedback();
  }, []);
  
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await getAllFeedback();
      
      setFeedback(data.feedback || []);
      setFilteredFeedback(data.feedback || []);
      setStats(data.stats || {
        totalFeedback: 0,
        resolvedFeedback: 0,
        averageRating: 0,
        foodQuality: 0,
        serviceSpeed: 0,
        appExperience: 0
      });
      
      // Extract unique canteens for filtering
      const uniqueCanteens = Array.from(new Set(
        data.feedback
          .filter(item => item.canteenId && item.canteenId.name)
          .map(item => JSON.stringify({ 
            id: item.canteenId._id, 
            name: item.canteenId.name 
          }))
      )).map(str => JSON.parse(str));
      
      setCanteens(uniqueCanteens);
      setError(null);
    } catch (err) {
      setError('Failed to load feedback. Please try again later.');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Filter feedback based on search term, rating filter, resolved status, and canteen
    let filtered = [...feedback];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.comment?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        (item.canteenId && item.canteenId.name?.toLowerCase().includes(term))
      );
    }
    
    if (filterRating) {
      const rating = parseInt(filterRating);
      filtered = filtered.filter(item => 
        Math.floor(item.rating) === rating
      );
    }
    
    if (filterResolved !== 'all') {
      const isResolved = filterResolved === 'resolved';
      filtered = filtered.filter(item => item.isResolved === isResolved);
    }
    
    if (filterCanteen) {
      filtered = filtered.filter(item => 
        item.canteenId && item.canteenId._id === filterCanteen
      );
    }
    
    setFilteredFeedback(filtered);
  }, [searchTerm, filterRating, filterResolved, filterCanteen, feedback]);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterRatingChange = (e) => {
    setFilterRating(e.target.value);
  };
  
  const handleFilterResolvedChange = (e) => {
    setFilterResolved(e.target.value);
  };
  
  const handleFilterCanteenChange = (e) => {
    setFilterCanteen(e.target.value);
  };
  
  const toggleExpandFeedback = (id) => {
    if (expandedFeedback === id) {
      setExpandedFeedback(null);
    } else {
      setExpandedFeedback(id);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? '#FBBF24' : 'none'}
            stroke={star <= rating ? '#FBBF24' : '#9CA3AF'}
          />
        ))}
        <span className="ml-2 text-sm">{rating?.toFixed(1) || 0}</span>
      </div>
    );
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
          onClick={fetchFeedback}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
        <p className="text-gray-600">
          View and analyze customer feedback across all canteens
        </p>
      </div>
      
      {/* Feedback Stats */}
      <Card className="mb-6 p-6">
        <h2 className="text-lg font-semibold mb-4">Feedback Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-1">Overall Rating</p>
            <div className="flex items-center">
              <Star className="text-yellow-400 mr-1" size={20} fill="#FBBF24" />
              <span className="text-2xl font-bold">{Number(stats.averageRating).toFixed(1)}</span>
              <span className="text-sm text-gray-500 ml-2">/ 5.0</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">From {stats.totalFeedback} reviews</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700 mb-1">Resolved</p>
            <div className="flex items-center">
              <span className="text-2xl font-bold">{stats.resolvedFeedback}</span>
              <span className="text-sm text-gray-500 ml-2">/ {stats.totalFeedback}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalFeedback > 0 
                ? `${Math.round((stats.resolvedFeedback / stats.totalFeedback) * 100)}% resolved`
                : 'No feedback yet'}
            </p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-700 mb-1">Food Quality</p>
            <div className="flex items-center">
              <Star className="text-yellow-400 mr-1" size={20} fill="#FBBF24" />
              <span className="text-2xl font-bold">{Number(stats.foodQuality).toFixed(1)}</span>
              <span className="text-sm text-gray-500 ml-2">/ 5.0</span>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-700 mb-1">Service Speed</p>
            <div className="flex items-center">
              <Star className="text-yellow-400 mr-1" size={20} fill="#FBBF24" />
              <span className="text-2xl font-bold">{Number(stats.serviceSpeed).toFixed(1)}</span>
              <span className="text-sm text-gray-500 ml-2">/ 5.0</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-1">App Experience</p>
            <div className="flex items-center">
              <Star className="text-yellow-400 mr-1" size={20} fill="#FBBF24" />
              <span className="text-2xl font-bold">{Number(stats.appExperience).toFixed(1)}</span>
              <span className="text-sm text-gray-500 ml-2">/ 5.0</span>
            </div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-700 mb-1">Total Feedback</p>
            <div className="flex items-center">
              <span className="text-2xl font-bold">{stats.totalFeedback}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all canteens</p>
          </div>
        </div>
      </Card>
      
      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by comment, email, or canteen..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select
              value={filterRating}
              onChange={handleFilterRatingChange}
              className="w-32"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </Select>
            
            <Select
              value={filterResolved}
              onChange={handleFilterResolvedChange}
              className="w-40"
            >
              <option value="all">All Status</option>
              <option value="resolved">Resolved</option>
              <option value="unresolved">Unresolved</option>
            </Select>
            
            <Select
              value={filterCanteen}
              onChange={handleFilterCanteenChange}
              className="w-48"
            >
              <option value="">All Canteens</option>
              {canteens.map(canteen => (
                <option key={canteen.id} value={canteen.id}>
                  {canteen.name}
                </option>
              ))}
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center hover:bg-gray-100"
              onClick={() => {
                setSearchTerm('');
                setFilterRating('');
                setFilterResolved('all');
                setFilterCanteen('');
              }}
            >
              <Filter size={16} className="mr-1" />
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <Card className="p-6 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Feedback Found</h3>
          <p className="text-gray-600 mb-6">
            {feedback.length === 0 
              ? "There is no feedback in the system yet." 
              : "No feedback matches your search criteria."}
          </p>
          {feedback.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterRating('');
                setFilterResolved('all');
                setFilterCanteen('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((item) => (
            <Card key={item._id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1">
                    {renderStars(item.rating)}
                    {item.isResolved ? (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs flex items-center">
                        Responded
                      </span>
                    ) : (
                      <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs flex items-center">
                        Awaiting Response
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      <span>{item.email}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center">
                      <Building size={14} className="mr-1" />
                      <span>{item.canteenId?.name || 'Unknown Canteen'}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleExpandFeedback(item._id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedFeedback === item._id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
              
              {expandedFeedback === item._id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Food Quality</p>
                      {renderStars(item.foodQuality)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Service Speed</p>
                      {renderStars(item.serviceSpeed)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">App Experience</p>
                      {renderStars(item.appExperience)}
                    </div>
                  </div>
                  
                  {item.comment && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Customer Comment</p>
                      <p className="text-sm p-3 bg-gray-50 rounded-md">{item.comment}</p>
                    </div>
                  )}
                  
                  {item.staffResponse && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Staff Response</p>
                      <p className="text-sm p-3 bg-blue-50 rounded-md">{item.staffResponse}</p>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Order ID: {item.orderId?.orderId || 'Unknown'}
                    </p>
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

export default FeedbackManagement;
