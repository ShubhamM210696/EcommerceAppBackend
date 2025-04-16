const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get products', error });
  }
};

// Filter products
exports.filterProducts = async (req, res) => {
  try {
    const { brand, size, color, price } = req.body;

    const filter = {};
    if (brand) filter.brand = brand;
    if (size) filter.size = size;
    if (color) filter.color = color;
    if (price && price.min !== undefined && price.max !== undefined) {
      filter.price = { $gte: price.min, $lte: price.max };
    }

    const filteredProducts = await Product.find(filter);
    res.json(filteredProducts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to filter products', error });
  }
};

// Semantic search (by all parameters)
exports.semanticSearch = async (req, res) => {
  try {
    const query = req.query.query?.toLowerCase();
    if (!query) return res.status(400).json({ message: 'Query parameter is required' });

    const matchingProducts = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { size: { $regex: query, $options: 'i' } },
        { color: { $regex: query, $options: 'i' } },
        { price: isNaN(query) ? undefined : Number(query) } // Only match price if query is numeric
      ].filter(Boolean) // remove undefined conditions
    });

    res.json(matchingProducts);
  } catch (error) {
    res.status(500).json({ message: 'Semantic search failed', error });
  }
};

// Suggestions (autocomplete)
exports.suggestions = async (req, res) => {
  try {
    const query = req.query.query?.toLowerCase();
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const matchingProducts = await Product.find({
      name: { $regex: query, $options: 'i' }
    }).select('name');

    const suggestions = matchingProducts.map(product => product.name);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get suggestions', error });
  }
};
