const express = require('express');
const ping = require('ping');
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'none'; font-src *;");
  next();
});


app.get('/api/ping/:ipAddress', async (req, res) => {
  const ipAddress = req.params.ipAddress;

  try {
    const result = await ping.promise.probe(ipAddress);
    
    res.json({ alive: result.alive });
  } catch (error) {
    console.error('Error pinging the host:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});