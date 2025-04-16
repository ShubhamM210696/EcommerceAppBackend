const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.post('/filter', productController.filterProducts);
router.get('/search', productController.semanticSearch);
router.get('/suggestions', productController.suggestions);

module.exports = router;
