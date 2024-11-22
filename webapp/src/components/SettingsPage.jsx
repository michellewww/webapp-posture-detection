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
    <div>
      <h2 className="text-2xl font-bold">Settings</h2>
      <div className="mt-4">
        <h3 className="font-semibold">Notifications</h3>
        <label>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => toggleNotifications(e.target.checked)}
          />
          Enable Notifications
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
