import { authenticate, selectCompany, selectBranch } from './authentication';

export const createContext = async ({ req, connection }) => {
	let ctx = {};

	if (connection) {
		console.log(connection.context)
	} else {
		const { authorization, company_id, branch_id } = req.headers;
		let user = null, company = null, branch = null;
		
		if (authorization) user = await authenticate(authorization);
		if (company_id) company = await selectCompany(company_id, user);
		if (branch_id) branch = await selectBranch(company, user, branch_id);
		
		ctx = {
			user,
			company,
			branch,
		}
	}

	return ctx;
}