import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Contact = () => {
  return (
    <div className="bg-primary-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600"></div>
        <div className="absolute inset-0 bg-[url('/src/assets/pattern-dots.png')] opacity-10"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6 text-white">Contact Us</h1>
          <div className="w-24 h-1 bg-white mx-auto mb-6 rounded-full opacity-70"></div>
          <p className="text-xl max-w-2xl mx-auto text-white/90">
            We'd love to hear from you! Reach out to the KLE Technological University Canteen team.
          </p>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact Details */}
          <div className="space-y-8">
            <div className="mb-10">
              <h2 className="text-4xl font-bold text-neutral-800 mb-6">Get in Touch</h2>
              <div className="w-16 h-1 bg-primary-400 mb-6 rounded-full"></div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-5 p-5 bg-primary-50 rounded-xl shadow-card border border-primary-200 hover:border-primary-300 transition-colors">
              <div className="bg-primary-200 p-4 rounded-full shadow-sm">
                <MapPin className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-2">Address</h3>
                <p className="text-primary-700 leading-relaxed">
                  KLE Technological University<br />
                  Vidyanagar, Hubballi – 580031<br />
                  Dharwad District, Karnataka, India
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-5 p-5 bg-accent-50 rounded-xl shadow-card border border-accent-200 hover:border-accent-300 transition-colors">
              <div className="bg-accent-200 p-4 rounded-full shadow-sm">
                <Phone className="h-7 w-7 text-accent-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-accent-800 mb-2">Phone</h3>
                <p className="text-accent-700 leading-relaxed">+91 836 237 8123</p>
                <p className="text-sm text-accent-600 mt-1">
                  (For university inquiries — for canteen-specific numbers, check with admin office)
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-5 p-5 bg-secondary-50 rounded-xl shadow-card border border-secondary-200 hover:border-secondary-300 transition-colors">
              <div className="bg-secondary-200 p-4 rounded-full shadow-sm">
                <Mail className="h-7 w-7 text-secondary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-2">Email</h3>
                <p className="text-secondary-700 leading-relaxed">
                  General: <a href="mailto:info@kletech.ac.in" className="text-primary-600 hover:text-primary-700 hover:underline transition-colors">info@kletech.ac.in</a>
                </p>
                <p className="text-secondary-700 leading-relaxed mt-1">
                  Canteen: <a href="mailto:canteen@kletech.ac.in" className="text-primary-600 hover:text-primary-700 hover:underline transition-colors">canteen@kletech.ac.in</a>
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start space-x-5 p-5 bg-primary-50 rounded-xl shadow-card border border-primary-200 hover:border-primary-300 transition-colors">
              <div className="bg-primary-200 p-4 rounded-full shadow-sm">
                <Clock className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary-800 mb-2">Operating Hours</h3>
                <p className="text-primary-700 leading-relaxed">
                  Monday to Friday: 8:00 AM – 8:00 PM<br />
                  Saturday & Sunday: 9:00 AM – 6:00 PM
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-10 p-5 bg-primary-100 rounded-xl shadow-card border border-primary-200">
              <h3 className="text-xl font-semibold text-primary-800 mb-5">Connect With Us</h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/kletechbvb/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-200 p-3 rounded-full hover:bg-primary-300 transition-all duration-300 transform hover:scale-110 shadow-sm"
                >
                  <Facebook className="h-6 w-6 text-primary-600" />
                </a>
                <a
                  href="https://www.instagram.com/KLETechbvb/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent-200 p-3 rounded-full hover:bg-accent-300 transition-all duration-300 transform hover:scale-110 shadow-sm"
                >
                  <Instagram className="h-6 w-6 text-accent-600" />
                </a>
                <a
                  href="https://x.com/kletechbvb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-200 p-3 rounded-full hover:bg-primary-300 transition-all duration-300 transform hover:scale-110 shadow-sm"
                >
                  <Twitter className="h-6 w-6 text-primary-600" />
                </a>
                <a
                  href="https://www.youtube.com/c/KLETechnologicalUniversity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent-200 p-3 rounded-full hover:bg-accent-300 transition-all duration-300 transform hover:scale-110 shadow-sm"
                >
                  <Youtube className="h-6 w-6 text-accent-600" />
                </a>
              </div>
            </div>
          </div>

          {/* Map and Form */}
          <div>
            <div className="mb-10">
              <h2 className="text-4xl font-bold text-neutral-800 mb-6">Send a Message</h2>
              <div className="w-16 h-1 bg-accent-400 mb-6 rounded-full"></div>
            </div>

            {/* Google Map */}
            <div className="rounded-xl overflow-hidden shadow-card h-80 mb-10 border border-neutral-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3847.7346358950483!2d75.12108731479055!3d15.368496989265382!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb8d7d9844c7d01%3A0xc27e08eb6e4db0c!2sKLE%20Technological%20University!5e0!3m2!1sen!2sin!4v1652345678901!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="KLE Technological University Map"
              ></iframe>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-primary-100 to-primary-50 p-8 rounded-xl shadow-card border border-primary-200">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-primary-800 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-3 border border-primary-200 bg-primary-50 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary-800 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-3 border border-primary-200 bg-primary-50 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
                      placeholder="Your email"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-primary-800 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 border border-primary-200 bg-primary-50 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
                    placeholder="Subject of your message"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-primary-800 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    className="w-full px-4 py-3 border border-primary-200 bg-primary-50 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
                    placeholder="Your message"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-500 text-white py-3 px-6 rounded-lg hover:bg-primary-600 transition-all duration-300 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
