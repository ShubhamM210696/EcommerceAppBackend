const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

router.get('/collaborative', recommendationController.getCollaborativeRecommendations);
router.get('/content', recommendationController.getContentBasedRecommendations);
router.get('/realtime', recommendationController.getRealTimeRecommendations);
router.get('/rank', recommendationController.getPersonalizedRanking);

module.exports = router;
