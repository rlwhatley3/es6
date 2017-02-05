const					chai = require('chai'),
							schema = require('chai-json-schema'),
							expect = chai.expect,
							request = require('request'),
							BaseController   = require('../lib/controllers/base_controller'),
							createJane   = require('../createJane')

chai.use(schema)

describe('BaseController', () => {
	let baseController = null
	let jane = null

	before((done) => {
		jane = createJane()
		baseController = new BaseController
		jane.on('host enabled', (data) => { done() })
		jane.listen(8080)
	})

	describe('accepts object:', () => {
		it('should contain an accepts object', () => {
			expect(baseController.accepts).to.not.be.undefined && expect(baseController.accepts).to.not.be.null
		})

		it('should contain basic get method types', () => {
			expect(baseController.accepts['GET'].includes('index', 'show')).to.be.true
		})

		it('should contain basic put method types', () => {
			expect(baseController.accepts['PUT'].includes('update')).to.be.true
		})

		it('should contain basic POST method types', () => {
			expect(baseController.accepts['POST'].includes('create')).to.be.true
		})

		it('should contain basic DELETE method types', () => {
			expect(baseController.accepts['DELETE'].includes('destroy')).to.be.true
		})
	})
	after(() => { jane.server.shutdown(() => { }) })
})