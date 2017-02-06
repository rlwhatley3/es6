const					chai = require('chai'),
							schema = require('chai-json-schema'),
							expect = chai.expect,
							request = require('request'),
							BaseController   = require('../lib/controllers/base_controller'),
							createJane   = require('../createJane'),
							httpMocks			= require('node-mocks-http'),
							baseControllerSchema = require('./schemas/baseControllerSchema')

chai.use(schema)

describe('BaseController', () => {
	let baseController = null
	let jane = null

	before((done) => {
		jane = createJane({controller_path: '../controllers'})
		baseController = new BaseController
		jane.on('host enabled', (data) => { done() })
		jane.listen(8080, () => {})
	})

	context('methods:', () => {
		describe('index', () => {
			let mock_request

			it('should be present', () => { expect(baseController['index']).to.not.be.null && expect(baseController['index']).to.not.be.undefined })

			context('using no params', () => {
				let response, body
				let url = 'http://localhost:8080/controller'
				before((done) => {

					jane.controllers['controller'] = new BaseController
					jane.Router.controllers = jane.controllers

					request(url, (err, respons, bod) => {
						if(err) { error = err }
						response = respons
						body = bod
						done()
					})
				})

				it('should return 200 OK', () => { expect(response.statusCode).to.equal(200) })

				it('should return the connections object', () => { expect(JSON.parse(body)).to.be.jsonSchema(baseControllerSchema) })
			})

		})
	})

	context('accepts object:', () => {
		it('should be present', () => {
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