import { literal, Op, fn } from "sequelize";

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