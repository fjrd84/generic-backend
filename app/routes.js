const authRoutes = require('./routes/auth');

module.exports = function (app, passport) {

	/**
	* Simply return an API Home on the root path.
	*/
	app.get('/', function (req, res) {
		res.json({ message: "API Home." });
	});

  /**
	 * Auth routes.
	 */
	app.use('/auth', authRoutes(passport));

};
