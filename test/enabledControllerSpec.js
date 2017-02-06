const					chai = require('chai'),
							schema = require('chai-json-schema'),
							expect = chai.expect,
							request = require('request'),
							createJane   = require('../jane/createJane.js'),
							enabledIndexSchema = require('./schemas/enabledIndexSchema')

chai.use(schema)

describe('EnabledController', () => {
	let enabledController, jane

	before((done) => {
		jane = createJane({controller_path: 'controllers'}, () => {})
		jane.on('controllers enabled', (data) => {
			jane.controllers = data.controllers
			enabledController = jane.controllers['enabled']
			done()
		})
		jane.listen(8080, () => {})
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
			expect(enabledController.index).to.not.be.undefined && expect(enabledController.index).to.not.be.null
		})

		it('should return 200 OK', () => { expect(response.statusCode).to.eq(200) })

		it('should return the json for connections', () => {
			expect(JSON.parse(body)).to.be.jsonSchema(enabledIndexSchema)
		})

	})

	after(() => { jane.server.shutdown(() => {  }) })
})