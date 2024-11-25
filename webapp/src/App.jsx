import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CameraPage from './components/CameraPage';
import SettingsPage from './components/SettingsPage';
import AnalysisPage from './components/AnalysisPage';
import { getStatus } from './api';

const App = () => {
  const [currentPage, setCurrentPage] = useState('camera');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState(45);
  const userId = "user123";

  // notification for bad posture
  const [postureType, setPostureType] = useState('good');

  // Fetch posture status at regular intervals
  useEffect(() => {
    let intervalId;

    const fetchStatus = async () => {
      try {
        const status = await getStatus(userId);
        setPostureType(status); // Update postureType based on API response
      } catch (error) {
        console.error('Error fetching posture status:', error);
      }
    };

    if (notificationsEnabled) {
      // Start fetching status at the specified interval
      fetchStatus(); // Fetch immediately
      intervalId = setInterval(fetchStatus, notificationFrequency * 1000); // Convert seconds to milliseconds
    }

    return () => {
      // Cleanup: Clear the interval when notifications are disabled or the component is unmounted
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [notificationsEnabled, notificationFrequency, userId]);

  const renderPage = () => {
    switch (currentPage) {
      case 'camera':
        return <CameraPage />;
      case 'settings':
        return <SettingsPage
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        notificationFrequency={notificationFrequency}
        setNotificationFrequency={setNotificationFrequency}
      />;
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
