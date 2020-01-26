import { Op, fn } from 'sequelize';

export function campaignProductWhere(product) {
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

export function calculateProcuctPromotionalPrice(product, campaigns) {
	if (product.price === 0) return 0;

	const price = campaigns.reduce((finalPrice, campaign) => {
		const discount = campaign.valueType === 'value' ? campaign.value : campaign.value * (finalPrice / 100);
		return finalPrice - discount;
	}, product.price).toFixed(2);

	return (price < 0) ? 0 : price;
}