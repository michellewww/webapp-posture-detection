const express = require('express');
const path = require('path');
const app = express();
const port = 3005; // You can change this port if needed

// Serve static files from the 'public' folder (or wherever your HTML is)
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
