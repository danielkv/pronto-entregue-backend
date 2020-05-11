import Company from '../model/company';
import User from '../model/user';
import UserMeta from '../model/userMeta';
import * as notifications from '../services/notifications';
import { COMPANY_USERS_NEW_ORDER_NOTIFICATION } from "./keys";

export default {
	key: COMPANY_USERS_NEW_ORDER_NOTIFICATION,
	options: {},
	async handle ({ data: { companyId, orderId } }) {
		// get company users
		const tokenMetas = await UserMeta.findAll({
			where: { key: 'notification_tokens' },
			include: [
				{
					model: User,
					required: true,
					include: [{
						model: Company,
						where: { id: companyId },
						required: true
					}]
				}
			]
		});
		if (!tokenMetas.length) throw new Error('Nenhum token para enviar notificação');

		// reduce tokens
		const tokens = tokenMetas.reduce((allTokens, meta) =>{
			const tokens = JSON.parse(meta.value);
			
			return [...allTokens, ...tokens];
		}, []);

		//define body and title
		const notificationData = {
			title: 'Novo pedido!',
			body: `Chegou pedido (#${orderId})`,
		}

		// create messages
		const messages = notifications.createMessages(tokens, {
			...notificationData,
			priority: 'high',
			data: {
				redirect: {
					force: true,
					name: 'ProfileRoutes',
					params: {
						screen: 'OrdersRollScreen',
						params: { refetchOrders: true }
					}
				},
				alertData: notificationData
			}
		})

		
		notifications.send(messages);
	}
}