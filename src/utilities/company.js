import moment from "moment";
import { literal } from "sequelize";

export const DELIVERY_TYPE_META = 'deliveryType';

export function defaultPlan() {
	// type perorder or permonth
	return { type: 'perorder', value: .07, ordersLimit: 0, exceeded: .15, valueType: 'pct' };
}

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

export function companyIsOpen(businessHours) {
	const now = moment();
	
	const weekDay = now.format('d');
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