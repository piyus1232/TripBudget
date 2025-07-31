import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate, NavLink } from "react-router-dom";
import Login from '../../components/authpages/Login';
import Register from '../../components/authpages/Register';
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Plane,
  MapPin,
  X,
  Menu,
  Clock,
  Phone,
  Mail,
  Instagram,
  Send,
  Globe,
  Calendar,
  Camera,
  Shield,
} from "lucide-react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-slate-900/90 rounded-xl p-6 sm:p-8 max-w-md w-full border border-slate-800/50 shadow-lg"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-6 h-6" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
};

const ContactPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsLoading(true);
        await axios.post("http://localhost:3000/api/v1/users/form", formData, {
          withCredentials: true,
        });
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } catch (error) {
        setIsLoading(false);
        toast.error("Response failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#171221] text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Floating Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rotate-45 animate-bounce" style={{ animationDelay: "0s", animationDuration: "6s" }} />
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full animate-pulse" style={{ animationDelay: "2s", animationDuration: "4s" }} />
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-gradient-to-br from-green-500/10 to-teal-500/10 rotate-12 animate-spin" style={{ animationDuration: "20s" }} />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b border-slate-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Plane className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  TripBudget
                </span>
                <div className="text-xs sm:text-sm text-slate-400">
                  Smart Travel Planner Platform
                </div>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  `text-base lg:text-lg font-medium transition-colors ${isActive ? "text-blue-400" : "text-slate-300 hover:text-white"}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-base lg:text-lg font-medium transition-colors ${isActive ? "text-blue-400" : "text-slate-300 hover:text-white"}`
                }
              >
                About
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `text-base lg:text-lg font-medium transition-colors ${isActive ? "text-blue-400" : "text-slate-300 hover:text-white"}`
                }
              >
                Contact us
              </NavLink>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="sm:hidden bg-[#1a1a1a] hover:bg-[#2d2d2d] text-white p-2 rounded-md transition-colors">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(true)}
                className="text-white"
              >
                <Menu className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Desktop Login/Register Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRegisterOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-xl font-semibold text-base sm:text-lg shadow-lg"
              >
                Register
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLoginOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-xl font-semibold text-base sm:text-lg shadow-lg"
              >
                Login
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-4/5 sm:w-3/5 max-w-xs bg-slate-900/95 backdrop-blur-md border-l border-slate-800/50 md:hidden"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    TripBudget
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
                <div className="flex flex-col space-y-6">
                  <NavLink
                    to="/home"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-lg font-medium transition-colors ${isActive ? "text-blue-400" : "text-slate-300 hover:text-white"}`
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-lg font-medium transition-colors ${isActive ? "text-blue-400" : "text-slate-300 hover:text-white"}`
                    }
                  >
                    About
                  </NavLink>
                  <NavLink
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-lg font-medium transition-colors ${isActive ? "text-blue-400" : "text-slate-300 hover:text-white"}`
                    }
                  >
                    Contact us
                  </NavLink>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsRegisterOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-xl font-semibold text-lg"
                  >
                    Register
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsLoginOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-xl font-semibold text-lg"
                  >
                    Login
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main Content */}
      <div className="relative pt-32 pb-16 px-4 sm:px-6">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20 relative z-10"
        >
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Get In Touch
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Ready to plan your next adventure? Connect with us through any of
            these platforms. We're here to help make your travel dreams come
            true.
          </p>
        </motion.section>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Availability Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Availability</h2>
              <p className="text-lg text-slate-400">
                Here's when you can typically expect responses from our travel
                experts
              </p>
            </div>

            <div className="max-w-2xl mx-auto bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
              <div className="flex items-center mb-6">
                <Clock className="w-6 h-6 text-blue-400 mr-3" />
                <h3 className="text-xl font-bold">Response Times</h3>
              </div>

              <div className="space-y-4">
                {[
                  { day: "Monday - Friday", time: "9:00 AM - 6:00 PM IST" },
                  { day: "Saturday", time: "10:00 AM - 4:00 PM IST" },
                  { day: "Sunday", time: "Closed", isSpecial: true },
                ].map((schedule) => (
                  <div
                    key={schedule.day}
                    className="flex justify-between items-center py-3 border-b border-slate-700/50 hover:bg-slate-800/30 rounded-lg px-2 transition-colors"
                  >
                    <span className="font-semibold">{schedule.day}</span>
                    <span
                      className={
                        schedule.isSpecial ? "text-red-400" : "text-slate-300"
                      }
                    >
                      {schedule.time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-500/15 border-l-4 border-blue-400 rounded-r-xl backdrop-blur-sm">
                <p className="text-sm">
                  <strong>Note:</strong> For urgent travel assistance, please
                  mention "URGENT" in your subject line. We'll prioritize your
                  request and respond as quickly as possible.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Contact Methods Grid */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-20"
          >
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Phone,
                  title: "Phone Support",
                  content: "+91 7597088557",
                  description:
                    "Available during business hours for urgent travel assistance.",
                  gradient: "from-green-500 to-emerald-600",
                },
                {
                  icon: MapPin,
                  title: "Location",
                  content: "Jaipur, Rajasthan, India",
                  description:
                    "Based in the Pink City, serving travelers worldwide with personalized trip planning.",
                  gradient: "from-blue-500 to-cyan-600",
                },
                {
                  icon: Globe,
                  title: "Travel Coverage",
                  content: "All India Destinations",
                  description:
                    "Specializing in domestic travel across India with local expertise and insider knowledge.",
                  gradient: "from-purple-500 to-indigo-600",
                },
              ].map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <motion.div
                    key={contact.title}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`bg-gradient-to-br ${contact.gradient} rounded-2xl p-8 text-white relative overflow-hidden group cursor-pointer`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                      <Icon className="w-8 h-8 mb-4" />
                      <h3 className="text-2xl font-bold mb-4">{contact.title}</h3>
                      <p className="text-xl font-semibold mb-2">{contact.content}</p>
                      <p className="text-white/80">{contact.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Social & Professional Links */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-20"
          >
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Mail,
                  title: "Email Us",
                  link: "contact@tripbudget.com",
                  description:
                    "Drop us a line anytime. We usually respond within 24 hours with detailed travel information.",
                  gradient: "from-blue-500 to-blue-600",
                },
                {
                  icon: Instagram,
                  title: "Follow Our Journey",
                  content: "@tripbudget_india",
                  link: "insta.com",
                  description:
                    "Get daily travel inspiration, destination highlights, and behind-the-scenes content.",
                  gradient: "from-pink-500 to-rose-600",
                },
                {
                  icon: Camera,
                  title: "Github",
                  content: "View Our Repositories",
                  description:
                    "Find stunning photography from our featured destinations and customer trips.",
                  gradient: "from-orange-500 to-yellow-500",
                },
              ].map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <motion.div
                    key={contact.title}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`bg-gradient-to-br ${contact.gradient} rounded-2xl p-8 text-white relative overflow-hidden group cursor-pointer`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                      <Icon className="w-8 h-8 mb-4" />
                      <h3 className="text-2xl font-bold mb-4">{contact.title}</h3>
                      <p className="text-xl font-semibold mb-2">{contact.content}</p>
                      <p className="text-white/80">{contact.description}</p>
                      {contact.link && (
                        <a
                          href={`https://${contact.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline mt-2 inline-block"
                        >
                          Visit
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Contact Form */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Plan Your Trip</h2>
              <p className="text-lg text-slate-400">
                Tell us about your travel dreams and we'll create the perfect
                itinerary for you.
              </p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/60 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all backdrop-blur-sm"
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/60 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all backdrop-blur-sm"
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Travel Inquiry Type
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/60 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all backdrop-blur-sm"
                    placeholder="e.g., Family trip to Himachal, Solo adventure in Rajasthan"
                  />
                  {errors.subject && (
                    <p className="text-red-400 text-sm mt-1">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Tell Us About Your Dream Trip
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/60 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all resize-none backdrop-blur-sm"
                    placeholder="Share your travel preferences, budget, dates, group size, and any special requirements..."
                  />
                  {errors.message && (
                    <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                <motion.button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:from-blue-400 hover:to-cyan-400 relative overflow-hidden disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Planning Your Trip...
                      </>
                    ) : (
                      <>
                        Start Planning My Adventure
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* Why Choose Us Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Why Travelers Choose TripBudget
              </h2>
              <p className="text-lg text-slate-400">
                Join thousands of satisfied travelers who've saved money and
                created unforgettable memories
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: Globe,
                  title: "AI Trip Planning",
                  description: "Smart route optimization saves up to 60%",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Camera,
                  title: "Hidden Gems",
                  description: "Discover secret spots locals love",
                  color: "from-purple-500 to-pink-500",
                },
                {
                  icon: Shield,
                  title: "Safe & Secure",
                  description: "100% secure booking with TripBudget",
                  color: "from-emerald-500 to-green-500",
                },
                {
                  icon: Calendar,
                  title: "Flexible Dates",
                  description: "Find the best deals with smart comparison",
                  color: "from-orange-500 to-yellow-500",
                },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 text-center shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        </div>
      </div>

      <AnimatePresence>
        <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
          <Login onClose={() => setIsLoginOpen(false)} />
        </Modal>
        <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)}>
          <Register onClose={() => setIsRegisterOpen(false)} />
        </Modal>
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>© 2025 TripBudget. All rights reserved. Making travel affordable for everyone.</p>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;