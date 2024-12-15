// import initSqlJs from 'sql.js';

// let db;

// export const initializeDatabase = async () => {
//   if (!db) {
//     const SQL = await initSqlJs();

//     // Load the database from localStorage if it exists
//     const savedDb = localStorage.getItem('postureDb');
//     if (savedDb) {
//       const uintArray = new Uint8Array(JSON.parse(savedDb));
//       db = new SQL.Database(uintArray);
//     } else {
//       // Create a new database if no saved database exists
//       db = new SQL.Database();
//       db.run(`
//         CREATE TABLE IF NOT EXISTS PostureEntries (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           timestamp INTEGER NOT NULL,
//           postureType TEXT NOT NULL
//         );
//       `);
//     }
//   }
//   return db;
// };

// // Save the database to localStorage
// export const saveDatabase = () => {
//   if (db) {
//     const binaryArray = db.export();
//     localStorage.setItem('postureDb', JSON.stringify(Array.from(binaryArray)));
//   }
// };

// export const insertPostureEntry = (timestamp, postureType) => {
//   if (!db) {
//     throw new Error('Database not initialized. Call initializeDatabase() first.');
//   }

//   const stmt = db.prepare(
//     `INSERT INTO PostureEntries (timestamp, postureType) VALUES (?, ?);`
//   );
//   stmt.run([timestamp, postureType]);
//   stmt.free();

//   saveDatabase(); // Save the updated database to localStorage
// };

// /**
//  * Fetch posture entries between a specified start and end time.
//  *
//  * @param {number} startTime - The start timestamp (inclusive) for filtering entries.
//  * @param {number} endTime - The end timestamp (inclusive) for filtering entries.
//  * @returns {Object} - An object containing categorized arrays of posture entries:
//  *  - {Array<{timestamp: number, postureType: string}>} allPostures - All entries (timestamp, postureType) sorted by timestamp.
//  *  - {Array<{timestamp: number, postureType: string}>} normalPostures - Entries with postureType 'normal'.
//  *  - {Array<{timestamp: number, postureType: string}>} leanForwardPostures - Entries with postureType 'lean_forward'.
//  *  - {Array<{timestamp: number, postureType: string}>} leanBackwardPostures - Entries with postureType 'lean_backward'.
//  * 
//  * @throws {Error} If the database is not initialized.
//  */
// export const fetchPostureEntries = (startTime, endTime) => {
//   if (!db) {
//     throw new Error('Database not initialized. Call initializeDatabase() first.');
//   }

//   const stmt = db.prepare(`
//     SELECT * FROM PostureEntries
//     WHERE timestamp BETWEEN ? AND ?
//     ORDER BY timestamp ASC;
//   `);

//   const allPostures = [];
//   const normalPostures = [];
//   const leanForwardPostures = [];
//   const leanBackwardPostures = [];

//   while (stmt.step()) {
//     const entry = stmt.getAsObject();
//     const { timestamp, postureType } = entry;

//     // Push to all postures
//     allPostures.push({ timestamp, postureType });

//     // Categorize by posture type
//     if (postureType === 'normal') {
//       normalPostures.push({ timestamp, postureType });
//     } else if (postureType === 'lean_forward') {
//       leanForwardPostures.push({ timestamp, postureType });
//     } else if (postureType === 'lean_backward') {
//       leanBackwardPostures.push({ timestamp, postureType });
//     }
//   }
//   stmt.free();

//   // Return categorized arrays
//   return {
//     allPostures,
//     normalPostures,
//     leanForwardPostures,
//     leanBackwardPostures,
//   };
// };
