import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ChevronDown, ChevronUp, MessageSquare, Tag, Clock } from 'lucide-react';
import { getAllCanteens } from '../services/canteen';
import { getAllMenuItems } from '../services/menu';
import { getAllFeedback } from '../services/feedback';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../components/Home/carousel.css';

const Home = () => {
  const [canteens, setCanteens] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);

  // Slider settings for featured menu items
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch canteens
        const canteensResponse = await getAllCanteens();
        console.log('Canteens API response:', canteensResponse);

        // Handle different response formats
        let canteensData;
        if (canteensResponse.canteens && Array.isArray(canteensResponse.canteens)) {
          canteensData = canteensResponse.canteens;
        } else if (Array.isArray(canteensResponse)) {
          canteensData = canteensResponse;
        } else {
          throw new Error('Invalid canteens data format');
        }

        // Filter to only show available canteens
        const availableCanteens = canteensData.filter(canteen =>
          canteen.isAvailable !== undefined ? canteen.isAvailable : canteen.availability
        );

        // Only show the first 3 canteens on the homepage
        setCanteens(availableCanteens.slice(0, 3));

        // Fetch menu items
        try {
          const menuResponse = await getAllMenuItems();
          console.log('Menu items response:', menuResponse);

          // Get only available items and limit to 8 for the carousel
          const availableItems = Array.isArray(menuResponse)
            ? menuResponse.filter(item => item.isAvailable !== false).slice(0, 8)
            : [];

          setMenuItems(availableItems);
        } catch (menuErr) {
          console.error('Error fetching menu items:', menuErr);
          setMenuItems([]); // Set empty array on error
        }

        // Fetch testimonials/feedback
        try {
          const feedbackResponse = await getAllFeedback();
          console.log('Feedback response:', feedbackResponse);

          // Get only feedback with good ratings (4-5 stars) and limit to 3
          const goodFeedback = Array.isArray(feedbackResponse)
            ? feedbackResponse
                .filter(feedback => feedback.rating >= 4)
                .slice(0, 3)
            : [];

          setTestimonials(goodFeedback);
        } catch (feedbackErr) {
          console.error('Error fetching feedback:', feedbackErr);
          setTestimonials([]); // Set empty array on error
        }

        setError(null);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle FAQ question
  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  return (
    <div className="bg-primary-200">
      {/* Hero section with gradient background and food imagery */}
      <section className="relative overflow-hidden rounded-2xl mb-16">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 opacity-90 z-10"></div>

        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Food background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-20 py-16 px-6 md:py-24 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Delicious Food, <span className="text-accent-300">Delivered Fast</span>
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Skip the lines and order your favorite meals from KLE campus canteens.
              Fast, convenient, and delicious!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/canteens" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="shadow-xl w-full sm:w-auto text-lg font-bold py-4 px-8 rounded-xl bg-accent-500 text-white hover:bg-accent-600 transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  Explore Canteens
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/menu" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  // variant="outline-accent"
                  className="w-full sm:w-auto text-lg font-bold py-3 px-8 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white/30 transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  Browse Menu
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-20"></div>
      </section>

      {/* Featured canteens section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-800">Featured Canteens</h2>
            <div className="h-1 w-20 bg-primary-500 mt-2 rounded-full"></div>
          </div>
          <Link to="/canteens" className="text-primary-600 hover:text-primary-700 flex items-center font-medium transition-colors">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader size="lg" className="mx-auto text-primary-500" />
            <p className="mt-4 text-neutral-600">Loading canteens...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-primary-50 rounded-xl shadow-sm border border-primary-200">
            <p className="text-accent-600 mb-4">{error}</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {canteens.length > 0 ? (
              canteens.map((canteen) => (
                <Card
                  key={canteen._id}
                  hover={true}
                  shadow="md"
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={(canteen.image && canteen.image.url) ? canteen.image.url : (canteen.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')}
                      alt={canteen.name}
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        (canteen.isAvailable !== undefined ? canteen.isAvailable : canteen.availability)
                          ? 'bg-secondary-500 text-white'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {(canteen.isAvailable !== undefined ? canteen.isAvailable : canteen.availability) ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-neutral-800 mb-2">{canteen.name}</h3>
                    <p className="text-neutral-600 mb-6 line-clamp-2">{canteen.description || 'Delicious food available at this canteen.'}</p>
                    <Link to={`/canteens/${canteen._id}`} className="w-full block">
                      <Button variant="primary" fullWidth>
                        View Menu
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-3 py-16 text-center bg-primary-50 rounded-xl border border-primary-200">
                <p className="text-primary-700">No canteens available at the moment.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Featured Menu Items Carousel */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-800">Featured Menu Items</h2>
            <div className="h-1 w-20 bg-accent-500 mt-2 rounded-full"></div>
          </div>
          <Link to="/menu" className="text-accent-600 hover:text-accent-700 flex items-center font-medium transition-colors">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader size="lg" className="mx-auto text-accent-500" />
            <p className="mt-4 text-neutral-600">Loading menu items...</p>
          </div>
        ) : menuItems.length > 0 ? (
          <div className="menu-carousel-container relative mb-10">
            <div className="menu-carousel">
              <Slider {...sliderSettings}>
                {menuItems.map((item) => (
                  <div key={item._id} className="px-2">
                    <Card
                      hover={true}
                      shadow="md"
                      className="overflow-hidden h-full"
                    >
                    <div className="relative">
                      <img
                        src={(item.image && item.image.url) ? item.image.url : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80'}
                        alt={item.itemName || item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-neutral-800 mb-1">{item.itemName || item.name}</h3>
                      <p className="text-sm text-neutral-600 mb-2 line-clamp-2">{item.description || 'Delicious food item'}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                          {item.category || 'Food'}
                        </span>
                        <Link to={`/canteens/${item.canteenId?._id || item.canteenId}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </Slider>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center bg-primary-50 rounded-xl border border-primary-200">
            <p className="text-primary-700">No menu items available at the moment.</p>
          </div>
        )}
      </section>

      {/* Special Features Showcase */}
      <section className="mb-16">
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 rounded-2xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* Left side - Feature cards */}
            <div className="md:col-span-7 p-8 md:p-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why Choose <span className="text-accent-300">KLE Canteen</span>?</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Feature 1 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform transition-all duration-300 hover:scale-105 hover:bg-white/20">
                  <div className="flex items-start">
                    <div className="bg-accent-500 rounded-full p-2 mr-3">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Priority Orders</h3>
                      <p className="text-white/80 text-sm">Get your food faster during exam season with our priority service</p>
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform transition-all duration-300 hover:scale-105 hover:bg-white/20">
                  <div className="flex items-start">
                    <div className="bg-accent-500 rounded-full p-2 mr-3">
                      <Tag className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Campus Exclusive</h3>
                      <p className="text-white/80 text-sm">Specially designed for KLE students and faculty needs</p>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform transition-all duration-300 hover:scale-105 hover:bg-white/20">
                  <div className="flex items-start">
                    <div className="bg-accent-500 rounded-full p-2 mr-3">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Top-Rated Food</h3>
                      <p className="text-white/80 text-sm">Discover highest-rated dishes from campus favorites</p>
                    </div>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 transform transition-all duration-300 hover:scale-105 hover:bg-white/20">
                  <div className="flex items-start">
                    <div className="bg-accent-500 rounded-full p-2 mr-3">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">Real Feedback</h3>
                      <p className="text-white/80 text-sm">Read authentic reviews from fellow students</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link to="/menu" className="flex-1">
                  <Button
                    size="lg"
                    className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold shadow-lg transform transition duration-300 hover:scale-105"
                  >
                    Explore Menu
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/canteens" className="flex-1">
                  <Button
                    size="lg"
                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 font-bold shadow-lg transform transition duration-300 hover:scale-105"
                  >
                    View Canteens
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side - Image collage */}
            <div className="hidden md:block md:col-span-5 relative">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-4">
                <div className="rounded-lg overflow-hidden shadow-lg transform rotate-2 hover:rotate-0 transition-all duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="Delicious pizza"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg transform -rotate-1 hover:rotate-0 transition-all duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="Fresh sandwich"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg transform -rotate-2 hover:rotate-0 transition-all duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1571066811602-716837d681de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="Refreshing beverage"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg transform rotate-1 hover:rotate-0 transition-all duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="Healthy salad"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700/80 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="mb-20 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-neutral-800 mb-3">How It Works</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Order your favorite campus food in just a few simple steps</p>
          <div className="h-1 w-20 bg-primary-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-primary-50 rounded-xl p-6 shadow-card text-center relative border border-primary-200">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
              <div className="bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">1</span>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-3 text-primary-800">Choose a Canteen</h3>
              <p className="text-primary-700">Browse through available canteens and select your favorite from our campus options.</p>
            </div>
          </div>

          <div className="bg-secondary-50 rounded-xl p-6 shadow-card text-center relative border border-secondary-200">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
              <div className="bg-secondary-500 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">2</span>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-3 text-secondary-800">Select Your Meal</h3>
              <p className="text-secondary-700">Pick your favorite items from the menu and add them to your cart with just a click.</p>
            </div>
          </div>

          <div className="bg-accent-50 rounded-xl p-6 shadow-card text-center relative border border-accent-200">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
              <div className="bg-accent-500 w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">3</span>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-3 text-accent-800">Place Your Order</h3>
              <p className="text-accent-700">Complete your order and pick it up when it's ready. No more waiting in lines!</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link to="/canteens">
            <Button variant="primary" size="lg" className="shadow-md">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-neutral-800 mb-3">What Our Customers Say</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Read reviews from students and faculty who use CanteenConnect</p>
          <div className="h-1 w-20 bg-primary-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((feedback) => (
              <Card key={feedback._id} className="p-6 h-full flex flex-col">
                <div className="flex items-start mb-4">
                  <div className="bg-primary-100 rounded-full p-3 mr-4">
                    <MessageSquare className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800">{feedback.email?.split('@')[0] || 'User'}</h3>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-neutral-600 text-sm flex-grow">
                  "{feedback.comment || 'Great experience ordering from CanteenConnect!'}"
                </p>
                <div className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-500 flex justify-between items-center">
                  <span>{feedback.canteenId?.name || 'Campus Canteen'}</span>
                  <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-50 rounded-xl p-8 text-center">
            <p className="text-neutral-600">No testimonials available yet. Be the first to leave a review!</p>
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-neutral-800 mb-3">Frequently Asked Questions</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Find answers to common questions about ordering from campus canteens</p>
          <div className="h-1 w-20 bg-primary-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="max-w-3xl mx-auto">
          {[
            {
              question: "How do I place an order?",
              answer: "Browse canteens, select menu items, add them to your cart, and proceed to checkout. You'll need to be logged in to complete your order."
            },
            {
              question: "What payment methods are accepted?",
              answer: "We accept online payments through Razorpay, which supports credit/debit cards, UPI, and net banking."
            },
            {
              question: "How long does it take to prepare my order?",
              answer: "Standard orders are typically ready in 10-20 minutes. Priority orders (with a small additional fee) are ready in 5-10 minutes."
            },
            {
              question: "Can I place a priority order?",
              answer: "Yes, students with exams and faculty with exam duties can place priority orders for a small additional fee of ₹5."
            },
            {
              question: "How do I provide feedback on my order?",
              answer: "After your order is delivered, you can rate and review your experience through the order details page."
            }
          ].map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                className={`w-full text-left p-4 rounded-lg flex justify-between items-center ${
                  activeQuestion === index ? 'bg-primary-50' : 'bg-white border border-neutral-200'
                }`}
                onClick={() => toggleQuestion(index)}
              >
                <span className="font-medium text-neutral-800">{faq.question}</span>
                {activeQuestion === index ? (
                  <ChevronUp className="h-5 w-5 text-primary-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-neutral-500" />
                )}
              </button>
              {activeQuestion === index && (
                <div className="p-4 bg-white border border-t-0 border-neutral-200 rounded-b-lg">
                  <p className="text-neutral-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
