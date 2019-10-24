//const DeliveryAreas = require('../model/delivery_areas');
//const sequelize = require('../services/connection');

/**
 * Cria local de entrega a partir de filial
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

function create (req, res, next) {
	const {branch} = req;
	const delivery_area_data = req.body;

	branch.createDeliveryArea(delivery_area_data)
	.then((created_delivery_area)=>{
		return res.send(created_delivery_area);
	})
	.catch(next);
}

/**
 * Retorna locais de entrega vinculados à filial
 */

function read (req, res, next) {
	const {branch} = req;
	
	branch.getDeliveryAreas()
	.then((result)=>{
		res.send(result);
	})
	.catch(next);
}

/**
 * Atualiza/altera local de entrega
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

function update (req, res, next) {
	const {branch} = req;
	const {delivery_area_id} = req.params;
	const delivery_area_data = req.body;

	branch.getDeliveryAreas({where:{id:delivery_area_id}})
	.then(([delivery_area]) => {
		if (!delivery_area) throw new Error('Local de entrega não encontrado');

		return delivery_area.update(delivery_area_data, {fields:['name', 'zipcodes', 'price']});
	})
	.then((updated)=>{
		return res.send(updated);
	})
	.catch(next);
}

/**
 * Remove local de entrega
 * => remove o registro do banco de dados
 * 
 */

function remove (req, res, next) {
	const {branch} = req;
	const {delivery_area_id} = req.params;

	branch.getDeliveryAreas({where:{id:delivery_area_id}})
	.then(([delivery_area]) => {
		if (!delivery_area) throw new Error('Local de entrega não encontrado');

		return delivery_area.destroy();
	})
	.then((updated)=>{
		return res.send(updated);
	})
	.catch(next);
}

module.exports = {
	//default
	create,
	read,
	update,
	remove,
}