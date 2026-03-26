const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const categoryRoutes = require('./categories');
const providerRoutes = require('./providers');
const productRoutes = require('./products');
const customerRoutes = require('./customers');
const expenseRoutes = require('./expenses');
const purchaseRoutes = require('./purchases');
const saleRoutes = require('./sales');
const dashboardRoutes = require('./dashboard');
const settingRoutes = require('./settings');
const userRoutes = require('./users');

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/providers', providerRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/expenses', expenseRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/sales', saleRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingRoutes);
router.use('/users', userRoutes);

module.exports = router;
