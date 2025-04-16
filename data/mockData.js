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
  
 // ----------------- MOCK DATA -----------------

// Sample user purchase history
const userPurchases = {
    user1: [1, 2], // Purchased Product 1 and 2
    user2: [2, 3],
    user3: [3,4,5]
  };
  
  // Sample product similarity (for content-based)
  const productSimilarity = {
    1: [2, 3], // Similar to Product 1
    2: [1, 4],
    3: [2, 5],
    4: [5],
    5: [4]
  };
  
  // Mock user interests for ranking
  const userInterests = {
    user1: { brand: 'Brand A', color: 'White' },
    user2: { size: 'M', color: 'Black' },
    user3: { brand: 'Brand C', size: 'XL' }
  };
  
  module.exports = { products, userPurchases, productSimilarity, userInterests };
  