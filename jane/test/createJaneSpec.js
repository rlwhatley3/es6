const					expect = require('chai').expect,
							createJane   = require('../createJane'),
							janeClass = require('../lib/jane').Jane,
							Promise = require('bluebird')

describe('createJane', () => {
	let jane = null

	before((done) => {
		jane = createJane({controller_path: '../controllers'})
		jane.on('host enabled', (data) => { done() })
		jane.listen(8080, () => {})
	})

	describe('Create Jane:', () => {
		it('should be a function', () => { expect(createJane).to.be.a('function') })

		it('should return a new Jane class on method call', () => {
			expect(jane).to.not.be.null && expect(jane).to.not.be.undefined
		})

		it('should return a function', () => { expect(jane).to.be.a('function') })

		// using an emission, due to using a function as opposed to classing causing
		// instanceof to not recognize inheritance structure.
		// (ie, it just returns the prototype of the app as a function, not as an emitter)
		it('should return an event emitter', () => {
			jane.emit('message', { data: 'data' })
			jane.on('message', (data) => { expect(data.data).to.eq('data') })
			setTimeout(() => { expect(false).to.be.true }, 500)
		})

	})

	after(() => { jane.server.shutdown(() => { }) })

})