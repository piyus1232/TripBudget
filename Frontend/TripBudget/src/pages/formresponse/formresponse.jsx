import React from 'react';
import SideBar from '../../components/SideBar/SideBar';
import TripsSummary from './TripsSummary';
import TrainRecommendation from './TrainRecomendation';
import SuggestedRecommendation from './suggestedRecomendation';
import PlacestoVisit from './PlacestoVisit';

function FormResponse() {
  return (
    <div className="min-h-screen bg-[#171221] text-white flex">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r border-[#2a233f]">
        <SideBar />
      </div>

      {/* Main Sections */}
      <div className="flex-1 overflow-y-auto p-6 space-y-12">
        <TripsSummary />
        <TrainRecommendation />
        <SuggestedRecommendation />
        <PlacestoVisit />
      </div>
    </div>
  );
}

export default FormResponse;
