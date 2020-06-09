import DataLoader from 'dataloader';

import Product from '../model/product';

export const categoryProductsLoader = new DataLoader(async keys => {
	const allProducts = await Product.findAll({
		where: { categoryId: keys, active: true },
		order: [['categoryId', 'ASC'], ['name', 'ASC']]
	});
	
	return keys.map(key => {
		const categoryProducts = allProducts.filter(m => m.categoryId === key)
		return categoryProducts;
	})
}, { cache: false })