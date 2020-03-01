import { authenticate, selectCompany } from './authentication';

export const createContext = async ({ req, connection }) => {
	if (connection) {
		console.log(connection.context)
	} else {
		const { authorization, companyid: companyId, selectedaddress } = req.headers;
		let user = null, company = null, address = null;
		
		if (authorization) user = await authenticate(authorization);
		if (companyId) company = await selectCompany(companyId, user);
		if (selectedaddress) address = JSON.parse(selectedaddress);

		return {
			user,
			company,
			address
		}
	}
}