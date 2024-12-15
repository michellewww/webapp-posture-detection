import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CameraPage from './components/CameraPage';
import SettingsPage from './components/SettingsPage';
import AnalysisPage from './components/AnalysisPage';
import FloatingApp from './components/FloatingApp';
import { getStatus } from './utils/api';
import { updateFaviconColors } from './utils/favicon';

const App = () => {
  const [currentPage, setCurrentPage] = useState('camera');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState(45);
  const [activeUser, setActiveUser] = useState(false);
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const userId = "user123";
  const good_color = '#608a75';
  const bad_color = '#ffa500';

  // notification for bad posture
  const [postureType, setPostureType] = useState('normal');

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

    if (notificationsEnabled && activeUser) {
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
  }, [notificationsEnabled, notificationFrequency, userId, activeUser]);

  // Update favicon color based on postureType
  useEffect(() => {
    if (postureType === 'lean_forward' || postureType === 'lean_backward') {
      updateFaviconColors(bad_color);
    } else {
      updateFaviconColors(good_color);
    }
  }, [postureType]);

  const renderPage = () => {
    switch (currentPage) {
      case 'camera':
        return <CameraPage 
          postureType={postureType}
          setPostureType={setPostureType}
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          directoryHandle={directoryHandle}
          setDirectoryHandle={setDirectoryHandle}
        />;
      case 'settings':
        return <SettingsPage
          notificationsEnabled={notificationsEnabled}
          setNotificationsEnabled={setNotificationsEnabled}
          notificationFrequency={notificationFrequency}
          setNotificationFrequency={setNotificationFrequency}
          directoryHandle={directoryHandle} 
          setDirectoryHandle={setDirectoryHandle}
        />;
      case 'analysis':
        return <AnalysisPage />;
      default:
        return <CameraPage directoryHandle={directoryHandle} />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar for navigation */}
      <Sidebar showPage={setCurrentPage} />
      
      {/* Main Content */}
      <main className="flex-1 px-5 bg-[#F8F6F7] overflow-auto">{renderPage()}</main>
      
      {/* Floating App */}
      <FloatingApp
        postureType={postureType}
        setPostureType={setPostureType}
        notificationsEnabled={notificationsEnabled}
        directoryHandle={directoryHandle} setDirectoryHandle={setDirectoryHandle}
      />
    </div>
  );
};

export default App;
