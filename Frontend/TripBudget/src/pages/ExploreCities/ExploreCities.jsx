import React from 'react';
import SideBar from '../../components/SideBar/SideBar';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TypingText from '../../framermotion/TypingText';
import { Compass, MapPin, Sparkles, Star, Users } from 'lucide-react';

const cities = [
  {
    name: 'Jaipur',
    region: 'Rajasthan',
    desc: 'The Pink City of India',
    visitors: '2.5M',
    rating: '4.6',
    img: 'https://assets.vogue.in/photos/5ce41ea8b803113d138f5cd2/16:9/w_1920,h_1080,c_limit/Jaipur-Travel-Shopping-Restaurants.jpg',
  },
  {
    name: 'Mumbai',
    region: 'Maharashtra',
    desc: 'The City of Dreams',
    visitors: '4.8M',
    rating: '4.7',
    img: 'https://www.andbeyond.com/wp-content/uploads/sites/5/Chhatrapati-Shivaji-Terminus-railway-station-mumbai.jpg',
  },
  {
    name: 'Rishikesh',
    region: 'Uttarakhand',
    desc: 'Yoga Capital of the World',
    visitors: '1.9M',
    rating: '4.8',
    img: 'https://images.nativeplanet.com/img/2023/06/rishikesh34-1686056150.jpg',
  },
  {
    name: 'Manali',
    region: 'Himachal Pradesh',
    desc: 'Snow and solitude in the Himalayas',
    visitors: '3.2M',
    rating: '4.6',
    img: 'https://www.citybit.in/wp-content/uploads/2024/09/Best-Time-to-Visit-Kullu-Manali-1024x576.jpg',
  },
  {
    name: 'Udaipur',
    region: 'Rajasthan',
    desc: 'City of Lakes',
    visitors: '2.4M',
    rating: '4.5',
    img: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Udaipur_Lake_India.JPG',
  },
  {
    name: 'Varanasi',
    region: 'Uttar Pradesh',
    desc: 'Spiritual heart of India',
    visitors: '3.1M',
    rating: '4.7',
    img: 'https://s7ap1.scene7.com/is/image/incredibleindia/manikarnika-ghat-city-hero?qlt=82&ts=1727959374496',
  },
];

const visitors = [
  {
    name: 'Aisha Sharma',
    location: 'Mumbai, India',
    initials: 'AS',
    tags: ['Jaipur', 'Udaipur', 'Jodhpur'],
    quote:
      'Rajasthan’s royal heritage is absolutely mesmerizing. The palaces and forts tell incredible stories of India’s rich history.',
  },
  {
    name: 'Karan Mehta',
    location: 'Delhi, India',
    initials: 'KM',
    tags: ['Manali', 'Shimla', 'Kasol'],
    quote:
      'The Himalayas offer unmatched peace and scenic beauty. Manali was a perfect escape from city life.',
  },
  {
    name: 'Priya Verma',
    location: 'Bangalore, India',
    initials: 'PV',
    tags: ['Rishikesh', 'Haridwar', 'Mussoorie'],
    quote:
      'Rishikesh’s spiritual vibe and river rafting made it unforgettable. Highly recommend the Ganga Aarti at Triveni Ghat.',
  },
  {
    name: 'Piyush Gupta',
    location: 'Jaipur, India',
    initials: 'PG',
    tags: ['Goa', 'Udaipur', 'Manali'],
    quote:
      'From beaches to lakes to the mountains—TripBudget helped me compare trains and stays before locking every leg.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const ExploreCities = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full min-w-0 max-w-[100vw] flex-col bg-[#171221] text-white sm:flex-row">
      <SideBar />

      <main className="relative flex-1 overflow-x-hidden pt-14 sm:ml-[280px] sm:pt-8 md:ml-[300px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-violet-600/12 blur-3xl" />
          <div className="absolute -left-32 bottom-20 h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/4 h-px w-[min(90%,800px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-2 sm:px-6 lg:px-8">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center sm:mb-14"
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-cyan-300/90">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Inspiration
            </span>
            <div className="mt-4 flex justify-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                <TypingText delay={0.1} text="Explore Cities" />
              </h1>
            </div>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Hand-picked destinations across India—get a feel for the vibe, then jump into{' '}
              <span className="text-cyan-400/90">Plan a Trip</span> with trains, hotels, and budget in one flow.
            </p>

            <div className="mx-auto mt-8 flex max-w-lg flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-500/80" aria-hidden />
                {cities.length} featured cities
              </span>
              <span className="hidden h-4 w-px bg-white/10 sm:block" aria-hidden />
              <span className="inline-flex items-center gap-2">
                <Compass className="h-4 w-4 text-violet-400/80" aria-hidden />
                North to South
              </span>
            </div>
          </motion.header>

          <motion.section
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {cities.map((city) => (
              <motion.article
                key={city.name}
                variants={item}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#1a1528]/90 shadow-xl shadow-black/30"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={city.img}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171221] via-[#171221]/40 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/35 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-white/90 backdrop-blur-sm">
                    {city.region}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-bold text-white drop-shadow">{city.name}</h2>
                      <p className="text-sm text-white/75">{city.desc}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-black/40 px-2 py-1 text-sm text-amber-200 backdrop-blur-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400/90 text-amber-400/90" aria-hidden />
                      {city.rating}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="h-3.5 w-3.5 text-cyan-500/70" aria-hidden />
                    ~{city.visitors} annual visitors
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/plantrip', { state: { destination: city.name } })
                    }
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-cyan-500/15 transition hover:from-cyan-400 hover:to-violet-500"
                  >
                    Plan trip
                  </button>
                </div>
              </motion.article>
            ))}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="mt-20"
          >
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">Traveler stories</h2>
              <p className="mt-2 text-slate-500">
                Real routes and memories from people who planned with TripBudget
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visitors.map((person) => (
                <motion.div
                  key={person.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -2 }}
                  className="relative flex flex-col rounded-2xl border border-purple-500/15 bg-[#1e1830]/80 p-4 shadow-lg shadow-black/20 backdrop-blur-sm before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:border before:border-purple-500/10"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 text-sm font-bold text-white shadow-inner">
                      {person.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-tight text-white">{person.name}</h3>
                      <p className="text-xs text-slate-500">{person.location}</p>
                    </div>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {person.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-[#2a2540] px-2 py-0.5 text-[11px] font-medium text-cyan-300/90"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="flex-1 text-sm italic leading-relaxed text-slate-400">
                    “{person.quote}”
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-transparent px-6 py-8 text-center sm:px-10"
          >
            <p className="text-lg font-semibold text-white sm:text-xl">Ready to pick dates and fares?</p>
            <p className="mt-2 text-sm text-slate-400">
              Your next city is one plan away—trains, hotels, and places in a single flow.
            </p>
            <button
              type="button"
              onClick={() => navigate('/plantrip')}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-blue-400 hover:to-cyan-400"
            >
              Start planning
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ExploreCities;
