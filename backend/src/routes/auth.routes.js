const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../../database/config/supabaseClient");

router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		console.log(email, password);
		const { data: user, error } = await supabase
			.from('users')
			.select('*')
			.eq('email', email)
			.single();

		if (error || !user) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const isMatch = await bcrypt.compare(password, user.password_hash);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const token = jwt.sign(
			{ id: user.id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: '1d' }
		);

		res.json({
			token,
			role: user.role,
			user: {
				id: user.id,
				email: user.email,
				full_name: user.full_name
			}
		});
	} catch (error) {

	}
});

module.exports = router;