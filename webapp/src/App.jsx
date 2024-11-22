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
    <div className="flex">
      <Sidebar showPage={setCurrentPage} />
      <main className="ml-64 p-5 flex-1">{renderPage()}</main>
    </div>
  );
};

export default App;
