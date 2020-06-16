import Mail from '../../controller/mail';

export async function mail ({ data: object }) {
	const { template, data, context } = object;

	// send email
	Mail.send(template, data, context);
}
