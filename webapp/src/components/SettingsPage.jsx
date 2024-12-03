import React, { useState } from 'react';
import { setIntervalForUser } from '../utils/api';

const SettingsPage = ({
  notificationsEnabled,
  setNotificationsEnabled,
  notificationFrequency,
  setNotificationFrequency,
  directoryHandle, 
  setDirectoryHandle
}) => {
  const toggleNotifications = (enabled) => {
    setNotificationsEnabled(enabled);
  };

  const selectDirectory = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const dirHandle = await window.showDirectoryPicker();
        const permission = await dirHandle.queryPermission({ mode: 'readwrite' });
        if (permission !== 'granted') {
          const requestPermission = await dirHandle.requestPermission({ mode: 'readwrite' });
          if (requestPermission !== 'granted') {
            throw new Error('Write permission not granted');
          }
        }
        setDirectoryHandle(dirHandle);
        console.log('Directory selected:', dirHandle);
      } catch (error) {
        console.error('Directory selection cancelled or failed:', error);
      }
    } else {
      alert('Your browser does not support the File System Access API. Please use a compatible browser.');
    }
  };

  const handleFrequencyChange = async (event) => {
    const selectedValue = parseInt(event.target.value, 10);
    try {
      await setIntervalForUser('user123', selectedValue);
    } catch (error) {
      console.error('Error setting interval for user:', error);
    }
    setNotificationFrequency(selectedValue); // Update frequency in seconds
  };

  return (
    <div className='ml-10 mt-10'>
      <h2 className="text-2xl font-bold text-[#2a6f6f]">Settings</h2>
      <div className="mt-4 text-[#2a6f6f]">
        <h3 className="font-semibold">Save Directory</h3>
          <button onClick={selectDirectory} className="mt-2 px-4 py-2 rounded bg-[#a8c3b5] text-white">
            {directoryHandle ? 'Change Directory' : 'Select Directory'}
          </button>
          {directoryHandle && <span> {directoryHandle.name} </span>}
      </div>
      <div className="mt-4 text-[#2a6f6f]">
        <h3 className="font-semibold">Notifications</h3>
        <label>
          <div className='mt-2'>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => toggleNotifications(e.target.checked)}
            />
            <span className='ml-2'>
              Enable Notifications
            </span>
          </div>
        </label>
        {notificationsEnabled && (
          <div>
            <label htmlFor="notification-frequency">Notification Frequency:</label>
            <select
              id="notification-frequency"
              value={notificationFrequency}
              onChange={handleFrequencyChange}
            >
              <option value={45}>Every 45 seconds</option>
              <option value={60}>Every 1 minute</option>
              <option value={300}>Every 5 minutes</option>
              <option value={600}>Every 10 minutes</option>
              <option value={900}>Every 15 minutes</option>
              <option value={1200}>Every 20 minutes</option>
              <option value={1500}>Every 25 minutes</option>
              <option value={1800}>Every 30 minutes</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
