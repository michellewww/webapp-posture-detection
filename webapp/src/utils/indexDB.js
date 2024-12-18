import Dexie from 'dexie';

// Initialize the database
const db = new Dexie('PostureDB');

// Define the schema
db.version(1).stores({
  postureEntries: '++id, timestamp, postureType', // id is auto-incremented
});

/**
* Add a posture entry to the database.
 *
* @param {number} timestamp - The timestamp of the entry.
* @param {string} postureType - The posture type ('normal', 'lean_forward', 'lean_backward').
 */
export const addPostureEntry = async (timestamp, postureType) => {
  if (
    postureType === 'normal' ||
    postureType === 'lean_forward' ||
    postureType === 'lean_backward'
  ) {
    await db.postureEntries.add({ timestamp, postureType });
    console.log('Posture entry added:', { timestamp, postureType });
  } else {
    console.error(
      `Invalid postureType: ${postureType}. Must be 'normal', 'lean_forward', or 'lean_backward'.`
    );
  }
};

/**
* Add multiple posture entries to the database in bulk.
 *
* @param {Array<{timestamp: number, postureType: string}>} entries - Array of posture entries.
 */
export const addMultiplePostureEntries = async (entries) => {
  // Validate postureTypes
  const validPostureTypes = ['normal', 'lean_forward', 'lean_backward'];
  const invalidEntries = entries.filter(
    (entry) => !validPostureTypes.includes(entry.postureType)
  );

  if (invalidEntries.length > 0) {
    console.error(
      'Some entries have invalid postureType values:',
      invalidEntries
    );
    return;
  }

  try {
    await db.postureEntries.bulkAdd(entries);
    console.log(`${entries.length} posture entries added successfully.`);
  } catch (error) {
    console.error('Error adding multiple posture entries:', error);
  }
};


/**
* Fetch posture entries within a time range and categorize them.
 *
* @param {number} startTime - The start timestamp (inclusive).
* @param {number} endTime - The end timestamp (inclusive).
* @returns {Object} - Categorized posture entries:
* - {Array} allPostures: All entries sorted by timestamp.
* - {Array} normalPostures: Entries with postureType 'normal'.
* - {Array} leanForwardPostures: Entries with postureType 'lean_forward'.
* - {Array} leanBackwardPostures: Entries with postureType 'lean_backward'.
 */
export const fetchPostureEntries = async (startTime, endTime) => {
  try {
    const entries = await db.postureEntries
      .where('timestamp')
      .between(startTime, endTime, true, true) // Inclusive range
      .toArray();

    const allPostures = [];
    const normalPostures = [];
    const leanForwardPostures = [];
    const leanBackwardPostures = [];

    for (const entry of entries) {
      allPostures.push(entry);

      if (entry.postureType === 'normal') {
        normalPostures.push(entry);
      } else if (entry.postureType === 'lean_forward') {
        leanForwardPostures.push(entry);
      } else if (entry.postureType === 'lean_backward') {
        leanBackwardPostures.push(entry);
      }
    }

    return { allPostures, normalPostures, leanForwardPostures, leanBackwardPostures };
  } catch (error) {
    console.error('Error fetching posture entries:', error);
    return { allPostures: [], normalPostures: [], leanForwardPostures: [], leanBackwardPostures: [] };
  }
};

/**
 * Generate sample posture data for testing purposes.
 *
 * @param {number} days - Number of past days to generate data for.
 * @param {number} entriesPerDay - Number of posture entries per day.
 * @returns {Array<{timestamp: number, postureType: string}>} - Array of sample posture entries.
 */
export const generateSampleData = (days = 30, entriesPerDay = 1440) => {
  const postureTypes = ['normal', 'lean_forward', 'lean_backward'];
  const postureProbabilities = [0.7, 0.15, 0.15]; // Weighted probabilities: 70% normal, 15% lean_forward, 15% lean_backward
  const sampleEntries = [];
  const now = Date.now();

  // Helper function to select a posture type based on probabilities
  const selectPostureType = () => {
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (let i = 0; i < postureTypes.length; i++) {
      cumulativeProbability += postureProbabilities[i];
      if (rand < cumulativeProbability) {
        return postureTypes[i];
      }
    }
  };

  for (let day = 0; day < days; day++) {
    const dayTimestamp = now - day * 24 * 60 * 60 * 1000; // Subtract days
    for (let entry = 0; entry < entriesPerDay; entry++) {
      const timestamp = dayTimestamp + entry * (24 * 60 * 60 * 1000) / entriesPerDay; // Distribute entries evenly over the day
      const postureType = selectPostureType();
      sampleEntries.push({ timestamp, postureType });
    }
  }

  return sampleEntries;
};

/**
* Insert sample data into the database.
 *
* @param {number} days - Number of past days to generate data for.
* @param {number} entriesPerDay - Number of posture entries per day.
 */
export const insertSampleData = async (days = 30, entriesPerDay = 1440) => {
  const sampleEntries = generateSampleData(days, entriesPerDay);
  await addMultiplePostureEntries(sampleEntries);
};

/**
* Clear all posture entries from the database.
 */
export const clearPostureEntries = async () => {
  try {
    await db.postureEntries.clear();
    console.log('All posture entries have been cleared.');
  } catch (error) {
    console.error('Error clearing posture entries:', error);
  }
};

export default db;
