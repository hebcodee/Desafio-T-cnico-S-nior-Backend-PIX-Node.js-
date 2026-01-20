const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

let cache = null; // cache sem TTL (bug adicional)

app.get('/pix/participants/:ispb', async (req, res) => {
  const { ispb } = req.params;

  if (!cache) {
    const response = await axios.get(process.env.BCB_PIX_URL);
    cache = response.data;
  }

  const participant = cache.find(p => p.ispb === ispb); // BUG proposital

  if (!participant) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  res.json(participant);
});

app.listen(PORT, () => {
  console.log(`PIX Service running on port ${PORT}`);
});
