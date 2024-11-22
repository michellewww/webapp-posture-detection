export const addUser = async (userId) => {
  const response = await fetch(`/api/add_user/${userId}`, { method: 'POST' });
  return response.json();
};
