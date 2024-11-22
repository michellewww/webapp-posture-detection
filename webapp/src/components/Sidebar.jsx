import React from 'react';

const Sidebar = ({ showPage }) => (
  <div className="fixed top-10 left-10 w-48 h-[80%] p-5 bg-secondary-color rounded-lg text-white">
    <ul className="space-y-4">
      <li>
        <button onClick={() => showPage('camera')} className="block w-full text-left">
          Camera
        </button>
      </li>
      <li>
        <button onClick={() => showPage('settings')} className="block w-full text-left">
          Settings
        </button>
      </li>
      <li>
        <button onClick={() => showPage('analysis')} className="block w-full text-left">
          Analysis
        </button>
      </li>
    </ul>
  </div>
);

export default Sidebar;
