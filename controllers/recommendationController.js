const { products, userPurchases, productSimilarity, userInterests } = require('../data/mockData');
const UserInterest = require('../models/UserInterest'); // userId, brand, size, color
const Product = require('../models/Product');
const UserPurchase = require('../models/UserPurchase'); // userId, productIds[]
const ProductSimilarity = require('../models/ProductSimilarity'); // productId, similarProductIds[]
const natural = require('natural');
const _ = require('lodash');
const ViewedProduct = require('../models/ViewedProduct'); // your schema
// ----------------- COLLABORATIVE FILTERING -----------------

exports.getCollaborativeRecommendations = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const userData = await UserPurchase.findOne({ userId }).lean();
    const userProducts = userData?.products || [];

    // Find users who share at least one product
    const similarUsers = await UserPurchase.find({
      userId: { $ne: userId },
      products: { $in: userProducts }
    }).lean();

    let similarUserProducts = [];
    similarUsers.forEach(user => {
      const otherProducts = user.products.filter(p => !userProducts.includes(p));
      similarUserProducts.push(...otherProducts);
    });

    const uniqueRecommendations = [...new Set(similarUserProducts)];

    const recommendedProducts = await Product.find({
      _id: { $in: uniqueRecommendations }
    }).lean();

    res.json(recommendedProducts);
  } catch (error) {
    console.error('Collaborative filtering error:', error);
    res.status(500).json({ message: 'Failed to get collaborative recommendations', error });
  }
};


// ----------------- CONTENT-BASED FILTERING -----------------
exports.getContentBasedRecommendations = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const userData = await UserPurchase.findOne({ userId }).lean();
    const userProducts = userData?.products || [];

    const similarIdsSet = new Set();

    // Collect similar product IDs from ProductSimilarity collection
    const similarities = await ProductSimilarity.find({
      productId: { $in: userProducts }
    }).lean();

    similarities.forEach(entry => {
      entry.similarProducts.forEach(id => {
        if (!userProducts.includes(id.toString())) {
          similarIdsSet.add(id.toString());
        }
      });
    });

    const recommendedProducts = await Product.find({
      _id: { $in: Array.from(similarIdsSet) }
    }).lean();

    res.json(recommendedProducts);
  } catch (error) {
    console.error('Content-based filtering error:', error);
    res.status(500).json({ message: 'Failed to get content-based recommendations', error });
  }
};

// ----------------- REAL-TIME RECOMMENDATIONS -----------------
// exports.getRealTimeRecommendations = async (req, res) => {
//   try {
//     const query = req.query.query?.toLowerCase();
//     if (!query) {
//       return res.status(400).json({ message: 'Query parameter is required' });
//     }

//     // Build MongoDB regex search condition
//     const regex = new RegExp(query, 'i'); // case-insensitive match

//     const matched = await Product.find({
//       $or: [
//         { name: { $regex: regex } },
//         { description: { $regex: regex } },
//         { brand: { $regex: regex } },
//         { size: { $regex: regex } },
//         { color: { $regex: regex } },
//       ]
//     }).limit(5); // Return top 5 results

//     res.json(matched);
//   } catch (error) {
//     console.error('Error fetching real-time recommendations:', error);
//     res.status(500).json({ message: 'Failed to get real-time recommendations', error });
//   }
// };


// const ViewedProduct = require('../models/ViewedProduct');

// exports.getRealTimeRecommendations = async (req, res) => {
//   try {
//     const userId = req.query?.userId || req.ip;
//     const query = req.query.query?.toLowerCase();

//     // 1. Fetch the last 5 viewed products by the user
//     const viewedProducts = await ViewedProduct.find({ userId })
//       .sort({ viewedAt: -1 })
//       .limit(5);

//     const viewedProductIds = viewedProducts.map((v) => v.productId);

//     // 2. Fetch product details for those viewed product IDs
//     const recentViewedDetails = await Product.find({ _id: { $in: viewedProductIds } });

//     // 3. Build conditions for recommendation based on similar brand, color, or size
//     const orConditions = [];
//     recentViewedDetails.forEach((product) => {
//       if (product.brand) {
//         orConditions.push({ brand: product.brand });
//       }
//       if (product.color) {
//         orConditions.push({ color: product.color });
//       }
//       if (product.size) {
//         orConditions.push({ size: product.size });
//       }
//     });

//     // 4. Add search relevance if user typed a query
//     if (query) {
//       const regex = new RegExp(query, 'i');
//       orConditions.push(
//         { name: { $regex: regex } },
//         { description: { $regex: regex } },
//         { brand: { $regex: regex } },
//         { color: { $regex: regex } }
//       );
//     }

//     // 5. Final recommendation query
//     const recommendations = await Product.find({
//       $or: [
//         ...orConditions,
//         { _id: { $in: viewedProductIds } }
//       ]
//     }).limit(5);

//     res.json(recommendations);
//   } catch (error) {
//     console.error('Error fetching real-time recommendations:', error);
//     res.status(500).json({ message: 'Failed to get real-time recommendations', error });
//   }
// };

exports.getRealTimeRecommendations = async (req, res) => {
  try {
    const userId = req.query?.userId || req.ip;

    // 1. Fetch last 5 viewed products
    const viewedProducts = await ViewedProduct.find({ userId }).sort({ viewedAt: -1 }).limit(5);
    const viewedProductIds = viewedProducts.map(v => v.productId);

    // 2. Get details of viewed products and all products
    const [viewedDetails, allProducts] = await Promise.all([
      Product.find({ _id: { $in: viewedProductIds } }),
      Product.find()
    ]);

    // 3. Convert product to feature string
    const toFeatureText = (p) => `${p.name} ${p.description} ${p.brand} ${p.color} ${p.size} ${(p.tags || []).join(' ')}`;

    const viewedVectors = viewedDetails.map(toFeatureText);
    const allVectors = allProducts.map(toFeatureText);

    // 4. Vectorize with TF-IDF
    const tfidf = new natural.TfIdf();
    allVectors.forEach((vec) => tfidf.addDocument(vec));

    const recommendations = new Map();

    // 5. Compute similarity between each viewed product and all products
    viewedVectors.forEach((viewedVec, idx) => {
      allVectors.forEach((targetVec, jdx) => {
        if (allProducts[jdx]._id.toString() === viewedDetails[idx]._id.toString()) return;

        const similarity = natural.JaroWinklerDistance(viewedVec, targetVec);
        const productId = allProducts[jdx]._id.toString();

        if (!recommendations.has(productId)) {
          recommendations.set(productId, { product: allProducts[jdx], score: similarity });
        } else {
          // Boost score if already recommended
          const current = recommendations.get(productId);
          current.score = Math.max(current.score, similarity);
        }
      });
    });

    // 6. Sort by score and take top 5
    const topRecommendations = _(Array.from(recommendations.values()))
      .orderBy('score', 'desc')
      .slice(0, 5)
      .map(r => r.product)
      .value();

    res.json(topRecommendations);
  } catch (error) {
    console.error('Error with ML-based recommendations:', error);
    res.status(500).json({ message: 'Failed to get recommendations', error });
  }
};


// ----------------- PERSONALIZED RANKING -----------------
exports.getPersonalizedRanking = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: 'Missing userId in query' });
    }

    // Fetch user preferences from MongoDB
    const prefs = await UserInterest.findOne({ userId }).lean();

    if (!prefs) {
      return res.status(404).json({ message: 'User preferences not found' });
    }

    // Fetch all products
    const products = await Product.find({}).lean();

    // Score products based on preferences
    const ranked = products
      .map(product => {
        let score = 0;
        if (prefs.brand && product.brand === prefs.brand) score += 2;
        if (prefs.size && product.size === prefs.size) score += 1;
        if (prefs.color && product.color === prefs.color) score += 1;
        return { ...product, score };
      })
      .sort((a, b) => b.score - a.score);

    // Return top 5
    res.json(ranked.slice(0, 5));
  } catch (error) {
    console.error('Error in personalized ranking:', error);
    res.status(500).json({ message: 'Failed to get personalized ranking', error });
  }
};