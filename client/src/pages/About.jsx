import {
  BookOpen,
  Utensils,
  Clock,
  ShoppingBag,
  Award,
  Users,
  Truck,
  Star,
  Shield,
  Smartphone
} from 'lucide-react';
import Card from '../components/UI/Card';

const About = () => {
  return (
    <div className="bg-primary-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800"></div>
        <div className="absolute inset-0 bg-[url('/src/assets/pattern-dots.png')] opacity-10"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6 text-white">About KLE Canteen</h1>
          <div className="w-24 h-1 bg-accent-400 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl max-w-2xl mx-auto text-white/90">
            Streamlining food ordering at KLETECH campus with a modern, efficient solution.
          </p>
        </div>
      </div>

      {/* Mission Statement Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div className="inline-block p-5 bg-primary-100 rounded-full mb-8 shadow-sm">
            <BookOpen className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="text-4xl font-bold text-neutral-800 mb-6">Our Mission</h2>
          <div className="w-16 h-1 bg-primary-400 mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-neutral-600 leading-relaxed">
            KLE Canteen was created to revolutionize the campus dining experience at KLE Technological University.
            We aim to eliminate long queues, reduce wait times, and make ordering food from campus canteens
            a seamless, enjoyable experience for students and faculty alike.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-neutral-800 text-center mb-6">Key Features</h2>
          <div className="w-16 h-1 bg-accent-400 mx-auto mb-16 rounded-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card
              className="text-center p-8 hover:shadow-hover transition-all duration-300 transform hover:-translate-y-2"
              hover={true}
              border={true}
            >
              <div className="inline-block p-4 bg-primary-100 rounded-full mb-6 shadow-sm">
                <Utensils className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Menu Browsing</h3>
              <p className="text-neutral-600">
                Browse complete menus from all campus canteens in one place, with detailed descriptions and images.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card
              className="text-center p-8 hover:shadow-hover transition-all duration-300 transform hover:-translate-y-2"
              hover={true}
              border={true}
            >
              <div className="inline-block p-4 bg-accent-100 rounded-full mb-6 shadow-sm">
                <ShoppingBag className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Easy Ordering</h3>
              <p className="text-neutral-600">
                Place orders with just a few clicks, customize your meals, and pay securely online.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card
              className="text-center p-8 hover:shadow-hover transition-all duration-300 transform hover:-translate-y-2"
              hover={true}
              border={true}
            >
              <div className="inline-block p-4 bg-secondary-100 rounded-full mb-6 shadow-sm">
                <Clock className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Time-Saving</h3>
              <p className="text-neutral-600">
                Skip the lines and save valuable time by ordering ahead and picking up your food when it's ready.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card
              className="text-center p-8 hover:shadow-hover transition-all duration-300 transform hover:-translate-y-2"
              hover={true}
              border={true}
            >
              <div className="inline-block p-4 bg-primary-100 rounded-full mb-6 shadow-sm">
                <Truck className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Pickup & Delivery</h3>
              <p className="text-neutral-600">
                Choose between convenient pickup options or have your food delivered to your location on campus.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card
              className="text-center p-8 hover:shadow-hover transition-all duration-300 transform hover:-translate-y-2"
              hover={true}
              border={true}
            >
              <div className="inline-block p-4 bg-accent-100 rounded-full mb-6 shadow-sm">
                <Star className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Ratings & Feedback</h3>
              <p className="text-neutral-600">
                Rate your meals and provide feedback to help improve the quality of campus food services.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card
              className="text-center p-8 hover:shadow-hover transition-all duration-300 transform hover:-translate-y-2"
              hover={true}
              border={true}
            >
              <div className="inline-block p-4 bg-secondary-100 rounded-full mb-6 shadow-sm">
                <Smartphone className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-4">Mobile Friendly</h3>
              <p className="text-neutral-600">
                Access CanteenConnect from any device with our responsive design that works on desktops, tablets, and phones.
              </p>
            </Card>
          </div>
        </div>

        {/* Special Features Section */}
        <div className="bg-gradient-to-br from-primary-50 to-neutral-50 rounded-xl p-10 mb-20 shadow-card border border-primary-100">
          <h2 className="text-4xl font-bold text-neutral-800 text-center mb-6">Special Features</h2>
          <div className="w-16 h-1 bg-primary-400 mx-auto mb-12 rounded-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Special Feature 1 */}
            <div className="flex items-start space-x-5 bg-primary-50 p-6 rounded-xl shadow-sm border border-primary-200 hover:border-primary-300 transition-colors">
              <div className="bg-primary-200 p-4 rounded-full flex-shrink-0 shadow-sm">
                <Award className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-3">Priority Ordering During Exams</h3>
                <p className="text-primary-700 leading-relaxed">
                  Students with exams and faculty with exam duties can place priority orders that are processed faster,
                  ensuring they can get back to their academic responsibilities quickly.
                </p>
              </div>
            </div>

            {/* Special Feature 2 */}
            <div className="flex items-start space-x-5 bg-accent-50 p-6 rounded-xl shadow-sm border border-accent-200 hover:border-accent-300 transition-colors">
              <div className="bg-accent-200 p-4 rounded-full flex-shrink-0 shadow-sm">
                <Users className="h-7 w-7 text-accent-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-accent-800 mb-3">Staff Management</h3>
                <p className="text-accent-700 leading-relaxed">
                  Canteen staff have dedicated interfaces to manage menu items, track orders, and respond to customer feedback,
                  improving operational efficiency.
                </p>
              </div>
            </div>

            {/* Special Feature 3 */}
            <div className="flex items-start space-x-5 bg-secondary-50 p-6 rounded-xl shadow-sm border border-secondary-200 hover:border-secondary-300 transition-colors">
              <div className="bg-secondary-200 p-4 rounded-full flex-shrink-0 shadow-sm">
                <Shield className="h-7 w-7 text-secondary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-3">Secure Payments</h3>
                <p className="text-secondary-700 leading-relaxed">
                  Integrated with secure payment gateways to ensure all transactions are safe and protected,
                  giving users peace of mind when ordering.
                </p>
              </div>
            </div>

            {/* Special Feature 4 */}
            <div className="flex items-start space-x-5 bg-primary-50 p-6 rounded-xl shadow-sm border border-primary-200 hover:border-primary-300 transition-colors">
              <div className="bg-primary-200 p-4 rounded-full flex-shrink-0 shadow-sm">
                <Clock className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-3">Real-time Order Tracking</h3>
                <p className="text-primary-700 leading-relaxed">
                  Track your order status in real-time from preparation to delivery, with estimated delivery times
                  and notifications when your order is ready.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-br from-primary-600 to-primary-700 text-white py-16 px-6 rounded-2xl shadow-lg">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <div className="w-16 h-1 bg-white mx-auto mb-8 rounded-full opacity-70"></div>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of KLETECH students and faculty who are already enjoying the convenience of CanteenConnect.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="/register"
              className="bg-white text-primary-600 py-4 px-8 rounded-xl font-bold hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create an Account
            </a>
            <a
              href="/canteens"
              className="bg-primary-500 text-white py-4 px-8 rounded-xl font-bold border-2 border-white/30 hover:bg-primary-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Explore Canteens
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
