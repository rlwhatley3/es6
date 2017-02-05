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
		it('should return a new function', () => { expect(createJane).to.be.a('function') })

		it('should return a new Jane on method call', () => { expect(jane).to.not.be.null && expect(jane).to.not.be.undefined })
	})

	describe('Connected Hosts', () => {
		it('should have its own ip as a connected host', () => {
			let host_names = jane.connected_hosts.map(host => _.first(_.keys(host)))
			expect(host_names.includes(jane.IP)).to.be.true
		})
	})

	describe('The Enabled Jane Host', () => {
		it('should exist', () => { expect(jane.enabled_host).to.not.be.null })

		it('should be named /jane_enabled', () => { expect(jane.enabled_host.name).to.eq('/jane_enabled') })

		it('should have a connection watcher', () => { expect(_.keys(jane.enabled_host._events).includes('connection')).to.be.true })
	})

	after(() => { jane.server.shutdown(() => { }) })
})