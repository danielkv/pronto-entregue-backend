import DataLoader from "dataloader";

import User from "../model/user";
import { remap } from "./remap";

export const userLoader = new DataLoader(async keys => {
	const users = await User.findAll({
		where: { id: keys }
	});
	
	return remap(keys, users)
}, { cache: false })