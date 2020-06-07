import { Op, fn } from 'sequelize';

export function couponProductWhere(product) {
	return {
		'$companies.id$': {
			[Op.or]: [
				product.get('companyId'),
				{ [Op.is]: null }
			]
		},
		'$products.id$': {
			[Op.or]: [
				product.get('id'),
				{ [Op.is]: null }
			]
		},

		active: true,
		startsAt: { [Op.lte]: fn('NOW') },
		expiresAt: { [Op.gte]: fn('NOW') }
	}
}