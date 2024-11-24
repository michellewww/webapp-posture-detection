import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CameraPage from './components/CameraPage';
import SettingsPage from './components/SettingsPage';
import AnalysisPage from './components/AnalysisPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('camera');

  const renderPage = () => {
    switch (currentPage) {
      case 'camera':
        return <CameraPage />;
      case 'settings':
        return <SettingsPage />;
      case 'analysis':
        return <AnalysisPage />;
      default:
        return <CameraPage />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar showPage={setCurrentPage} />
      <main className="flex-1 p-5 bg-gray-100 overflow-auto">{renderPage()}</main>
    </div>
  );
};

export default App;
