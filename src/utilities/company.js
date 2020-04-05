import moment from "moment";

export function defaultBusinessHours() {
	return [
		{
			dayOfWeek: 'Domingo',
			hours: [{ from: '', to: '' }]
		},
		{
			dayOfWeek: 'Segunda-Feira',
			hours: [{ from: '', to: '' }]
		},
		{
			dayOfWeek: 'Terça-Feira',
			hours: [{ from: '', to: '' }]
		},
		{
			dayOfWeek: 'Quarta-Feira',
			hours: [{ from: '', to: '' }]
		},
		{
			dayOfWeek: 'Quinta-Feira',
			hours: [{ from: '', to: '' }]
		},
		{
			dayOfWeek: 'Sexta-Feira',
			hours: [{ from: '', to: '' }]
		},
		{
			dayOfWeek: 'Sábado',
			hours: [{ from: '', to: '' }]
		},
	]
}

export async function companyIsOpen(companyModel) {
	let businessHours = await companyModel.getMetas({ where: { key: 'businessHours' } })
		.then(([meta])=>{
			if (!meta) return defaultBusinessHours();
			return JSON.parse(meta.value);
		});

	const now = moment();
	const weekDay = 1 //now.format('d');
	const dayHours = businessHours[weekDay];

	return dayHours.hours.some(h => {
		if (!h.from || !h.to) return false;

		const splitedFrom = h.from.split(':').map(h=>parseInt(h));
		const splitedTo = h.to.split(':').map(h=>parseInt(h));

		const from = moment({ hour: splitedFrom[0], minute: splitedFrom[1] });
		const to = moment({ hour: splitedTo[0], minute: splitedTo[1] });

		return now.isBetween(from, to, ['hour', 'minute']);
	})
}