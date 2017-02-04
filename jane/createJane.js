const				async				= require('async'),
						http				= require('http'),
						req					= http.IncomingMessage.prototype,
						res					= http.ServerResponse.prototype,
						Jane 				= require('./lib/jane').Jane

createJane = function(config={}, cb = function() { console.log('Jane Created and Callback Initiated') }) {
	let app = function(req, res, next) {
		app.handle(req, res, next)
	}
	let jane = new Jane(config)
	app = _.merge(app, jane)

	app.req = req
	app.res = res
	return app
} //createJane


module.exports = createJane