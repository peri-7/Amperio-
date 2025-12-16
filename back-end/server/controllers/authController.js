const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Sign up
const signup = async (req, res) => {
	const { name, email, password } = req.body;

	try {
		// A. check if user exists
		const existingUser = await User.findByIdentifier(email, name);
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}

		// B. hash the password 
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// C. save to DB
		result = await User.create(name, email, hashedPassword);

		// D. create token for login
		const newUserId = result.insertId;

		const token = jwt.sign(
			{ user_id: newUserId, role: 'user' },
			process.env.JWT_SECRET, // Use your .env variable here
			{ expiresIn: '1h' }
		);

		// E. send token back
		res.status(201).json({
			message: 'User registered and logged in',
			token,
			user: { user_id: newUserId, name: name, email: email, role: 'user' }
		});

	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};


// 2. Login
const login = async (req, res) => {
	const { identifier, password } = req.body;

	try {
		// A. find user by email or username
		const user = await User.findByIdentifier(identifier, identifier);
		if (!user) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		// B. compare the password sent vs the scrambled password in DB
		const isMatch = await bcrypt.compare(password, user.safe_password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		// C. generate Token (The ID Card)
		// We hide the user's ID inside the token
		const token = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

		res.json({ token, user: { user_id: user.user_id, name: user.username, email: user.email, role: user.role } });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

module.exports = { signup, login };
