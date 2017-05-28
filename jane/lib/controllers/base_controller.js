const _				= require('lodash')

class BaseController {
	constructor() {
		let self = this
		_.each(_.keys(this), function(k) { self["$(k)"] = this["$(k)"] })
		this.index = this.index
		this.accepts = {
			'GET': ['index', 'show'],
			'PUT': ['update'],
			'POST': ['create'],
			'DELETE': ['destroy']
		}
		return this
	} //constructor

	index(req, res, next) {
		let client_names = Jane.connected_clients.map(client => _.keys(client)[0])
		let host_names = Jane.connected_hosts.map(host => _.keys(host)[0])
		res.json(res, { enabled_clients: client_names, enabled_hosts: host_names, self: Jane.IP })
	} //index

	show(req, res, next) {
		console.log('show')
		// let id = req.params['id']
		// Connected.find(id).then(function(C) { res.json(C) }, function(err) { console.error(err) })
	}

	// update(req, res, next) {
	// 	Connected.find(req.params.id).update(req.params.update_params()).then(function(err, connected) {
	// 		if(err) { return { error: err } }

	// 	})
	// }
}

module.exports = BaseController