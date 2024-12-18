// Import the base URL from environment variables
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// 1. Set Interval for User
export const setIntervalForUser = async (userId, interval) => {
  try {
    const response = await fetch(`${BASE_URL}/sitsmart/api/interval/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interval }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error setting interval for user:', error);
    throw error;
  }
};

// 2. Get Status
export const getStatus = async (userId) => {
  try {
    console.log('Fetching status...');
    const response = await fetch(`${BASE_URL}/sitsmart/api/status/${userId}`);
    const data = await handleResponse(response);
    console.log('Status fetched:', data.status);
    return data.status;
  } catch (error) {
    console.error('Error fetching status:', error);
    throw error;
  }
};

// 3. Add User
export const addUser = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/sitsmart/api/add_user/${userId}`, {
      method: 'POST',
    });
    const data = await handleResponse(response);
    console.log(data.message);
    return data;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

// 4. Remove User
export const removeUser = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/sitsmart/api/delete_user/${userId}`, {
      method: 'DELETE',
    });
    const data = await handleResponse(response);
    console.log(data.message);
    return data;
  } catch (error) {
    console.error('Error removing user:', error);
    throw error;
  }
};

// 5. Send the directory path to the backend
export const updateUserDirectory = async (userId, directoryPath) => {
  try {
    const response = await fetch(`${BASE_URL}/sitsmart/api/update_directory/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ directoryPath }),
    });
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Error updating directory:', error);
    throw error;
  }
};

export const setIconVisibility = async (userId, visibility) => {
  const url = `${BASE_URL}/sitsmart/api/icon_visibility/${userId}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility }), // Send visibility as "on" or "off"
    });

    if (!response.ok) throw new Error('Failed to set icon visibility');
    const data = await response.json();
    return data.message; // Return success message
  } catch (error) {
    console.error('Error setting icon visibility:', error);
    throw error;
  }
};
