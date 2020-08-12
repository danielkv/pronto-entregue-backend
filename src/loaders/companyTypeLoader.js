import DataLoader from "dataloader";

import DB from "../model";
import { remap } from "./remap";

export default new DataLoader(async keys => {
	const types = await DB.companyType.findAll({
		where: { id: keys }
	});
	
	return remap(keys, types)

}, { cache: false })