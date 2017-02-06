const					expect = require('chai').expect,
							createJane   = require('../jane/createJane.js'),
							Promise = require('bluebird')

describe('Application Jane', () => {
	let jane = null

	before((done) => {
		jane = createJane({controller_path: 'controllers'}, () => {})
		jane.on('host enabled', (data) => { done() })
		jane.listen(8080, () => {})
	})

	describe('Creation', () => {
		it('should return a new Jane on method call', () => { 
			expect(jane).to.not.be.null && expect(jane).to.not.be.undefined
		})
	})

	after(() => { jane.server.shutdown(() => { }) })
})