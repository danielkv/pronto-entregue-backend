import moment from "moment";
import { literal } from "sequelize";

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

export function isOpenAttribute(column='') {
	const now = moment();
	const weekDay = now.format('d');

	const objectDay = `JSON_EXTRACT(${column}, '$[${weekDay}]')`;

	const hour1 = `JSON_EXTRACT(${objectDay}, '$.hours[0]')`;
	const hour2 = `JSON_EXTRACT(${objectDay}, '$.hours[2]')`;

	const from1 = `TIME( JSON_UNQUOTE(JSON_EXTRACT(${hour1}, '$.from') ))`;
	const to1 = `TIME( JSON_UNQUOTE(JSON_EXTRACT(${hour1}, '$.to') ))`;

	const from2 = `TIME( JSON_UNQUOTE(JSON_EXTRACT(${hour2}, '$.from') ))`;
	const to2 = `TIME( JSON_UNQUOTE(JSON_EXTRACT(${hour2}, '$.to') ))`;

	const timeNow = 'TIME(now())';

	const isOpen = literal(`IF(IF(${hour1} IS NOT NULL, ${timeNow} BETWEEN ${from1} AND ${to1}, false) OR IF(${hour2} IS NOT NULL, ${timeNow} BETWEEN ${from2} AND ${to2}, false), true, false)`)

	return [isOpen, 'isOpen'];
}