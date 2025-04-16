const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');


dotenv.config(); // Load environment variables

const app = express();
const port = 3000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
