import React from 'react';
import HeroSection from './Herosection';
import UpcomingTrip from './UpcomingTrip';
import TravelStats from './TravelStats';
import SideBar from '../../components/SideBar/SideBar';
import GroupTeaser from './GroupDiscussion';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#171221] text-white flex flex-col sm:flex-row">
      <SideBar />
      <div className="ml-0 sm:ml-[280px] md:ml-[300px] p-2 w-full">
        <div className="mx-4 sm:mx-8 lg:ml-20 flex flex-col gap-8">
          <HeroSection />
          <TravelStats />
          <UpcomingTrip />
          <GroupTeaser />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
