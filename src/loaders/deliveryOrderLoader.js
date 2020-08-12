import DataLoader from "dataloader";

import DB from "../model";
import { remap } from "./remap";

export default new DataLoader(async keys => {

	const orders = await DB.order.findAll({
		where: { id: keys }
	});

	return remap(keys, orders);
}, { cache: false })