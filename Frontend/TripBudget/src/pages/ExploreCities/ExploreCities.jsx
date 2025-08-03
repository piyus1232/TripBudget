import React from 'react';
import SideBar from '../../components/SideBar/SideBar';
import Card from '../../components/utils/Card';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/utils/Button';
import { motion } from 'framer-motion';
import TypingText from '../../framermotion/TypingText';
const cities = [
  {
    name: 'Jaipur',
    desc: 'The Pink City of India',
    visitors: '2.5M',
    rating: '4.6',
    img: 'https://assets.vogue.in/photos/5ce41ea8b803113d138f5cd2/16:9/w_1920,h_1080,c_limit/Jaipur-Travel-Shopping-Restaurants.jpg',
  },
  {
    name: 'Mumbai',
    desc: 'The City of Dreams',
    visitors: '4.8M',
    rating: '4.7',
    img: 'https://www.andbeyond.com/wp-content/uploads/sites/5/Chhatrapati-Shivaji-Terminus-railway-station-mumbai.jpg',
  },
  {
    name: 'Rishikesh',
    desc: 'Yoga Capital of the World',
    visitors: '1.9M',
    rating: '4.8',
    img: 'https://images.nativeplanet.com/img/2023/06/rishikesh34-1686056150.jpg',
  },
  {
    name: 'Manali',
    desc: 'Snow and Solitude',
    visitors: '3.2M',
    rating: '4.6',
    img: 'https://www.citybit.in/wp-content/uploads/2024/09/Best-Time-to-Visit-Kullu-Manali-1024x576.jpg',
  },
  {
    name: 'Udaipur',
    desc: 'City of Lakes',
    visitors: '2.4M',
    rating: '4.5',
    img: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Udaipur_Lake_India.JPG',
  },
  {
    name: 'Varanasi',
    desc: 'Spiritual Capital of India',
    visitors: '3.1M',
    rating: '4.7',
    img: 'https://s7ap1.scene7.com/is/image/incredibleindia/manikarnika-ghat-city-hero?qlt=82&ts=1727959374496',
  },
];

const visitors = [
  {
    name: 'Aisha Sharma',
    location: 'Mumbai, India',
    avatar: 'AS',
    tags: ['Jaipur', 'Udaipur', 'Jodhpur'],
    quote:
      'Rajasthan’s royal heritage is absolutely mesmerizing. The palaces and forts tell incredible stories of India’s rich history.',
  },
  {
    name: 'Karan Mehta',
    location: 'Delhi, India',
    avatar: 'KM',
    tags: ['Manali', 'Shimla', 'Kasol'],
    quote:
      'The Himalayas offer unmatched peace and scenic beauty. Manali was a perfect escape from city life.',
  },
  {
    name: 'Priya Verma',
    location: 'Bangalore, India',
    avatar: 'PV',
    tags: ['Rishikesh', 'Haridwar', 'Mussoorie'],
    quote:
      'Rishikesh’s spiritual vibe and river rafting made it unforgettable. Highly recommend the Ganga Aarti at Triveni Ghat.',
  },
];



const ExploreCities = () => {
  const navigate = useNavigate();


  return (
    <div className="ml-58 border-[#2a233f]">
      <SideBar />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 5 }}
      transition={{
        duration: 1.2,
        ease: 'easeInOut',
        delay: 0.4,
      }}
       className="bg-[#171221] min-h-screen px-6 md:px-20 py-10 text-white ml-3">
        {/* Word-by-word animated heading */}
        <motion.div className="flex justify-center gap-3 mb-2 ml-4 text-4xl font-bold text-white text-center">
         <TypingText
          delay={0.12}
           text="Explore Cities"
         />
       
  
        </motion.div>

        <p className="text-gray-300 mb-8 mt-5 max-w-2xl mx-auto text-center">
          Discover amazing destinations around India and plan your next adventure with personalized recommendations
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city, i) => (
            <motion.div
              key={i}
               whileHover={{
            scale: 1.02, // just a tiny "towards you" effect
            transition: { type: 'spring', stiffness: 100 },
          }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Card>
                <img
                  src={city.img}
                  alt={city.name}
                  className="h-40 w-full object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{city.name}</h3>
                  <p className="text-gray-400 text-sm">{city.desc}</p>
                  <div className="flex justify-between text-teal-200 text-sm mt-2">
                    <span>👥 {city.visitors} visitors</span>
                    <span>⭐ {city.rating}</span>
                  </div>
                  <Button
                    onClick={() => navigate('/plantrip')}
                    className="mt-4 w-full text-white font-medium py-2 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 transition-all duration-300"
                  >
                    Plan Now
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <h2 className="text-3xl font-semibold mt-16 mb-8 ml-12 text-center">People Who Planned</h2>
        <motion.div  className="flex flex-wrap gap-6 ml-5">
          {visitors.map((person, i) => (
            
            <motion.Card
            whileHover={{
            scale: 1.02, // just a tiny "towards you" effect
            transition: { type: 'spring', stiffness: 100 },
          }}
              key={i}
              className="flex w-full sm:w-[300px] p-4 items-start ml-6 border-purple-800/20 
              before:absolute before:inset-0 before:rounded-3xl before:border before:border-purple-500/20 
              before:pointer-events-none before:shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-sm"
            >
              <div className="bg-gradient-to-r from-teal-400 to-indigo-600 text-white font-bold rounded-full w-30 h-5 flex items-center justify-center mr-4">
                {person.avatar}
              </div>
              <div>
                <h4 className="text-lg font-semibold">{person.name}</h4>
                <p className="text-gray-400 text-sm">{person.location}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {person.tags.map((tag, j) => (
                    <span key={j} className="bg-[#2e2b3a] text-teal-300 px-2 py-1 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm italic text-gray-300 mt-3">“{person.quote}”</p>
              </div>
            </motion.Card>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ExploreCities;
