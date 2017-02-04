const					expect = require('chai').expect,
							Jane   = require('../jane/jane.js'),
							Promise = require('bluebird')

describe('Jane', () => {
	let jane = null

	before(() => {
		jane = Jane({controller_path: '../controllers'})
		jane.listen(8080, () => {})
	})

	describe('Creation', () => {
		it('should return a new function', () => {
			expect(Jane).to.be.a('function')
		})

		it('should return a new Jane on method call', () => {
			expect(jane).to.not.be.null && expect(jane).to.not.be.undefined
		})
	})

	describe('Connected Hosts', () => {
		it('should have its own ip as a connected host', () => {
			let host_names = jane.connected_hosts.map(host => _.first(_.keys(host)))
			expect(host_names.includes(jane.IP)).to.be.true
		})
	})

	describe('The Enabled Jane Jost', () => {
		it('should exist', () => {
			expect(jane.enabled_host).to.not.be.null
		})

		it('should be named /jane_enabled', () => {
			expect(jane.enabled_host.name).to.eq('/jane_enabled')
		})

		it('should have the expected connection watcher', () => {
			expect(_.keys(jane.enabled_host._events).includes('connection')).to.be.true
		})
	})

	afterEach(() => {
		jane.server.shutdown(() => { })
	})
})