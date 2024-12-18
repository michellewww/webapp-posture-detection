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
* Generate sample posture data for testing purposes with controlled variability.
 *
* @param {number} days - Number of past days to generate data for.
* @param {number} entriesPerDay - Number of posture entries per day.
* @returns {Array<{timestamp: number, postureType: string}>} - Array of sample posture entries.
 */
export const generateSampleData = (days = 30, entriesPerDay = 1440) => {
  const postureTypes = ['normal', 'lean_forward', 'lean_backward'];
  const sampleEntries = [];
  const now = Date.now();

  // Generate an array of bad posture percentages for the past 30 days
  const badPosturePercentages = Array(days).fill(0);

  // Ensure the most recent 4 days have bad posture percentage strictly below 30%
  for (let day = 0; day < 4; day++) {
    badPosturePercentages[day] = Math.random() * 0.3; // Random percentage between 0% and 30%
  }

  // Ensure a consecutive 7-day period has bad posture percentage strictly below 30%
  const startOfLowBadPostureStreak = Math.floor(Math.random() * (days - 11)) + 4; // Avoid overlap with the first 4 days
  for (let day = startOfLowBadPostureStreak; day < startOfLowBadPostureStreak + 7; day++) {
    badPosturePercentages[day] = Math.random() * 0.3; // Random percentage between 0% and 30%
  }

  // For remaining days, assign random bad posture percentages with variability
  for (let day = 0; day < days; day++) {
    if (badPosturePercentages[day] === 0) {
      const isLowBadPostureDay = Math.random() < 0.5; // 50% chance for low bad posture
      badPosturePercentages[day] = isLowBadPostureDay
        ? Math.random() * 0.3 // 0%-30%
        : 0.3 + Math.random() * 0.4; // 30%-70%
    }
  }

  // Generate posture entries based on the calculated percentages
  for (let day = 0; day < days; day++) {
    const dayTimestamp = now - day * 24 * 60 * 60 * 1000; // Subtract days

    // Determine proportions based on bad posture percentage
    const badPostureProportion = badPosturePercentages[day];
    const normalProportion = 1 - badPostureProportion;
    const leanForwardProportion = badPostureProportion / 2;
    const leanBackwardProportion = badPostureProportion / 2;

    for (let entry = 0; entry < entriesPerDay; entry++) {
      const timestamp = dayTimestamp + entry * (24 * 60 * 60 * 1000) / entriesPerDay; // Distribute entries evenly over the day

      // Generate posture type based on weighted random selection
      const randomValue = Math.random();
      let postureType;
      if (randomValue < normalProportion) {
        postureType = 'normal';
      } else if (randomValue < normalProportion + leanForwardProportion) {
        postureType = 'lean_forward';
      } else {
        postureType = 'lean_backward';
      }

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