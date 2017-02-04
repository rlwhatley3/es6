const					expect = require('chai').expect,
							createJane   = require('../createJane'),
							janeClass = require('../lib/jane').Jane,
							Promise = require('bluebird')
							// Jane = require('../createJane')

describe.only('Jane', () => {
	let jane, j_Class
	before((done) => {
		jane = createJane({controller_path: '../controllers'})
		jane.listen(8080, () => {})
		j_Class = new janeClass()
		setTimeout(() => {
			console.log('loading connections...')
			done()
		}, 400)
	})

	context('scanning', () => {
		let scan
		beforeEach((done) => {
			j_Class.scan().then((scn_res) => { scan = scn_res; done(); })
		})

		it('should not return its own ip', () => { expect(scan.includes(j_Class.IP)).to.be.false })
		
		it('should return any ip on the network', () => { expect(scan.length).to.be.above(0) })
	})


	after(() => {
		jane.server.shutdown(() => { })
	})
})