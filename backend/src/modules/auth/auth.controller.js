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

exports.logout = (req, res) => {
	// JWTs are stateless and hold no server-side session, so there is nothing
	// to invalidate here. This exists to give clients a single endpoint to call
	// on sign-out, and to clear the auth cookies if they are ever set httpOnly
	// by the server instead of the frontend.
	res.clearCookie("auth-token");
	res.clearCookie("user-role");
	res.json({ message: "Logged out successfully" });
};
