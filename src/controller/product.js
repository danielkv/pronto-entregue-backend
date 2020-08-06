import { EventEmitter } from 'events'

import DB from "../model";
import { upload } from "./uploads";

class ProductController extends EventEmitter {

	/**
	 * Create product in DataBase
	 * @param {Object} data 
	 * @param {Object} options 
	 * @param {Object} ctx 
	 */
	async create(data, options, ctx) {
		// check if selected category exists
		const category = await DB.category.findByPk(data.categoryId)
		if (!category) throw new Error('Categoria não encontrada');

		if (data.file) data.image = await upload(ctx.company.name, await data.file);

		// create product
		const product = await DB.product.cache().create({ ...data, companyId: ctx.company.get('id') }, options)

		// create options groups
		if (data.optionsGroups) await DB.optionsGroup.updateAll(data.optionsGroups, product, options.transaction);

		// sales
		if (data.sale) await product.createSale(data.sale, options);

		// emit event
		this.emit('create', { product, ctx, options })

		return product
	}

	/**
	 * Update product in database
	 * @param {ProductInstance} product 
	 * @param {Object} data 
	 * @param {Object} options 
	 * @param {Object} ctx 
	 */
	async update(product, data, options, ctx) {
		// product image
		if (data.file) data.image = await upload(ctx.company.name, await data.file);

		// update product
		const productUpdated = await product.cache().update(data, options);

		// create, update, remove options groups
		if (data.optionsGroups) await DB.optionsGroup.updateAll(data.optionsGroups, productUpdated, options.transaction);

		// sales
		if (data.sale) await productUpdated.createSale(data.sale, options);

		// emit event
		this.emit('update', { product: productUpdated, ctx, options })

		return productUpdated
	}
}

export default new ProductController();