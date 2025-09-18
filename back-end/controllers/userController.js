const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });
        if(exists) return res.status(400).json({ message: 'User already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password:(hashed) });

        const token = jwt.sign({ id:user ._id, role: user.role }, process.env.JWT_SECRET,
            {expiresIn: '1h'});
        res.status(201).json({ token, user:{ id: user._id, name: user.name, role: user.role }, });
    } catch (error) {
        console.error('Signup Error:', err.message);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user) return res.status(404).json({ message: 'User not found' });

        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(401).json({ message: 'Incorrect password' });

        const token = jwt.sign({ id:user ._id, role: user.role }, process.env.JWT_SECRET,
            {expiresIn: '1h'});
        res.status(201).json({ token, user:{ id: user._id, name: user.name, role: user.role }, });
    } catch (error) {
        console.error('Login Error:', err.message);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
}

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // ✅ FIX: typo "passowrd"
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        console.error('Get User Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
};