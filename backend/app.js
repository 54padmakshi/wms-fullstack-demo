const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const salesRoutes = require('./routes/salesRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Root route to confirm backend is up
app.get('/', (req, res) => {
  res.send(' yes ! ✅ Backend is running!');
});

//connect to mongoDB
mongoose.connect(process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

    //Api routes
app.use('/api/sales', salesRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

