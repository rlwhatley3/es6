const				async				= require('async'),
						fs 					= require('fs'),
						path				= require('path'),
						os					= require('os'),
						http				= require('http'),
						Promise			= require('bluebird'),
						io					= require('socket.io'),
						io_client		= require('socket.io-client'),
						_						= require('lodash'),
						exec				= require('child_process').exec,
						includeAll	= require('include-all'),
						util				= require('./lib/http_helpers'),
						url 				= require('url')
						Router			= require('./lib/router'),
						EventEmitter= require('events'),
						req					= http.IncomingMessage.prototype,
						res					= http.ServerResponse.prototype


createJane = function(config={}, cb = function() { console.log('Jane Created and Callback Initiated') }) {
	let app = function(req, res, next) {
		app.handle(req, res, next)
	}

	let jane = new Jane(config)
	app = _.merge(app, jane)

	app.req = req
	app.res = res
	return app
} //createJane


class Jane extends EventEmitter {
	constructor(config={}) {
		super()
		this._ = _
		this.config = config
		this.config.appPath = process.cwd()
		if(this.config.controller_path == null || this.config.controller_path == '') { this.config.controller_path = 'controllers' }
		this.available_ips = os.networkInterfaces()
		this.IP = this.available_ips[_.keys(this.available_ips)[1]][0].address
		this.settings = {}
		this.JANEPORT = null
		this.possible_hosts = []
		this.connected_hosts = []
		this.connected_clients = []
		this.controllers = {}
		this.controller_path = path.resolve(this.config.appPath, this.config.controller_path)
		this.controller_directories = []
		this.loadControllers()
		this.Router = new Router(this.controllers)
		this.req = _.merge(req, util)
		this.res = _.merge(res, util)
		this.handle = this.handle
		this.io = io
		this.io_client = io_client
		this.listen = this.listen
		this.scan = this.scan
		this.enableJaneHost = this.enableJaneHost
		this.enableJaneClient = this.enableJaneClient
		this.connectAsClient = this.connectAsClient
		this.consumeFile = this.consumeFile
		this.json = this.json
		this.createParams = this.createParams
		return this
	}

	handle(req, res, next) {
		req.JANE = this
		this.Router.route(req, res, next)
	} //handle

	getStats(traversables) {
		let self = this
		return Promise.mapSeries(traversables, function(traversable) {
			return new Promise(function(resolve, reject) {
				fs.lstat(`${traversable.path}`, function(err, stats) {
					if(err) { reject({ error: err }) }
					if(!err && stats.isDirectory()) {
						traversable.type = 'directory'
						resolve(traversable)
					} else if(!err && !stats.isDirectory()) {
						let filter = /(\w+)*(Controller)\.(js|coffee|litcoffee)$/
						if(traversable.name.match(filter) && traversable.name.match(filter).length > 0) {
							traversable.type = 'controller'
							traversable.name = traversable.name.match(filter)[1]
						} else {
							traversable.type = 'file'
						}
						resolve(traversable)
					}
					return
				})
			})
		})
	} //getStats

	setDirectoryControllers(directory, controllers) {
		let self = this
		_.each(controllers, function(controller) { if(!self.controllers[controller.name]) { self.controllers[controller.name] = new new require(controller.path) } })
		return self.controllers
	}

	readDirectory(directory, directory_base) {
		let self = this
		return new Promise(function(resolve, reject) {
			fs.readdir(directory, function(err, traversables) {
				traversables = _.map(traversables, function(traversable) {
					let ret = {
						name: traversable,
						type: 'unknown',
						path: `${directory}/${traversable}`,
						directory: directory_base
					}
					return ret
				})
				self.getStats(traversables).then(function(traversables_return) {
					let controllers = traversables_return.filter(tt => tt.type == 'controller')
					let directories = traversables_return.filter(tt => tt.type == 'directory')

					if(controllers.length > 0) { self.setDirectoryControllers(_.first(controllers).directory, controllers) }
					if(directories.length > 0) {
						return Promise.mapSeries(directories, function(directory) { return self.readDirectory(`${directory.path}`, `${directory.name}`) })
					} else {
						return resolve({ controllers: self.controllers })
					}
				}, function(err) { return { message: err} })
			})
		})
	} //readDirectory

	loadControllers() {
		let self = this
		// let controller_path = path.resolve(self.config.appPath, given_path)
		let controller_base = _.last(self.controller_path.split('/'))
		self.readDirectory(self.controller_path, controller_base).then(function(res) {
			console.log(`controllers: ${_.keys(self.controllers)}`)
		}, function(err) { console.log(`error: ${err}`)})
		return
	} //loadControllers

	enableJaneHost(server) {
		this.enabled_host = this.io.of('/jane_enabled')
		let self = this
		self.connected_hosts.push({ [`${self.IP}`]: self.enabled_host })

		self.enabled_host.on('connection', function(client) {
			let client_address = _.last(client.handshake.address.split(':'))
			if(!_.includes(_.map(self.connected_clients, function(cc) { _.keys(cc)[0] }), client_address )) {
				self.connected_clients.push({ [`${_.last(client.handshake.address.split(':'))}`]: client })
			}

			console.log(`Jane Enabled connection innitiated from client: ${_.last(client.handshake.address.split(':'))}`)

			client.on('room', function(data) { 
				let room = data.room
				client.join(room)
				self.enabled_host.to(room).emit('message', { message: `${client.handshake.address} is JaneEnabled` })
			}) //room

			client.on('message', function(data) { console.log(`host service ${self.IP} recieved message from client ${client.handshake.address.split(':')[3]}: "${data.message}"`) })

			client.on('disconnect', function(data) {
				console.log(`client disconnected: ${_.last(client.handshake.address.split(':'))}`)
				self.connected_clients = _.filter(self.connected_clients, function(cc) { _.keys(cc)[0] != _.last(client.handshake.address.split(':')) })
			}) //disconnect
		}) //connection

		self.enabled_host.on('propagate', function(id, data) {
			console.log(`propagate id: ${id}`)
			self.consumeFile(data)
		})
		return server
	} //enableJaneJost

	scan(blacklist=[]) {
		return new Promise(function(resolve, reject) {
			exec('arp -n | awk \'{print $1}\' | tail -n+2', function(err, ret) {
				if (err) { console.error(err) && reject(err) }
				let hosts = _(ret.split('\n')).map(function(ip) { if(ip != '' && !_.includes(blacklist, ip)) { return ip } }).compact().value()
				resolve(hosts)
			}) //exec
		}) //promise
	} //scan

	consumeFile(data={}) {
		if(!data.file) { return { error: 'no file provided' } }
		// could this possibly have its own self contained mini-db? it would be a fairly interesting implementation.
		// Use es6 memory management and apportion an area for it, then use basic node to access it.
		/*
			if data.file typeof controller
				self.createControllerFile(data).then(res) {
					self.loadControllers(self.config.controller_path)
				}
			elseif data.file typeof task
				if data.file typeof planned_task
					self.findOrCreatePlannedTask(data)
				elseif data.file typeof command
					if self.interupptable()
						return executeCommand(data)
					else
						return { error: 'Currently in uninterupptable state, cannot accept direct commands' }
		*/


		return {  }
	} //consumeFile

	connectAsClient(host, room) {
		let self = this
		let res = null

		return new Promise(function(resolve, reject) {
			let connection_string = `http://${host}:${self.JANEPORT}${room}`
			let connected = self.connected_clients.concat(self.connected_hosts)
			let connected_names = connected.map(connected => _.keys(connected)[0])

			// prevent dual subscription
			if(_.includes(connected_names, host)) { reject({ message: 'connection exists', existing_connection: connected[host] }) }
			let socket = self.io_client.connect(connection_string, { reconnect: false, timeout: 400, reconnectionAttempts: 2 })
			socket.on('connect', function() {
				socket.on('message', function(data) { console.log(`host '${host}' sent message: ${data.message}`) })
				socket.emit('room', { room: room })
				socket.emit('message', { message: `a message from client to host: ${host}` })
				socket.on('propagate', function(id, data) { self.consumeFile(data) })
				resolve({ connected: host, socket: socket })
			}) //connect

			socket.on('disconnect', function(client) {
				self.connected_hosts = self.connected_hosts.filter(ch => _.keys(ch)[0] != socket.io.opts.hostname )
			}) //disconnect

			setTimeout(function() {
				if(socket.connected)
					resolve({ connected: host, socket: socket })
				else
					resolve({ no_connection: host })
			}, 200) //timeOut
		}) //promise
	} //connectAsClient

	enableJaneClient() {
		let self = this
		this.scan([self.IP]).then(function(possible_hosts) {
			let hosts = []
			let room = '/jane_enabled'
			self.possible_hosts = possible_hosts
			Promise.mapSeries(possible_hosts, function(possible_host) { return self.connectAsClient(possible_host, room) }).then(function(res) {
				_(res).compact().map(function(connection_attempt) { if(connection_attempt.connected != null && connection_attempt.connected != 'undefined') { hosts.push({[`${connection_attempt.connected}`]: connection_attempt.socket }) } }).value()
				_.each(hosts, function(host) { if(!_.includes(_.keys(self.connected_hosts), _.keys(host)[0])) { self.connected_hosts.push(host) } })
				return self.server
			}, function(err) {
				console.error(`map series err ${err.message}`)
				return err
			}) //promise
		}, function(err) { console.log(`scan err: ${err.message}`) }) //scan
	} //enableJaneClient

	listen(port, cb = function() { console.log(`Jane listening on localhost:${port}`) }) {
		let self = this
		this.JANEPORT = port
		this.server = http.createServer(this)
		this.io = this.io(this.server)
		this.enableJaneClient()
		this.server = this.enableJaneHost(this.server)
		this.server.listen(this.JANEPORT, cb)
	} //listen

} //Jane


module.exports = createJane