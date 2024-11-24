import React, { useState } from 'react';

const SettingsPage = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    JSON.parse(localStorage.getItem('enableNotifications')) || false
  );
  const [notificationFrequency, setNotificationFrequency] = useState(
    localStorage.getItem('notificationFrequency') || '5'
  );

  const toggleNotifications = (enabled) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('enableNotifications', enabled);
  };

  const handleFrequencyChange = (event) => {
    const frequency = event.target.value;
    setNotificationFrequency(frequency);
    localStorage.setItem('notificationFrequency', frequency);
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
              <option value="0">Every 45 seconds</option>
              <option value="1">Every 1 minute</option>
              <option value="5">Every 5 minutes</option>
              <option value="30">Every 30 minutes</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
