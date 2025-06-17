import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  MessageSquare,
  Search,
  Filter,
  Star,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCanteenFeedback, respondToFeedback } from '../../services/feedback';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Loader from '../../components/UI/Loader';
import Modal from '../../components/UI/Modal';

const FeedbackManagement = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterResolved, setFilterResolved] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [averageRatings, setAverageRatings] = useState({
    overallRating: 0,
    foodQuality: 0,
    serviceSpeed: 0,
    appExperience: 0
  });
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState({
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    responseRate: 0,
    recentTrend: 'stable',
    urgentFeedback: 0
  });
  const [showMenuInsights, setShowMenuInsights] = useState(false);

  useEffect(() => {
    if (user?.canteenId) {
      fetchFeedback();
    } else {
      setError('Unable to load feedback: Canteen ID not found. Please try logging in again.');
      setLoading(false);
    }
  }, [user]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await getCanteenFeedback(user.canteenId);

      const feedbackData = data.feedback || [];
      setFeedback(feedbackData);
      setFilteredFeedback(feedbackData);
      setAverageRatings(data.averageRatings || {
        overallRating: 0,
        foodQuality: 0,
        serviceSpeed: 0,
        appExperience: 0
      });
      setTotalFeedback(data.totalFeedback || 0);

      // Calculate analytics
      calculateFeedbackAnalytics(feedbackData);
      setError(null);
    } catch (err) {
      setError('Failed to load feedback. Please try again later.');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateFeedbackAnalytics = (feedbackData) => {
    if (!feedbackData || feedbackData.length === 0) {
      setFeedbackAnalytics({
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        responseRate: 0,
        recentTrend: 'stable',
        urgentFeedback: 0
      });
      return;
    }

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let resolvedCount = 0;
    let urgentCount = 0;

    feedbackData.forEach(item => {
      const rating = Math.floor(item.rating);
      distribution[rating] = (distribution[rating] || 0) + 1;

      if (item.isResolved) resolvedCount++;
      if (item.rating <= 2 && !item.isResolved) urgentCount++;
    });

    // Calculate response rate
    const responseRate = feedbackData.length > 0 ? (resolvedCount / feedbackData.length) * 100 : 0;

    // Calculate recent trend (last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentFeedback = feedbackData.filter(item => new Date(item.createdAt) >= last7Days);
    const previousFeedback = feedbackData.filter(item =>
      new Date(item.createdAt) >= previous7Days && new Date(item.createdAt) < last7Days
    );

    const recentAvg = recentFeedback.length > 0 ?
      recentFeedback.reduce((sum, item) => sum + item.rating, 0) / recentFeedback.length : 0;
    const previousAvg = previousFeedback.length > 0 ?
      previousFeedback.reduce((sum, item) => sum + item.rating, 0) / previousFeedback.length : 0;

    let trend = 'stable';
    if (recentAvg > previousAvg + 0.2) trend = 'improving';
    else if (recentAvg < previousAvg - 0.2) trend = 'declining';

    setFeedbackAnalytics({
      ratingDistribution: distribution,
      responseRate: Math.round(responseRate),
      recentTrend: trend,
      urgentFeedback: urgentCount
    });
  };

  useEffect(() => {
    // Filter feedback based on search term, rating filter, resolved status, date range, and category
    let filtered = [...feedback];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.comment?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term)
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

    if (filterDateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (filterDateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(item => new Date(item.createdAt) >= startDate);
      }
    }

    if (filterCategory !== 'all') {
      switch (filterCategory) {
        case 'high':
          filtered = filtered.filter(item => item.rating >= 4);
          break;
        case 'medium':
          filtered = filtered.filter(item => item.rating >= 3 && item.rating < 4);
          break;
        case 'low':
          filtered = filtered.filter(item => item.rating < 3);
          break;
        case 'urgent':
          filtered = filtered.filter(item => item.rating <= 2 && !item.isResolved);
          break;
      }
    }

    setFilteredFeedback(filtered);
  }, [searchTerm, filterRating, filterResolved, filterDateRange, filterCategory, feedback]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterRatingChange = (e) => {
    setFilterRating(e.target.value);
  };

  const handleFilterResolvedChange = (e) => {
    setFilterResolved(e.target.value);
  };

  const handleFilterDateRangeChange = (e) => {
    setFilterDateRange(e.target.value);
  };



  const toggleExpand = (id) => {
    setExpandedFeedback(expandedFeedback === id ? null : id);
  };

  const handleRespondClick = (item) => {
    setSelectedFeedback(item);
    setResponseText('');
    setResponseModalOpen(true);
  };

  const handleResponseSubmit = async () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      setSubmitting(true);
      await respondToFeedback(selectedFeedback._id, { staffResponse: responseText });

      // Update local state
      const updatedFeedback = feedback.map(item =>
        item._id === selectedFeedback._id
          ? { ...item, staffResponse: responseText, isResolved: true }
          : item
      );

      setFeedback(updatedFeedback);
      setResponseModalOpen(false);
      toast.success('Response submitted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to submit response. Please try again.');
      console.error('Error submitting response:', err);
    } finally {
      setSubmitting(false);
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
        <span className="ml-2 text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-50 border-green-200';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="text-green-500" size={16} />;
      case 'declining':
        return <TrendingDown className="text-red-500" size={16} />;
      default:
        return <BarChart3 className="text-gray-500" size={16} />;
    }
  };

  const getTrendText = (trend) => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      default:
        return 'Stable';
    }
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
        <div className="mb-4">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-sm text-gray-600">
            Debug info: User ID: {user?.id}, Canteen ID: {user?.canteenId}, Role: {user?.role}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchFeedback}
          disabled={!user?.canteenId}
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
          View and respond to customer feedback
        </p>

      </div>

      {/* Enhanced Feedback Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Stats */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-semibold mb-4">Feedback Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${getRatingColor(averageRatings.overallRating)}`}>
              <p className="text-sm font-medium mb-1">Overall Rating</p>
              <div className="flex items-center">
                <Star className="text-yellow-400 mr-1" size={20} fill="#FBBF24" />
                <span className="text-2xl font-bold">{Number(averageRatings.overallRating).toFixed(1)}</span>
                <span className="text-sm text-gray-500 ml-2">/ 5.0</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">From {totalFeedback} reviews</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 font-medium mb-1">Food Quality</p>
              <div className="flex items-center">
                <Star className="text-yellow-400 mr-1" size={20} fill="#FBBF24" />
                <span className="text-2xl font-bold text-purple-800">{Number(averageRatings.foodQuality).toFixed(1)}</span>
                <span className="text-sm text-gray-500 ml-2">/ 5.0</span>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <p className="text-sm text-indigo-700 font-medium mb-1">Service Speed</p>
              <div className="flex items-center">
                <Clock className="text-indigo-500 mr-1" size={20} />
                <span className="text-2xl font-bold text-indigo-800">{Number(averageRatings.serviceSpeed).toFixed(1)}</span>
                <span className="text-sm text-gray-500 ml-2">/ 5.0</span>
              </div>
            </div>

            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <p className="text-sm text-teal-700 font-medium mb-1">App Experience</p>
              <div className="flex items-center">
                <Star className="text-yellow-400 mr-1" size={20} fill="#FBBF24" />
                <span className="text-2xl font-bold text-teal-800">{Number(averageRatings.appExperience).toFixed(1)}</span>
                <span className="text-sm text-gray-500 ml-2">/ 5.0</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Analytics Panel */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Analytics</h3>
          <div className="space-y-4">
            {/* Response Rate */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">Response Rate</span>
                <CheckCircle className="text-blue-500" size={16} />
              </div>
              <div className="text-2xl font-bold text-blue-800">{feedbackAnalytics.responseRate}%</div>
            </div>

            {/* Trend */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Recent Trend</span>
                {getTrendIcon(feedbackAnalytics.recentTrend)}
              </div>
              <div className="text-lg font-semibold text-gray-800">{getTrendText(feedbackAnalytics.recentTrend)}</div>
            </div>

            {/* Urgent Feedback */}
            {feedbackAnalytics.urgentFeedback > 0 && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-700">Urgent Feedback</span>
                  <AlertTriangle className="text-red-500" size={16} />
                </div>
                <div className="text-2xl font-bold text-red-800">{feedbackAnalytics.urgentFeedback}</div>
                <div className="text-xs text-red-600">Needs immediate attention</div>
              </div>
            )}

            {/* Rating Distribution */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Rating Distribution</span>
                <PieChart className="text-gray-500" size={16} />
              </div>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center justify-between text-xs">
                    <span className="flex items-center">
                      <Star size={12} fill="#FBBF24" className="text-yellow-400 mr-1" />
                      {rating}
                    </span>
                    <span className="font-medium">{feedbackAnalytics.ratingDistribution[rating] || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Menu Insights Toggle */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenuInsights(!showMenuInsights)}
                className="w-full justify-between text-blue-700 hover:bg-blue-100"
              >
                <span className="flex items-center">
                  <BarChart3 className="mr-2" size={16} />
                  Menu Item Insights
                </span>
                {showMenuInsights ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Button>
              {showMenuInsights && (
                <div className="mt-3 text-xs text-blue-600">
                  <p>💡 <strong>Tip:</strong> Click on feedback cards to see which menu items were ordered. This helps identify which items receive the best/worst ratings!</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="text-gray-500 mr-2" size={20} />
          <h3 className="text-lg font-semibold">Filters & Search</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by comment or email..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
              value={filterRating}
              onChange={handleFilterRatingChange}
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

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterResolved}
              onChange={handleFilterResolvedChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="unresolved">Needs Response</option>
              <option value="resolved">Responded</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              value={filterDateRange}
              onChange={handleFilterDateRangeChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Category Filter Row */}
        <div className="mt-4 flex flex-wrap gap-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 w-full">Quick Filters:</label>
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Feedback
          </button>
          <button
            onClick={() => setFilterCategory('urgent')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filterCategory === 'urgent'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle size={14} className="inline mr-1" />
            Urgent ({feedbackAnalytics.urgentFeedback})
          </button>
          <button
            onClick={() => setFilterCategory('high')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filterCategory === 'high'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ThumbsUp size={14} className="inline mr-1" />
            High Ratings (4-5★)
          </button>
          <button
            onClick={() => setFilterCategory('low')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filterCategory === 'low'
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ThumbsDown size={14} className="inline mr-1" />
            Low Ratings (1-2★)
          </button>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filterRating || filterResolved !== 'all' || filterDateRange !== 'all' || filterCategory !== 'all') && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterRating('');
                setFilterResolved('all');
                setFilterDateRange('all');
                setFilterCategory('all');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <Card className="p-6 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Feedback Found</h3>
          <p className="text-gray-600 mb-4">
            {feedback.length === 0
              ? "You haven't received any feedback yet."
              : "No feedback matches your search criteria."}
          </p>
          <div className="text-xs text-gray-400 mb-6 p-3 bg-gray-50 rounded">
            <p><strong>Debug Info:</strong></p>
            <p>Total feedback: {feedback.length}</p>
            <p>Filtered feedback: {filteredFeedback.length}</p>
            <p>Canteen ID: {user?.canteenId}</p>
            <p>Search term: "{searchTerm}"</p>
            <p>Rating filter: {filterRating || 'None'}</p>
            <p>Status filter: {filterResolved}</p>
            <p>Date filter: {filterDateRange}</p>
            <p>Category filter: {filterCategory}</p>
          </div>
          {feedback.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterRating('');
                setFilterResolved('all');
                setFilterDateRange('all');
                setFilterCategory('all');
              }}
            >
              Clear All Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((item) => (
            <Card key={item._id} className={`p-4 transition-all hover:shadow-md ${
              item.rating <= 2 && !item.isResolved ? 'border-l-4 border-l-red-400 bg-red-50' :
              item.rating >= 4 ? 'border-l-4 border-l-green-400 bg-green-50' :
              'border-l-4 border-l-gray-300'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {renderStars(item.rating)}

                    {/* Priority Badge */}
                    {item.rating <= 2 && !item.isResolved && (
                      <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs flex items-center">
                        <AlertTriangle size={12} className="mr-1" />
                        Urgent
                      </span>
                    )}

                    {/* Status Badge */}
                    {item.isResolved && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs flex items-center">
                        <CheckCircle size={12} className="mr-1" />
                        Responded
                      </span>
                    )}

                    {/* High Rating Badge */}
                    {item.rating >= 4.5 && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center">
                        <ThumbsUp size={12} className="mr-1" />
                        Excellent
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="font-medium">{item.email}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>

                  {/* Quick preview of comment */}
                  {item.comment && (
                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                      "{item.comment.length > 100 ? item.comment.substring(0, 100) + '...' : item.comment}"
                    </p>
                  )}
                </div>

                <div className="flex items-center ml-4">
                  {!item.isResolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={`mr-2 ${
                        item.rating <= 2 ? 'border-red-300 text-red-700 hover:bg-red-50' : ''
                      }`}
                      onClick={() => handleRespondClick(item)}
                    >
                      <Send size={14} className="mr-1" />
                      Respond
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(item._id)}
                  >
                    {expandedFeedback === item._id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                </div>
              </div>

              {expandedFeedback === item._id && (
                <div className="mt-4 pt-4 border-t">
                  {/* Detailed Ratings */}
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

                  {/* Order Information */}
                  {item.orderId && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <ShoppingBag className="text-blue-600 mr-2" size={16} />
                        <p className="text-sm font-medium text-blue-800">Order Information</p>
                      </div>
                      <div className="text-xs text-blue-700">
                        <p><strong>Order ID:</strong> {item.orderId?.orderId || 'N/A'}</p>
                        <p><strong>Order Date:</strong> {item.orderId?.orderDate ? formatDate(item.orderId.orderDate) : 'N/A'}</p>
                        {showMenuInsights && (
                          <div className="mt-2">
                            <p className="text-blue-600 font-medium">💡 Menu Item Analysis:</p>
                            <p className="text-xs">This feedback is linked to a specific order. Menu item performance insights can help you understand which items contribute to customer satisfaction.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Customer Comment */}
                  {item.comment && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Customer Comment</p>
                      <p className="text-sm p-3 bg-gray-50 rounded-md border-l-4 border-l-gray-400">{item.comment}</p>
                    </div>
                  )}

                  {/* Staff Response */}
                  {item.staffResponse && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Your Response</p>
                      <p className="text-sm p-3 bg-blue-50 rounded-md text-blue-800 border-l-4 border-l-blue-400">{item.staffResponse}</p>
                    </div>
                  )}

                  {/* Action Insights */}
                  {!item.isResolved && (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <div className="flex items-start">
                        <AlertTriangle className="text-yellow-600 mr-2 mt-0.5" size={16} />
                        <div className="text-xs text-yellow-800">
                          <p className="font-medium mb-1">Action Required</p>
                          <p>This feedback hasn't been responded to yet. Consider responding to show customers that you value their input and are committed to improving their experience.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Response Modal */}
      <Modal
        isOpen={responseModalOpen}
        onClose={() => setResponseModalOpen(false)}
        title="Respond to Feedback"
      >
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Responding to feedback from: <span className="font-medium">{selectedFeedback?.email}</span>
          </p>
          <div className="mb-2">{selectedFeedback && renderStars(selectedFeedback.rating)}</div>
          {selectedFeedback?.comment && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Customer Comment</p>
              <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedFeedback.comment}</p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-1">
            Your Response <span className="text-red-500">*</span>
          </label>
          <textarea
            id="response"
            rows="4"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type your response here..."
          ></textarea>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setResponseModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleResponseSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader size="sm" className="mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Submit Response
              </>
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default FeedbackManagement;
