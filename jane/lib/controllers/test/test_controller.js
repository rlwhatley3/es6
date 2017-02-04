const _									= require('lodash'),
			BaseController		= require('../../jane/lib/controllers/base_controller')


class TestController extends BaseController {
	
	constructor() {
		super()
		this.stuff = this.stuff
		this.accepts['GET'] = [ 'index', 'stuff']
	}

	stuff(req, res, next) {
		req.json(res, { message: 'stuff' })
	}

}


module.exports = TestController