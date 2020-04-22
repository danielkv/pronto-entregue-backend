import { literal, Op, fn } from "sequelize";

export function calculateProcuctFinalPrice(product, campaigns) {
	if (product.price === 0) return 0;

	const price = campaigns.reduce((finalPrice, campaign) => {
		const discount = campaign.valueType === 'value' ? campaign.value : campaign.value * (finalPrice / 100);
		return finalPrice - discount;
	}, product.price).toFixed(2);

	return (price < 0) ? 0 : price;
}

export function getSaleSelection() {
	return {
		attributes: {
			include: [[literal('IF(startsAt <= NOW() AND expiresAt >= NOW() AND active, true, false)'), 'progress']]
		},
		where: {
			[Op.or]: [{
				expiresAt: { [Op.gte]: fn('NOW') },
				startsAt: { [Op.lte]: fn('NOW') },
			}, {
				startsAt: { [Op.gt]: fn('NOW') },
			}],
			removed: false
		},
		order: [['startsAt', 'ASC'], ['createdAt', 'DESC']],
		limit: 1
	}
}