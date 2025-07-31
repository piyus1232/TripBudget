import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, NavLink } from 'react-router-dom';
import { Plane, MapPin, Star, Heart, ChevronLeft, ChevronRight, ArrowRight, Globe, Camera, Shield, Calendar, X, Menu } from 'lucide-react';
import Login from '../../components/authpages/Login';
import Register from '../../components/authpages/Register';

// Modal Component for Pop-ups
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

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentDestination, setCurrentDestination] = useState(0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for hamburger menu

  const destinations = [
    {
      id: 1,
      name: "Manali",
      country: "Himachal Pradesh",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80",
      price: "₹6999",
      originalPrice: "₹7999",
      savings: "40%",
      rating: 4.9,
      days: "7 days"
    },
    {
      id: 2,
      name: "Jaipur",
      country: "Rajasthan",
      image: "https://experiencemyindia.com/wp-content/uploads/2024/09/jaipur-1200x628.jpg",
      price: "₹2000",
      originalPrice: "₹2999",
      savings: "50%",
      rating: 4.8,
      days: "5 days"
    },
    {
      id: 3,
      name: "Nainital",
      country: "Uttarakhand",
      image: "https://images.unsplash.com/photo-1610715936287-6c2ad208cdbf?w=800&auto=format&fit=crop&q=80",
      price: "₹4999",
      originalPrice: "₹5999",
      savings: "42%",
      rating: 4.7,
      days: "6 days"
    },
    {
      id: 4,
      name: "Rishikesh",
      country: "Uttarakhand",
      image: "https://captureatrip-cms-storage.s3.ap-south-1.amazonaws.com/Best_Time_to_Visit_Laxman_Jhula_fa2b5c527f.webp",
      price: "₹4999",
      originalPrice: "₹5999",
      savings: "38%",
      rating: 4.8,
      days: "5 days"
    }
  ];

  const heroImages = [
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80",
    "https://experiencemyindia.com/wp-content/uploads/2024/09/jaipur-1200x628.jpg",
    "https://captureatrip-cms-storage.s3.ap-south-1.amazonaws.com/Best_Time_to_Visit_Laxman_Jhula_fa2b5c527f.webp"
  ];

  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "AI Trip Planner",
      description: "Smart route optimization saves up to 60%",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Hidden Gems",
      description: "Discover secret spots locals love",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safe Planning",
      description: "100% secure with Cheap Budget",
      color: "from-emerald-500 to-green-500"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Flexible Dates",
      description: "Find the best deals with smart comparison",
      color: "from-orange-500 to-yellow-500"
    }
  ];

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    const destInterval = setInterval(() => {
      setCurrentDestination((prev) => (prev + 1) % destinations.length);
    }, 4000);

    return () => {
      clearInterval(heroInterval);
      clearInterval(destInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#171221] text-white">
         <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

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
                to="/home"
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
       

      {/* Pop-up Modals */}
      <AnimatePresence>
        <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
          <Login   onClose={() => setIsLoginOpen(false)} />
        </Modal>
        <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)}>
          <Register onClose={() => setIsRegisterOpen(false)} />
        </Modal>
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-[40vh] sm:h-[50vh] flex items-center mt-20 sm:mt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-slate-950/60 z-10"></div>
            <img
              src={heroImages[currentSlide]}
              alt="Hero"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Travel <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Cheaper</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8">
              Save up to <span className="text-green-400 font-bold">60%</span> on India's best destinations with smart planning
            </p>
            <div className="flex gap-4">
              <motion.button
              onClick = {()=>(Navigate(setIsRegisterOpen(true)))} 
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg"
              >
                Plan My Trip <ArrowRight className="inline w-5 h-5 ml-2" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Destinations Carousel */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">🔥 Trending Destinations</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentDestination((prev) => (prev - 1 + destinations.length) % destinations.length)}
                className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDestination((prev) => (prev + 1) % destinations.length)}
                className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentDestination}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-slate-800/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/30"
            >
              <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-1/2 relative">
                  <div className="h-48 sm:h-56 md:h-64 lg:h-80 xl:h-72">
                    <img
                      src={destinations[currentDestination].image}
                      alt={destinations[currentDestination].name}
                      className="w-full h-full object-cover rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none"
                      loading="lazy"
                      srcSet={`${destinations[currentDestination].image.replace('w=800', 'w=400')} 400w,
                              ${destinations[currentDestination].image.replace('w=800', 'w=600')} 600w,
                              ${destinations[currentDestination].image.replace('w=800', 'w=800')} 800w,
                              ${destinations[currentDestination].image.replace('w=800', 'w=1200')} 1200w`}
                      sizes="(max-width: 640px) 100vw, 
                             (max-width: 1024px) 100vw, 
                             50vw"
                    />
                  </div>
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Save {destinations[currentDestination].savings}
                  </div>
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Heart className="w-5 h-5 text-red-400" />
                  </button>
                </div>
                <div className="w-full lg:w-1/2 p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">{destinations[currentDestination].name}</h3>
                      <p className="text-slate-400 text-sm sm:text-base">{destinations[currentDestination].country}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold text-sm sm:text-base">{destinations[currentDestination].rating}</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400">{destinations[currentDestination].price}</span>
                    <span className="text-slate-400 line-through ml-2 text-sm sm:text-base">{destinations[currentDestination].originalPrice}</span>
                  </div>
                  <p className="text-slate-300 mb-4 text-sm sm:text-base">{destinations[currentDestination].days} • All Inclusive Package</p>
                  <button  onClick = {()=>(Navigate(setIsRegisterOpen(true)))} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 py-3 rounded-xl font-bold text-sm sm:text-base hover:from-blue-600 hover:to-cyan-600 transition-colors ">
                    Plan Now
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Why Choose TripBudget</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/30"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-lg sm:text-xl text-slate-300 mb-8">Join 50,000+ travelers saving on trips</p>
          <motion.button
             onClick = {()=>(Navigate(setIsRegisterOpen(true)))} 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg"
          >
            Start Planning Free <Plane className="inline w-5 h-5 ml-2" />
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <p>© 2025 TravelSavr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;