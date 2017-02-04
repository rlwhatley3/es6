const _									= require('lodash'),
			BaseController		= require('../jane/lib/controllers/base_controller')


class EnabledController extends BaseController {
	
	constructor() {
		super()
		this.stuff = this.stuff
		// this.index = this.index
		this.accepts['GET'] = [ 'index', 'stuff']
	}

	stuff(req, res, next) {
		res.json(res, { message: 'stuff' })
	}

}


module.exports = EnabledController