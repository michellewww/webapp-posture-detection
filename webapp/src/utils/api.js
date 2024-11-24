// Import the base URL from environment variables
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
