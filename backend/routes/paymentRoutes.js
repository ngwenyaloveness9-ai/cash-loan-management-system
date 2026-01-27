const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.post('/', authMiddleware, paymentController.makePayment);
router.get('/', authMiddleware, paymentController.getPayments);

module.exports = router;
