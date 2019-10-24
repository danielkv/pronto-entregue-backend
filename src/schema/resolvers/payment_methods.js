const PaymentMethods = require('../model/payment_methods');

/**
 * Vincula método de pagamento
 */

function bind (req, res, next) {
	const {branch} = req;
	const {payment_method_id, settings} = req.body;
	
	PaymentMethods.findByPk(payment_method_id)
	.then((payment_method)=>{
		if (!payment_method) throw new Error('Método de pagamento não encontrado');

		return branch.addPaymentMethods(payment_method, {through:{settings}});
	})
	.then((result)=>{
		res.send(result);
	})
	.catch(next);
}

/**
 * Retorna métodos de pagamento vinculados à filial
 */

function read (req, res, next) {
	const {branch} = req;
	
	branch.getPaymentMethods()
	.then((result)=>{
		res.send(result);
	})
	.catch(next);
}

/**
 * Atualiza/altera Método de pagamento
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

function update (req, res, next) {
	const {branch} = req;
	const {payment_method_id} = req.params;
	const payment_method_data = req.body;

	branch.getPaymentMethods({where:{id:payment_method_id}})
	.then(([payment_method]) => {
		if (!payment_method) throw new Error('Método de pagamento não encontrado');

		return payment_method.branches_payment_methods.update(payment_method_data, {fields:['settings']});
	})
	.then((updated)=>{
		return res.send(updated);
	})
	.catch(next);
}

/**
 * Desvincula método de pagamento da filial
 * 
 */

function remove (req, res, next) {
	const {branch} = req;
	const {payment_method_id} = req.params;

	branch.getPaymentMethods({where:{id:payment_method_id}})
	.then(([payment_method]) => {
		if (!payment_method) throw new Error('Método de pagamento não encontrado');

		return branch.removePaymentMethod(payment_method);
	})
	.then((removed)=>{
		return res.send({message:'Método de pagamento desvinculado'});
	})
	.catch(next);
}

module.exports = {
	//default
	bind,
	read,
	update,
	remove,
}