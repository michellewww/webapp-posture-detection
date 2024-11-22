export const requestNotificationPermission = async () => {
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};
