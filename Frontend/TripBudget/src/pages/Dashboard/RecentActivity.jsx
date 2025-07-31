import React from 'react';

const activities = [
  { id: 1, text: "You added a new trip to Paris.", time: "2 hours ago" },
  { id: 2, text: "Group chat: 'Summer Europe' has a new message.", time: "3 hours ago" },
  { id: 3, text: "You updated your budget for 'Goa Trip'.", time: "Yesterday" },
  { id: 4, text: "You invited Sam to join 'Manali Adventure'.", time: "2 days ago" },
];

export default function RecentActivity() {
  return (
    <div className="bg-[#221c31] rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-purple-300">Recent Activity</h2>
      <ul className="space-y-3">
        {activities.map(act => (
          <li key={act.id} className="flex items-center justify-between text-sm text-gray-200">
            <span>{act.text}</span>
            <span className="text-xs text-gray-400">{act.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
