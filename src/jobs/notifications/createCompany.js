import { where, literal } from 'sequelize';

import NotificationController from '../../controller/notification';
import Address from '../../model/address';
import Company from '../../model/company';
import User from '../../model/user';
import UserMeta from '../../model/userMeta';

export async function createCompany({ data: { companyId } }) {
	// check if company exits
	const company = await Company.findOne({
		where: { id: companyId },
		include: [Address]
	});
	if (!company) throw new Error('Empresa não encontrada');

	// company data
	const comanyData = {
		companyId: company.get('id'),
		companyName: company.get('displayName'),
		companyImage: company.get('image'),
		companyBackground: company.get('backgroundColor')
	}

	// find users
	const users = await User.findAll({
		include: [{
			required: true,
			model: Address,
			where: where(literal(`(SELECT COUNT(id) FROM delivery_areas WHERE companyId = '${companyId}' AND ST_Distance_Sphere(\`addresses\`.\`location\`, center) <= radius)`), '>', 0)
		}]
	})
	if (!users.length) throw new Error('Nenhum usuário para enviar notificaçãoes');

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
	}

	NotificationController.sendDevice(tokens, notificationData)
}