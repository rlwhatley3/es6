const 		url				= require('url'),
					_					= require('lodash')

class Router {
	constructor(controllers) {
		this.controllers = controllers
		this.route = this.route
		this.setMethodType = this.setMethodType
		this.request = null
		this.response = null
		this.current_method_type = null
		this.next = null
		return this
	}

	setMethodType() {
		let self = this
		switch (self.request.method) {
			case 'GET':
				self.current_method_type = 'index'
				break
			case 'PUT':
				self.current_method_type = 'update'
				break
			case 'POST':
				self.current_method_type = 'create'
				break
			case 'DELETE':
				self.current_method_type = 'destroy'
				break
		} //switch
	}

	route(req, res, next) {
		let self = this
		self.request = req
		self.response = res
		self.setMethodType()
		let parsedUrl = url.parse(req.url)
		let endPoint = parsedUrl.pathname
		if(endPoint == '/favicon.ico') { return res.favicon(res) }
		let action_sequence = endPoint.split('/')
		let controller_name = action_sequence[1]
		let special_action = null
		if(action_sequence.length > 1) { special_action = action_sequence[2] }
		if(special_action != null) { self.current_method_type = special_action }
		if(_.includes(_.keys(this.controllers), controller_name) && this.controllers[controller_name] && this.controllers[controller_name][self.current_method_type] && _.includes(this.controllers[controller_name].accepts[self.request.method], self.current_method_type)) {
			this.controllers[controller_name][self.current_method_type](req, res, next)
		} else {
			res.send404(res)
		}
	} //route
}

module.exports = Router