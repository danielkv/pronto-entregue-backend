import { authenticate, selectCompany } from './authentication';

export const createContext = async ({ req, connection }) => {
	if (connection) {
		// subscriptions
	} else {
		const { authorization, companyid: companyId, selectedaddress, adminconnection } = req.headers;

		const admOrigin = adminconnection === 'true';

		let user = null, company = null, address = null;
		
		if (authorization) user = await authenticate(authorization);
		if (companyId) company = await selectCompany(companyId, user);
		if (selectedaddress) address = JSON.parse(selectedaddress);

		return {
			user,
			company,
			address,
			admOrigin
		}
	}
}