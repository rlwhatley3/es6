const					chai = require('chai'),
							schema = require('chai-json-schema'),
							expect = chai.expect,
							request = require('request'),
							BaseController   = require('../jane/lib/controllers/base_controller'),
							Jane   = require('../jane/createJane.js')
							enabledIndexSchema = require('./schemas/enabledIndexSchema')

chai.use(schema)

describe('BaseController', () => {
	let baseController = null
	let jane = null

	before((done) => {
		jane = Jane()
		jane.listen(8080)
		baseController = new BaseController
		// 400 is enough time for 2 attempts to a single connection
		setTimeout(() => {
			console.log('loading connections...')
			done()
		}, 400)
	})

	describe('accepts object', () => {
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

	describe('index using an inherited base controller', () => {
		let url = 'http://localhost:8080/enabled'

		let error,response,body
		before((done) => {
			request(url, (err, respons, bod) => {
				if(err) { error = err }
				response = respons
				body = bod
				done()
			})
		})

		it('should be available on the controller', () => {
			expect(baseController.index).to.not.be.undefined && expect(baseController.index).to.not.be.null
		})

		it('should return 200 OK', () => {
			expect(response.statusCode).to.eq(200)
		})

		it('should return the json for connections', () => {
			expect(JSON.parse(body)).to.be.jsonSchema(enabledIndexSchema)
		})

	})

	after(() => {
		jane.server.shutdown(() => {  })
	})
})