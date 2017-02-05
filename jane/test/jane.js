const					chai					= require('chai')
							expect 				= chai.expect,
							createJane 		= require('../createJane'),
							janeClass 		= require('../lib/jane').Jane
							// Promise 			= require('bluebird')

describe('Jane:', () => {
	let jane, j_Class
	before((done) => {
		jane = createJane({controller_path: '../controllers'})
		j_Class = new janeClass()
		jane.on('host enabled', (data) => { done() })
		jane.listen(8080, () => {})
	})

	context('scanning', () => {
		let scan
		beforeEach((done) => {
			j_Class.scan().then((scn_res) => { scan = scn_res; done(); })
		})

		it('should not return its own ip', () => { expect(scan.includes(j_Class.IP)).to.be.false })

		it('should return any ip on the network', () => { expect(scan.length).to.be.above(0) })
	})

	after(() => { jane.server.shutdown(() => { }) })
})