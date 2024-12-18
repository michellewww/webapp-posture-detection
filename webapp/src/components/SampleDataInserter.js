import React from 'react';
import { insertSampleData, clearPostureEntries } from '../utils/indexDB';

const SampleDataInserter = () => {
  const handleInsertData = async () => {
    const confirm = window.confirm(
      'This will insert a large amount of sample data. Do you wish to continue?'
    );
    if (!confirm) return;

    try {
      // Adjust parameters as needed
      await insertSampleData(30, 1440); // 30 days, 1440 entries per day (1 per minute)
      alert('Sample data inserted successfully!');
    } catch (error) {
      console.error('Error inserting sample data:', error);
      alert('Failed to insert sample data.');
    }
  };

  const handleClearData = async () => {
    const confirm = window.confirm(
      'This will clear all posture data. Do you wish to continue?'
    );
    if (!confirm) return;

    try {
      await clearPostureEntries();
      alert('All posture data has been cleared.');
    } catch (error) {
      console.error('Error clearing posture data:', error);
      alert('Failed to clear posture data.');
    }
  };

  return (
    <div className="p-4 text-center">
      <button
        onClick={handleInsertData}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
      >
        Insert Sample Data
      </button>
      <button
        onClick={handleClearData}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Clear All Data
      </button>
    </div>
  );
};

export default SampleDataInserter;
