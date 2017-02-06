module.exports = {
	title: 'base controller index schema v1',
	type: 'object',
	required: ['enabled_clients', 'enabled_hosts', 'self'],
	properties: {
		enabled_clients: {
			type: 'array',
			minItems: 0,
			uniqueItems: true,
			items: {
				type: 'string'
			}
		},
		enabled_hosts: {
			type: 'array',
			minItems: 1,
			uniqueItems: true,
			items: {
				type: 'string'
			}
		},
		self: {
			type: 'string'
		}
	}
}