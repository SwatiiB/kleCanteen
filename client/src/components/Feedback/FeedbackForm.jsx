import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Star, Send, AlertCircle } from 'lucide-react';
import { submitFeedback, canSubmitFeedback } from '../../services/feedback';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Loader from '../UI/Loader';

const FeedbackForm = ({ orderId, canteenId, onFeedbackSubmitted }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    foodQuality: 0,
    serviceSpeed: 0,
    appExperience: 0,
    comment: '',
  });

  const [hoveredRating, setHoveredRating] = useState({
    rating: 0,
    foodQuality: 0,
    serviceSpeed: 0,
    appExperience: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [canSubmit, setCanSubmit] = useState(true);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  // Check if user can submit feedback for this canteen
  useEffect(() => {
    const checkFeedbackEligibility = async () => {
      if (!canteenId) {
        console.log('No canteenId provided, skipping eligibility check');
        return;
      }

      try {
        setCheckingEligibility(true);
        console.log('Checking feedback eligibility for canteenId:', canteenId);
        const { canSubmit: isEligible } = await canSubmitFeedback(canteenId);
        console.log('Feedback eligibility result:', isEligible);
        setCanSubmit(isEligible);
      } catch (err) {
        console.error('Error checking feedback eligibility:', err);
        // Default to allowing feedback if check fails
        setCanSubmit(true);
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkFeedbackEligibility();
  }, [canteenId]);

  const handleRatingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleHover = (field, value) => {
    setHoveredRating(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHoverLeave = (field) => {
    setHoveredRating(prev => ({
      ...prev,
      [field]: 0
    }));
  };

  const handleCommentChange = (e) => {
    setFormData(prev => ({
      ...prev,
      comment: e.target.value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Please provide an overall rating';
    }

    if (formData.foodQuality === 0) {
      newErrors.foodQuality = 'Please rate the food quality';
    }

    if (formData.serviceSpeed === 0) {
      newErrors.serviceSpeed = 'Please rate the service speed';
    }

    if (formData.appExperience === 0) {
      newErrors.appExperience = 'Please rate the app experience';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const feedbackData = {
        ...formData,
        orderId,
        canteenId
      };

      await submitFeedback(feedbackData);

      toast.success('Thank you for your feedback!');

      // Reset form
      setFormData({
        rating: 0,
        foodQuality: 0,
        serviceSpeed: 0,
        appExperience: 0,
        comment: '',
      });

      // Notify parent component
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit feedback. Please try again.');
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (field, label, required = true) => {
    const currentRating = formData[field];
    const currentHover = hoveredRating[field];

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-primary-800 mb-1">
          {label} {required && <span className="text-accent-500">*</span>}
        </label>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(field, star)}
              onMouseEnter={() => handleHover(field, star)}
              onMouseLeave={() => handleHoverLeave(field)}
              className="p-1 focus:outline-none"
            >
              <Star
                size={24}
                fill={star <= (currentHover || currentRating) ? '#FBBF24' : 'none'}
                stroke={star <= (currentHover || currentRating) ? '#FBBF24' : '#9CA3AF'}
                className="transition-colors duration-150"
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {currentRating > 0 ? `${currentRating} star${currentRating !== 1 ? 's' : ''}` : 'Not rated'}
          </span>
        </div>
        {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]}</p>}
      </div>
    );
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Rate Your Experience</h3>

      {checkingEligibility ? (
        <div className="flex justify-center items-center py-8">
          <Loader size="md" />
        </div>
      ) : !canSubmit ? (
        <div className="bg-yellow-50 p-4 rounded-md mb-4">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Cannot Submit Feedback</h4>
              <p className="text-sm text-yellow-700 mt-1">
                You can only submit feedback for canteens where you have placed and received orders.
                Please ensure your order has been delivered or completed before submitting feedback.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">
            Your feedback helps us improve our service. Please take a moment to rate your experience.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {renderStars('rating', 'Overall Rating')}
              {renderStars('foodQuality', 'Food Quality')}
              {renderStars('serviceSpeed', 'Service Speed')}
              {renderStars('appExperience', 'App Experience')}

              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-primary-800 mb-1">
                  Additional Comments (Optional)
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows="3"
                  value={formData.comment}
                  onChange={handleCommentChange}
                  className="w-full rounded-md border border-primary-300 px-3 py-2 text-sm bg-primary-50 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tell us more about your experience..."
                ></textarea>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </Card>
  );
};

export default FeedbackForm;
