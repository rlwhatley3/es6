const _				= require('lodash')

class UploadController {
	constructor() {
		let self = this
		_.each(_.keys(this), function(k) { self["$(k)"] = this["$(k)"] })
		this.propagate = this.propagate
		return this
	} //constructor

	propagate(req, res, next) {
		let file = req.params.file
		let targets = req.params.targets
		let target_devices = _.filter(_.uniq(req.JANE.connected_clients + req.JANE.connected_hosts), function(device) { _.includes(targets, _.keys(device)[0]) })
		_.each(target_devices, function(target_device) { req.JANE.enabled_host.to(target_device.id).emit('propagate', { file: file }) })
		res.json(res, { target_devices: _.map(target_devices, function(target_device) { return _.keys(target_device)[0] } ) })
	} //propagate

}

module.exports = BaseController