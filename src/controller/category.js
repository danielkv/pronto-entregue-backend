import DataLoader from "dataloader";

import DB from "../model";

class CategoryController  {
	constructor() {
		this.productsLoader = new DataLoader(async (keys)=>{
			const allProducts = DB.product.findAll({
				where: { categoryId: keys, active: true },
				order: [['categoryId', 'ASC']]
			});

			return keys.map(key => {
				return allProducts.filter(product => product.categoryId === key)
			})

		}, { cache: false })
	}
}

export default new CategoryController();