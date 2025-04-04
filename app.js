const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const natural = require('natural');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Sample Product Data
const products = [
    { id: 1, name: 'Product 1', description: 'Description 1', price: 19.99, brand: 'Brand A', size: 'M', color: 'Red', imageUrl: 'https://images.unsplash.com/photo-1561948959-e8570b8ea618' },
    { id: 2, name: 'Product 2', description: 'Description 2', price: 29.99, brand: 'Brand B', size: 'L', color: 'Blue', imageUrl: 'https://images.unsplash.com/photo-1572390843689-4d04f6b0b075' },
    { id: 3, name: 'Product 3', description: 'Description 3', price: 39.99, brand: 'Brand A', size: 'S', color: 'Green', imageUrl: 'https://images.unsplash.com/photo-1600840156607-13bda5c8d8d6' },
    { id: 4, name: 'Product 4', description: 'Description 4', price: 49.99, brand: 'Brand C', size: 'XL', color: 'Black', imageUrl: 'https://images.unsplash.com/photo-1612154711604-d96e767c70a2' },
    { id: 5, name: 'Product 5', description: 'Description 5', price: 59.99, brand: 'Brand A', size: 'M', color: 'White', imageUrl: 'https://images.unsplash.com/photo-1518684079-c0ad6f5b98f3' },
    { id: 6, name: 'Product 6', description: 'Description 6', price: 50.99, brand: 'Brand B', size: 'M', color: 'White', imageUrl: 'https://images.unsplash.com/photo-1518684079-c0ad6f5b98f3' },
    { id: 7, name: 'Product 7', description: 'Description 7', price: 51.99, brand: 'Brand C', size: 'M', color: 'White', imageUrl: 'https://images.unsplash.com/photo-1518684079-c0ad6f5b98f3' },
    { id: 8, name: 'Product 8', description: 'Description 8', price: 53.99, brand: 'Brand D', size: 'M', color: 'White', imageUrl: 'https://images.unsplash.com/photo-1518684079-c0ad6f5b98f3' },
    { id: 9, name: 'Product 9', description: 'Description 9', price: 54.99, brand: 'Brand A', size: 'M', color: 'White', imageUrl: 'https://images.unsplash.com/photo-1518684079-c0ad6f5b98f3' },
    { id: 10, name: 'Product 10', description: 'Description 10', price: 54.99, brand: 'Brand C', size: 'M', color: 'White', imageUrl: 'https://images.unsplash.com/photo-1518684079-c0ad6f5b98f3' },
    
  ];
  
const SECRET_KEY = process.env.SECRET_KEY || 'secret-key'  ;

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Search products with filtering
app.post('/api/products/filter', (req, res) => {
  const { brand, size, color, price } = req.body;
  let filteredProducts = products;

  if (brand) {
    filteredProducts = filteredProducts.filter(product => product.brand === brand);
  }
  if (size) {
    filteredProducts = filteredProducts.filter(product => product.size === size);
  }
  if (color) {
    filteredProducts = filteredProducts.filter(product => product.color === color);
  }
  if (price && price.min != undefined && price.max != undefined) {
    filteredProducts = filteredProducts.filter(product => product.price >= price.min && product.price <= price.max);
  }

  res.json(filteredProducts);
});

// Semantic search with simple filtering (for demo purposes)
app.post('/api/products/search', (req, res) => {
  const query = req.body.query.toLowerCase();
  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query));
  res.json(filteredProducts);
});

// Suggest product names based on query
app.post('/api/products/suggest', (req, res) => {
  const query = req.body.query.toLowerCase();
  const suggestions = products.filter(product => product.name.toLowerCase().includes(query)).map(product => product.name);
  res.json(suggestions);
});

let users = [];

// Register route
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if email is already registered
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email is already in use' });
  }

  // Hash the password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  // Create the new user object
  const newUser = {
    name,
    email,
    password: hashedPassword
  };

  // Store the user in memory (replace with database in production)
  users.push(newUser);

  // Generate JWT token (optional step for now, typically used after login)
  const token = jwt.sign({ email: newUser.email }, 'secret-key', { expiresIn: '1h' });

  // Return a success message and the token
  res.status(201).json({ message: 'User registered successfully', token });
});

//Login route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Check if email is provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Find the user by email
  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Compare password with the hashed password
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err) {
      return res.status(500).json({ message: 'Error comparing passwords' });
    }
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token for the logged-in user
    const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });

    // Respond with the JWT token
    res.json({
      message: 'Login successful',
      token
    });
  });
});

// Tokenizer for basic NLP
const tokenizer = new natural.WordTokenizer();

// Search endpoint for semantic search and auto-completion
app.get('/search', (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  // Tokenize and match query with product data
  const tokens = tokenizer.tokenize(query.toLowerCase());

  // Semantic search: Filter products based on token match in name and description
  const results = products.filter(product => {
    const productText = `${product.name.toLowerCase()} ${product.description.toLowerCase()}`;
    return tokens.some(token => productText.includes(token));
  });

  res.json({ results });
});

// Auto-suggestions endpoint
app.get('/suggestions', (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  // Filter products based on query
  const suggestions = products.filter(product => {
    return product.name.toLowerCase().includes(query.toLowerCase());
  }).map(product => product.name);

  res.json(suggestions);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
