import { authenticate, selectCompany } from './authentication';

export const createContext = async ({ req, connection }) => {
	let ctx = {};

	if (connection) {
		console.log(connection.context)
	} else {
		const { authorization, companyId } = req.headers;
		let user = null, company = null;
		
		if (authorization) user = await authenticate(authorization);
		if (companyId) company = await selectCompany(companyId, user);
		
		ctx = {
			user,
			company,
		}
	}

	return ctx;
}