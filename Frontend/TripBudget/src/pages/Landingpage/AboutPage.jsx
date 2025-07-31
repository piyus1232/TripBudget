import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from '../../components/authpages/Login';
import Register from '../../components/authpages/Register';
// import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, NavLink } from 'react-router-dom';
import { 
  Plane, 
  MapPin, 
  X, 
  Menu, 
  Users, 
  Award, 
  Heart, 
  Target, 
  Lightbulb, 
  Shield,
  Globe,
  Calendar,
  Camera,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';


const AboutPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
      const [isRegisterOpen, setIsRegisterOpen] = useState(false);;

  const backgroundImages = [
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=600&h=400&fit=crop"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, 0, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const stats = [
    { number: "50,000+", label: "Happy Travelers", icon: Users },
    { number: "500+", label: "Destinations Covered", icon: MapPin },
    { number: "60%", label: "Average Savings", icon: TrendingUp },
    { number: "4.9", label: "Customer Rating", icon: Star }
  ];

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "Every decision we make starts with our travelers' needs and dreams in mind.",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Your safety and security are our top priorities in every trip we plan.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We use cutting-edge AI technology to create smarter, more affordable travel experiences.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Globe,
      title: "Sustainability",
      description: "We promote responsible tourism that benefits local communities and preserves destinations.",
      gradient: "from-blue-500 to-cyan-500"
    }
  ];

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      description: "Travel enthusiast with 15+ years in the tourism industry",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      name: "Priya Sharma",
      role: "Head of Technology",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b639?w=400&h=400&fit=crop&crop=face",
      description: "AI expert passionate about making travel planning effortless",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      name: "Amit Verma",
      role: "Travel Experience Director",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      description: "Local expert with deep knowledge of India's hidden gems",
      gradient: "from-green-500 to-blue-500"
    }
  ];
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
        className="relative"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

  return (
    <div className="min-h-screen bg-[#171221] text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#171221] animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Floating Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rotate-45 animate-bounce" style={{animationDelay: '0s', animationDuration: '6s'}} />
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full animate-pulse" style={{animationDelay: '2s', animationDuration: '4s'}} />
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-gradient-to-br from-green-500/10 to-teal-500/10 rotate-12 animate-spin" style={{animationDuration: '20s'}} />
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
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">TripBudget</span>
                <div className="text-xs sm:text-sm text-slate-400">Smart Travel Planner Platform</div>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-base lg:text-lg font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-slate-300 hover:text-white'}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-base lg:text-lg font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-slate-300 hover:text-white'}`
                }
              >
                About
              </NavLink>
              <NavLink
                to="/Contact"
               
                className={({ isActive }) =>
                  `text-base lg:text-lg font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-slate-300 hover:text-white'}`
                }
              >
                Contact us
              </NavLink>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="sm:hidden bg-Y hover:bg-[#1a1a1a] text-white p-2 rounded-md transition-colors ">
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
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-4/5 sm:w-3/5 max-w-xs bg-slate-900/95 backdrop-blur-md  border-l border-slate-800/50 md:hidden"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">TripBudget</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
                <div className="flex flex-col space-y-6 ">
                  <NavLink
                    to="/home"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-lg font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-slate-300 hover:text-white'}`
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-lg font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-300 hover:text-white'}`
                    }
                  >
                    About
                  </NavLink>
                  <NavLink
                    to="/all-destinations"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-lg font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-300 hover:text-white'}`
                    }
                  >
                    All Destinations
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
              About TripBudget
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8">
            We're on a mission to make travel accessible and affordable for everyone in India. Through smart technology and local expertise, we help travelers save money while creating unforgettable experiences.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 rounded-xl font-bold text-lg shadow-lg"
            >
              Start Your Journey <ArrowRight className="inline w-5 h-5 ml-2" />
            </motion.button>
          </div>
        </motion.section>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Stats Section */}
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-20"
          >
            <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -10,
                      boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                      transition: { duration: 0.3 }
                    }}
                    className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 text-center shadow-lg group cursor-pointer"
                  >
                    <motion.div
                      variants={pulseVariants}
                      animate="animate"
                      className="mb-4"
                    >
                      <Icon className="w-8 h-8 text-blue-400 mx-auto group-hover:text-cyan-400 transition-colors duration-300" />
                    </motion.div>
                    <motion.div 
                      className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2"
                      initial={{ scale: 0.5 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      {stat.number}
                    </motion.div>
                    <p className="text-slate-400 font-medium group-hover:text-slate-300 transition-colors duration-300">{stat.label}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>

          {/* Our Story Section */}
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-20"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Story</h2>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                Born from a simple belief that everyone deserves to explore the incredible beauty of India
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={itemVariants} className="space-y-6">
                <motion.h3 
                  className="text-2xl font-bold text-blue-400"
                  whileHover={{ scale: 1.05, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  The Problem We Saw
                </motion.h3>
                <motion.p 
                  className="text-slate-300 leading-relaxed"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Travel in India was expensive and complicated. Families were missing out on creating memories because trip planning was overwhelming and costs were unpredictable. We knew there had to be a better way.
                </motion.p>
                
                <motion.h3 
                  className="text-2xl font-bold text-cyan-400"
                  whileHover={{ scale: 1.05, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  Our Solution
                </motion.h3>
                <motion.p 
                  className="text-slate-300 leading-relaxed"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  We built TripBudget with cutting-edge AI technology that analyzes millions of data points to find the best deals and create optimized itineraries. Our platform saves travelers an average of 60% compared to traditional booking methods.
                </motion.p>

                <motion.div 
                  className="flex flex-wrap gap-4 pt-4"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {[
                    "AI-Powered Planning",
                    "Local Expertise", 
                    "Budget Optimization",
                    "24/7 Support"
                  ].map((feature, index) => (
                    <motion.div 
                      key={feature} 
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                      className="flex items-center bg-slate-800/40 px-4 py-2 rounded-full hover:bg-blue-500/10 transition-all duration-300 cursor-pointer"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      </motion.div>
                      <span className="text-sm font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <motion.div 
                  className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-8 backdrop-blur-sm border border-slate-700/50"
                  variants={floatingVariants}
                  animate="animate"
                >
                  <div className="relative overflow-hidden rounded-xl mb-6">
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={currentImageIndex}
                        src={backgroundImages[currentImageIndex]}
                        alt="Beautiful travel destination" 
                        className="w-full h-64 object-cover"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                      />
                    </AnimatePresence>
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    />
                  </div>
                  <motion.blockquote 
                    className="text-lg italic text-slate-300 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    "Travel makes you realize that no matter how much you know, there's always more to learn, and no matter how much you think you know, there's always more to discover."
                  </motion.blockquote>
                  <motion.cite 
                    className="text-blue-400 font-medium"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    - Our Philosophy
                  </motion.cite>
                </motion.div>
              </motion.div>
            </div>
          </motion.section>

          {/* Values Section */}
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-20"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                The principles that guide everything we do at TripBudget
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
            >
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -15,
                      rotateY: 5,
                      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
                      transition: { duration: 0.3 }
                    }}
                    className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 text-center shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  >
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-r ${value.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.h3 
                      className="text-xl font-bold mb-4 group-hover:text-blue-400 transition-colors duration-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {value.title}
                    </motion.h3>
                    <motion.p 
                      className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      {value.description}
                    </motion.p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>

          {/* Team Section */}
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-20"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                The passionate individuals working to revolutionize travel in India
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={containerVariants}
            >
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -15,
                    rotateY: 10,
                    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
                    transition: { duration: 0.3 }
                  }}
                  className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 text-center shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                >
                  <motion.div 
                    className="relative mb-6"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className={`w-24 h-24 bg-gradient-to-r ${member.gradient} rounded-full p-1 mx-auto`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <motion.img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.2 + 0.5 }}
                      variants={pulseVariants}
                      animate="animate"
                    />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors duration-300"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {member.name}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-blue-400 font-medium mb-4 group-hover:text-cyan-400 transition-colors duration-300"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                  >
                    {member.role}
                  </motion.p>
                  
                  <motion.p 
                    className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    {member.description}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Call to Action */}
          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div 
              className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-8 lg:p-12 backdrop-blur-sm border border-slate-700/50"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 25px 50px rgba(59, 130, 246, 0.2)",
                transition: { duration: 0.3 }
              }}
            >
              <motion.h2 
                className="text-3xl lg:text-4xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Ready to Start Your Adventure?
              </motion.h2>
              <motion.p 
                className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Join thousands of travelers who've discovered that amazing trips don't have to break the bank.
              </motion.p>
              <motion.div 
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:from-blue-400 hover:to-cyan-400 transition-all duration-300"
                >
                  Plan My Trip Now
                </motion.button>
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: "rgba(71, 85, 105, 0.5)",
                    borderColor: "rgba(59, 130, 246, 0.5)",
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-slate-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800/50 transition-colors"
                >
                  Learn More
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.section>
        </div>
      </div>
  <AnimatePresence>
        <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
          <Login   onClose={() => setIsLoginOpen(false)} />
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

export default AboutPage;