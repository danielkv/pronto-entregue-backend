import { authenticate, selectCompany, selectBranch } from './authentication';

export const createContext = async ({ req, connection }) => {
	let ctx = {};

	if (connection) {
		console.log(connection.context)
	} else {
		const { authorization, companyId, branchId } = req.headers;
		let user = null, company = null, branch = null;
		
		if (authorization) user = await authenticate(authorization);
		if (companyId) company = await selectCompany(companyId, user);
		if (branchId) branch = await selectBranch(company, user, branchId);
		
		ctx = {
			user,
			company,
			branch,
		}
	}

	return ctx;
}