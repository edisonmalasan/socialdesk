const authService = require("./auth.service");

exports.login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const loginResult = await authService.login({ email, password });

		if (!loginResult) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		res.json(loginResult);
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
	}
};
