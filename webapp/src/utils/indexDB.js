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
  if (postureType === 'normal' || postureType === 'lean_forward' || postureType === 'lean_backward') {
    await db.postureEntries.add({ timestamp, postureType });
  }
  console.log('Posture entry added:', { timestamp, postureType });
};

/**
 * Fetch posture entries within a time range and categorize them.
 *
 * @param {number} startTime - The start timestamp (inclusive).
 * @param {number} endTime - The end timestamp (inclusive).
 * @returns {Object} - Categorized posture entries:
 *  - {Array} allPostures: All entries sorted by timestamp.
 *  - {Array} normalPostures: Entries with postureType 'normal'.
 *  - {Array} leanForwardPostures: Entries with postureType 'lean_forward'.
 *  - {Array} leanBackwardPostures: Entries with postureType 'lean_backward'.
 */
export const fetchPostureEntries = async (startTime, endTime) => {
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
};

export default db;
