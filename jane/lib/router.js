const 		url				= require('url'),
					_					= require('lodash')

class Router {
	constructor(controllers) {
		this.controllers = controllers
		return this
	}

	route(req, res, next) {
		let method = req.method
		let method_type = null
		switch (method) {
			case 'GET':
				method_type = 'index'
				break
			case 'PUT':
				method_type = 'update'
				break
			case 'POST':
				method_type = 'create'
				break
			case 'DELETE':
				method_type = 'destroy'
				break
		} //switch
		let parsedUrl = url.parse(req.url)
		let endPoint = parsedUrl.pathname
		if(endPoint == '/favicon.ico') { return res.favicon(res) }
		let action_sequence = endPoint.split('/')
		let controller_name = action_sequence[1]
		let special_action = null
		if(action_sequence.length > 1) { special_action = action_sequence[2] }
		if(special_action != null) { method_type = special_action }

		if(_.includes(_.keys(this.controllers), controller_name) && this.controllers[controller_name] && this.controllers[controller_name][method_type] && _.includes(this.controllers[controller_name].accepts[method], method_type))
			this.controllers[controller_name][method_type](req, res, next)
		else
			res.send404(res)
	} //route
}

module.exports = Router