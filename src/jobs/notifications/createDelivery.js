import { where, literal } from 'sequelize';

import Address from '../../model/address';
import Company from '../../model/company';
import User from '../../model/user';
import UserMeta from '../../model/userMeta';
import * as notifications from '../../services/notifications';

export async function createDelivery ({ data: { companyId } }) {
	// check if company exits
		
	//GET USERS in area

	// find tokens
	const pushTokenMetas = await UserMeta.findAll({
		where: { key: 'notification_tokens', userId: users.map(user => user.get('id')) }
	})
	if (!pushTokenMetas.length) throw new Error('Tokens não encontrados');
		
	// parse tokens to 1 array
	const tokens = pushTokenMetas.reduce((allTokens, meta) =>{
		const tokens = JSON.parse(meta.value);
			
		return [...allTokens, ...tokens];
	}, []);
		
	// define message
	const notificationData = {
		title: `${comanyData.companyName} já chegou no App 👏👏`,
		body: 'Aproveita e dá uma olhada no cardápio',
	}

	// create messages object
	const messages = notifications.createMessages(tokens, {
		...notificationData,
		priority: 'high',
		data: {
			redirect: {
				name: 'HomeRoutes',
				params: {
					screen: 'CompanyScreen',
					params: comanyData
				}
			},
			alertData: notificationData
		}
	})
		
	// send messages
	notifications.send(messages);
}