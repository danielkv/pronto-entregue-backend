import { QueryTypes } from "sequelize";

import connection from "../services/connection";

// pubsub vars
export const ORDER_CREATED = 'ORDER_CREATED';
export const ORDER_QTY_STATUS_UPDATED = 'ORDER_QTY_STATUS_UPDATED';
export const ORDER_STATUS_UPDATED = 'ORDER_STATUS_UPDATED';

export async function getOrderStatusQty (companyId) {
	const result = await connection.query(
		"SELECT status, Count(`order`.`id`) AS `count` FROM  `orders` AS `order` WHERE companyId = :companyId GROUP BY status",
		{
			replacements: { companyId },
			type: QueryTypes.SELECT
		});

	return { companyId, ...remapOrdersQty(result) };
}

function remapOrdersQty (orders) {
	const stats = ['waiting', 'preparing', 'delivering', 'delivered', 'canceled'];
	const qty = {};

	stats.forEach(stat => {
		const qtyStat = orders.find(row => row.status === stat);
		qty[stat] = qtyStat ? qtyStat.count : 0;
	})

	return qty;
}

export function getOrderStatusName(status) {
	// isIn: [['waiting', 'preparing', 'delivery', 'delivered', 'canceled']],
	switch(status) {
		case 'waiting':
			return 'Aguardando';
		case 'preparing':
			return 'Preparando';
		case 'delivering':
			return 'Na entrega';
		case 'delivered':
			return 'Entregue';
		case 'canceled':
			return 'Cancelado';
		default: return '';
	}
}