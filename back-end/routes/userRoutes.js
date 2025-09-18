const express = require('express');
const router = express.Router();
const { signup, login, getUserById } = require('../controllers/userController');

router.post("/signup", signup);
router.post("/login", login);
router.get('/:id', getUserById);

module.exports = router;