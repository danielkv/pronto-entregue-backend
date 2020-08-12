import DataLoader from "dataloader";

import DB from "../model";
import { remap } from "./remap";

export default new DataLoader(async keys => {
	const configs = await DB.config.findAll({
		where: { key: keys }
	});

	return remap(keys, configs, 'key');
}, { cache: false })