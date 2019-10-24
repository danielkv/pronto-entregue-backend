
/**
 * Grupo de opções a partir de produto e filial
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

function create (req, res, next) {
	const {company} = req;
	const group_data = req.body;	

	company.createOptionsGroup(group_data)
	.then((created)=>{
		return res.send(created);
	})
	.catch(next);
}

/**
 * Retorna grupos de opções vinculados a empresa
 * 
 * @query only_active {boolean} filtra apenas ativos. Default: true
 */

function read (req, res, next) {
	const {company} = req;

	const only_active = req.query.only_active === false || req.query.only_active === 'false' ? req.query.only_active : true;
	
	company.getOptionsGroups({where:{active:only_active}})
	.then((result)=>{
		res.send(result);
	})
	.catch(next);
}

/**
 * Atualiza/altera grupo de opções
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

function update (req, res, next) {
	const {company} = req;
	const {group_id} = req.params;
	const group_data = req.body;

	company.getOptionsGroups({where:{id:group_id}})
	.then(([group]) => {
		if (!group) throw new Error('Grupo de opções não encontrado');

		return group.update(group_data, {fields:['name', 'active']});
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
}