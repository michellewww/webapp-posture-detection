import React, { useEffect } from 'react';

const FloatingApp = ({ postureType, notificationsEnabled }) => {
  useEffect(() => {
    const statusIcon = document.getElementById('status-icon');
    const menu = document.getElementById('menu');

    // Event handlers for menu and status icon
    const handleContextMenu = (e) => {
      e.preventDefault();
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    };

    const handleOutsideClick = (e) => {
      if (!menu.contains(e.target) && e.target !== statusIcon) {
        menu.style.display = 'none';
      }
    };

    // Initialize icon visibility
    statusIcon.style.display = notificationsEnabled ? 'block' : 'none';
    updateIcon(statusIcon, postureType);

    // Attach event listeners
    statusIcon.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleOutsideClick);

    // Cleanup event listeners
    return () => {
      statusIcon.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [postureType, notificationsEnabled]); // Dependencies for effect

  // Function to update the icon based on postureType
  const updateIcon = (statusIcon, postureType) => {
    statusIcon.src = postureType === 'bad' ? 'bad-face.png' : 'good-face.png';
  };

  return (
    <div style={{ margin: 0, overflow: 'hidden', backgroundColor: 'transparent' }}>
      <img
        id="status-icon"
        src="good-face.png"
        alt="Status Icon"
        style={{
          width: '50px',
          height: '50px',
          position: 'fixed',
          top: '10px',
          right: '10px',
          cursor: 'pointer',
          zIndex: 100,
        }}
      />
      <div
        id="menu"
        style={{
          display: 'none',
          position: 'fixed',
          top: '60px',
          right: '10px',
          padding: '10px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '5px',
          fontSize: '14px',
        }}
      >
        <button
          onClick={() => {
            const statusIcon = document.getElementById('status-icon');
            statusIcon.style.display = 'none';
            menu.style.display = 'none';
          }}
        >
          Hide
        </button>
      </div>
    </div>
  );
};

export default FloatingApp;
