import Sequelize  from 'sequelize';

import { deliveryTimeLoader } from '../loaders';
import conn from '../services/connection';

/*
 * Define modelo (tabela) de relação entre produtos e filiais / empresas
 */

class CompanyMeta extends Sequelize.Model {
	/**
	 * Atualiza, Remove e Cria todas metas
	 * 
	 */

	static async updateAll(metas, modelInstance, transaction=null) {
		const metasCreate = metas.filter(row=>!row.id && row.action==='create');
		const metasUpdate = metas.filter(row=>row.id && row.action==='update');
		const metasRemove = metas.filter(row=>row.id && row.action==='delete');
		
		const [removed, created, updated] = await Promise.all([
			// removed
			CompanyMeta.destroy({ where: { id: metasRemove.map(r => r.id) }, transaction }).then(() => {
				metasRemove.forEach(r => deliveryTimeLoader.clear(r.id)) ;
				return metasRemove;
			}),
			// created
			Promise.all(metasCreate.map(row => modelInstance.createMeta(row, { transaction }))),
			// updated
			Promise.all(metasUpdate.map(row => modelInstance.getMetas({ where: { id: row.id } }).then(([meta]) => {
				if (!meta) throw new Error('Esse metadado não pertence a essa empresa');

				deliveryTimeLoader.clear(row.id);
				return meta.update(row, { fields: ['value'], transaction })
			})))
		]);

		return {
			removed,
			created,
			updated,
		};
	}
}
CompanyMeta.init({
	key: {
		type: Sequelize.STRING,
		comment: 'phone | email | document | businessHours | address | ...',
		set(val) {
			const uniqueTypes = ['document', 'businessHours', 'deliveryTime', 'color', 'background', 'logo', 'plan'];
			if (uniqueTypes.includes(val))
				this.setDataValue('unique', true);
			
			this.setDataValue('key', val);
		},
		validate: {
			async isUnique (value, done) {
				const meta = await CompanyMeta.findOne({ where: { companyId: this.getDataValue('companyId'), key: value } });
				const unique = this.getDataValue('unique');
				if (meta) {
					if (meta.unique === true) return done(new Error(`O metadado ${meta.key} já existe, você pode apenas altera-lo`));
					if (unique === true) return done(new Error('Esse metadado deve ser unico, já existem outros metadados desse tipo.'));
				}
				
				return done();
			}
		}
	},
	value: Sequelize.TEXT,
	type: Sequelize.STRING,
	unique: {
		type: Sequelize.BOOLEAN,
		defaultValue: 0,
	},
}, {
	modelName: 'companyMeta',
	tableName: 'company_metas',
	sequelize: conn,
	name: { singular: 'meta', plural: 'metas' }
});

export default CompanyMeta;