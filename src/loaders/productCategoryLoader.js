import DataLoader from "dataloader";

import DB from "../model";
import { remap } from "./remap";

export default new DataLoader(async keys => {
	const categories = await DB.category.findAll({
		where: { id: keys }
	});
	
	return remap(keys, categories)

}, { cache: false })