const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getPending,
  updateCustomer,
  approveCustomer,
  rejectCustomer,
  setCustomerPassword,
} = require('../controllers/customerController');
const { verifyToken } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

// Every customer route is for the owner only
router.use(verifyToken, adminOnly);

router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/pending', getPending); // must stay above '/:id' routes
router.put('/:id', updateCustomer);
router.patch('/:id/approve', approveCustomer);
router.patch('/:id/reject', rejectCustomer);
router.patch('/:id/password', setCustomerPassword);

module.exports = router;