import { authenticate, selectCompany } from './authentication';

export const createContext = async ({ req, connection }) => {
	if (connection) {
		console.log(connection.context)
	} else {
		const { authorization, companyid: companyId, selectAddress } = req.headers;
		let user = null, company = null, address = null;
		
		if (authorization) user = await authenticate(authorization);
		if (companyId) company = await selectCompany(companyId, user);
		if (selectAddress) address = selectAddress;

		return {
			user,
			company,
			address
		}
	}
}