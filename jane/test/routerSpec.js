
const 				chai 					= require('chai')
							expect 				= chai.expect,
							createJane 		= require('../createJane'),
							Router				= require('../lib/router'),
							BaseController= require('../lib/controllers/base_controller')
							httpMocks			= require('node-mocks-http')

describe('Router:', () => {
	let jane, router
	before((done) => {
		jane = createJane({controller_path: '../controllers'})
		jane.on('controllers enabled', (data) => {
			jane.controllers = data.controllers
			router = new Router(jane.controllers)
			done()
		})
		jane.listen(8080, () => {})
	})

	it('should have the same controllers as its owner', () => { expect(router.controllers).to.equal(jane.controllers) })
	
	context('Methods:', () => {
		let request_methods = [{name: 'GET', type: 'index'}, {name: 'PUT', type: 'update'}, {name: 'POST', type: 'create'}, {name: 'DELETE', type: 'destroy'}]

		describe('route', () => {

			it('should be a function', () => { expect(router.route).to.be.a('function') })

			request_methods.forEach(method => {

				context(`using a ${method.name} request:`, () => {
					let request
					before((done) => {
						request = httpMocks.createRequest({
							method: method.name,
							url: '/controller'
						})
						response = httpMocks.createResponse(request)
						jane.req = _.merge(jane.req, request)
						jane.res = _.merge(jane.res, response)

						router.route(jane.req, jane.res)
						done()
					})
					it(`should change the current_method_type to ${method.type}`, () => {
						expect(router.current_method_type).to.equal(method.type)
					})
				})
			})

			context('using a special method on a specified controller which has the method', () => {
				let special_action = 'test_action'
				let request
				before((done) => {
					request = httpMocks.createRequest({
						method: 'GET',
						url: `/controller/${special_action}`
					})
					response = httpMocks.createResponse(request)
					jane.req = _.merge(jane.req, request)
					jane.res = _.merge(jane.res, response)
					jane.controllers['controller'] = new BaseController
					jane.controllers['controller'][special_action] = () => {}
					jane.controllers['controller'].accepts['GET'].push(special_action)
					router.route(jane.req, jane.res)
					done()
				})

				it('should respond 200 OK', () => { expect(jane.res.header().statusCode).to.equal(200) })

				it(`should change the current_method_type to ${special_action}`, () => { 
					expect(router.current_method_type).to.equal(special_action)
				})
			})

			context('using a special method on a controller missing the method', () => {
				let special_action = 'test_action'
				let request
				before((done) => {
					request = httpMocks.createRequest({
						method: 'GET',
						url: `/controller/${special_action}`
					})
					response = httpMocks.createResponse(request)
					jane.req = _.merge(jane.req, request)
					jane.res = _.merge(jane.res, response)
					jane.controllers['controller'] = new BaseController
					router.route(jane.req, jane.res)
					done()
				})

				it('should route to 404', () => { expect(jane.res.header().statusCode).to.equal(404) })
			})

			context('using a special method on a controller missing the method in its accepts list', () => {
				let special_action = 'test_action'
				let request
				before((done) => {
					request = httpMocks.createRequest({
						method: 'GET',
						url: `/controller/${special_action}`
					})
					response = httpMocks.createResponse(request)
					jane.req = _.merge(jane.req, request)
					jane.res = _.merge(jane.res, response)
					jane.controllers['controller'] = new BaseController
					jane.controllers['controller'][special_action] = () => {}
					router.route(jane.req, jane.res)
					done()
				})

				it('should route to 404', () => { expect(jane.res.header().statusCode).to.equal(404) })
			})
		})
	})

	after(() => { jane.server.shutdown(() => { }) })
})