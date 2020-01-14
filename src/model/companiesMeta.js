import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de relação entre produtos e filiais / empresas
 */

class CompaniesMeta extends Sequelize.Model {
	/**
	 * Atualiza, Remove e Cria todas metas
	 * 
	 */

	static async updateAll(metas, modelInstance, transaction=null) {
		const metasCreate = metas.filter(row=>!row.id && row.action==='create');
		const metasUpdate = metas.filter(row=>row.id && row.action==='update');
		const metasRemove = metas.filter(row=>row.id && row.action==='delete');
		
		const [removed, created, updated] = await Promise.all([
			CompaniesMeta.destroy({ where: { id: metasRemove.map(r => r.id) }, transaction }).then(() => metasRemove),
			Promise.all(metasCreate.map(row => modelInstance.createMeta(row, { transaction }))),
			Promise.all(metasUpdate.map(row => modelInstance.getMetas({ where: { id: row.id } }).then(([meta]) => {if (!meta) throw new Error('Esse metadado não pertence a essa empresa'); return meta.update(row, { fields: ['value'], transaction })})))
		]);

		return {
			removed,
			created,
			updated,
		};
	}
}
CompaniesMeta.init({
	key: {
		type: Sequelize.STRING,
		comment: 'phone | email | document | business_hours | address | ...',
		set(val) {
			const uniqueTypes = ['document', 'business_hours'];
			if (uniqueTypes.includes(val))
				this.setDataValue('unique', true);
			
			this.setDataValue('key', val);
		},
		validate: {
			async isUnique (value, done) {
				const meta = await CompaniesMeta.findOne({ where: { companyId: this.getDataValue('companyId'), key: value } });
				const unique = this.getDataValue('unique');
				if (meta) {
					if (meta.unique === true) return done(new Error('Esse metadado já existe, você pode apenas altera-lo'));
					if (unique === true) return done(new Error('Esse metadado deve ser unico, já existem outros metadados desse tipo.'));
				}
				
				return done();
			}
		}
	},
	value: Sequelize.TEXT,
	unique: {
		type: Sequelize.BOOLEAN,
		defaultValue: 0,
	},
}, { tableName: 'company_metas',  sequelize: conn, name: { singular: 'meta', plural: 'metas' } });

export default CompaniesMeta;