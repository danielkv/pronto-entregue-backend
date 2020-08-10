import DataLoader from "dataloader";

import DB from "../model";

export default new DataLoader(async values => {
	const userIds = values.map(k => k.userId);
	const keys = values.map(k => k.key);
	const metas = await DB.userMeta.findAll({
		where: { key: keys, userId: userIds }
	});

	return values.map(v => {
		const config = metas.find(c => c.userId == v.userId && c.key == v.key);
		if (config) return config;

		return null;
	});
}, { cache: false })