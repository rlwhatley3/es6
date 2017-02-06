const					chai					= require('chai')
							expect 				= chai.expect,
							createJane 		= require('../createJane'),
							janeClass 		= require('../lib/jane').Jane

describe('Jane:', () => {
	let jane, j_Class
	before((done) => {
		jane = createJane({controller_path: '../controllers'})
		j_Class = new janeClass({controller_path: '../controllers'})
		jane.on('host enabled', (data) => { done() })
		jane.listen(8080, () => {})
	})

	context('host connections:', () => {
		describe('Connected Hosts', () => {
			it('should have its own ip as a connected host', () => {
				let host_names = jane.connected_hosts.map(host => _.first(_.keys(host)))
				expect(host_names.includes(jane.IP)).to.be.true
			})
		})

		describe('The Enabled Jane Host:', () => {
			it('should exist', () => { expect(jane.enabled_host).to.not.be.null })

			it('should be named /jane_enabled', () => { expect(jane.enabled_host.name).to.eq('/jane_enabled') })

			it('should have a connection watcher', () => { expect(_.keys(jane.enabled_host._events).includes('connection')).to.be.true })
		})
	})

	context('Methods:', () => {
		context('scan:', () => {
			let scan
			before((done) => { j_Class.scan().then((scn_res) => { scan = scn_res; done(); }) })

			it('should not return its own ip', () => { expect(scan.includes(j_Class.IP)).to.be.false })

			it('should return any ip on the network', () => { expect(scan.length).to.be.above(0) })
		})
	})

	after(() => { jane.server.shutdown(() => { }) })
})