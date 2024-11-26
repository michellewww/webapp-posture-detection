import React, { useState } from 'react';
import { setIntervalForUser } from '../utils/api';

const SettingsPage = ({
  notificationsEnabled,
  setNotificationsEnabled,
  notificationFrequency,
  setNotificationFrequency,
}) => {
  const toggleNotifications = (enabled) => {
    setNotificationsEnabled(enabled);
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
        <h3 className="font-semibold">Notifications</h3>
        <label>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => toggleNotifications(e.target.checked)}
          />
          <span className='ml-2'>
            Enable Notifications
          </span>
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
              <option value={1800}>Every 30 minutes</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
