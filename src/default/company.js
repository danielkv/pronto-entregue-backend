export function deliveryHoursEnabled() {
	return false;
}

export function deliveryHours() {
	return [
		{
			dayOfWeek: 0, // Domingo
			hours: []
		},
		{
			dayOfWeek: 1, // Segunda-Feira
			hours: []
		},
		{
			dayOfWeek: 2, // Terça-Feira
			hours: []
		},
		{
			dayOfWeek: 3, // Quarta-Feira
			hours: []
		},
		{
			dayOfWeek: 4, // Quinta-Feira
			hours: []
		},
		{
			dayOfWeek: 5, // Sexta-Feira
			hours: []
		},
		{
			dayOfWeek: 6, // Sábado
			hours: []
		},
	]
}

export function plan() {
	// type perorder or permonth
	return { type: 'perorder', value: .07, ordersLimit: 0, exceeded: .15, valueType: 'pct' };
}

export function businessHours() {
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