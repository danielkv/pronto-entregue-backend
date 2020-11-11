import { gql } from 'apollo-server';
import moment from 'moment';
import Picpay from 'picpay';
import OrderController from '../controller/order';

import AppRouter from '../factory/router';
import DB from '../model';

export const typeDefs = gql`
    input PicPayPaymentInput {
		value: Float!
		orderId: ID!
		returnUrl: String!
	}

	type PicPayPaymentStatus {
		authorizationId: String!
		referenceId: String!
		status: String!
	}
   
    type PicPayPayment {
		referenceId: String!
		paymentUrl: String!
	}

	extend type Mutation {
		requestPicPayPayment(companyId: ID!, userId: ID!, payment: PicPayPaymentInput!): PicPayPayment!

		checkPicPayPayment(orderId: ID!): PicPayPaymentStatus!
	}
`;

const initialStringId = 'ProntoEntregue';
const callbackUrl = '/paymentReturn/picpay';

export const resolvers = {
    Query: {
        
    },
    Mutation: {
		async requestPicPayPayment(_, { companyId, userId, payment }) {
			const order = await DB.order.findByPk(payment.orderId);
			if (!order) throw new Error('Pedido não encontrado')
			if (order.get('status') !== 'paymentPending') throw new Error('Esse pedido já foi pago');

			const user = await DB.user.findByPk(userId);
			if (!user) throw new Error('Usuário não encontrado');

			const userMetas = await user.getMetas({ where: { key: ['phone', 'document'] } });

			const companyPaymentMethod = await DB.companyPaymentMethod.findOne({ where: { companyId, paymentMethodId: order.paymentMethodId } });
			const settings = companyPaymentMethod.get('settings');

			const referenceIdInit = `${initialStringId}:${payment.orderId}`;
			let referenceId = '';

			const picpay = new Picpay(settings.picpayToken, settings.sellerToken);

			// check if referenceId exists
			let exists = true;
			let n = 1;
			do {
				referenceId = `${referenceIdInit}:${n}`;
				const { status: checkStatus } = await picpay.payment.status(referenceId);
				if (checkStatus === 422) exists = false;
				else n++;
			} while (exists);


			// define data
			const sendData = {
				referenceId,
				expiresAt: moment().add(15, 'minute').format(),
				returnUrl: payment.returnUrl,
				callbackUrl: `https://api.prontoentregue.com.br${callbackUrl}`,
				value: payment.value,
			}

			const buyer = {
				firstName: user.get('firstName'),
				lastName: user.get('lastName'),
				email: user.get('email'),
				document: userMetas.find(metas => metas.key === 'document').value,
				phone: userMetas.find(metas => metas.key === 'phone').value,
			}
			
			

			// create new payment
			const { status, data } = await picpay.payment.send(sendData, buyer);

			if (status === 200) return data;

			// erro na validação de dados
			if (status === 422) {
				const message = data.errors[0].message;
				throw new Error(message)
			}

			throw new Error('Ocorreu um erro ao requisitar pagamento')
			
		},
		async checkPicPayPayment(_, { orderId }) {
			const order = await DB.order.findByPk(orderId);
			if (!order) throw new Error('Pedido não encontrado')
			
			const companyPaymentMethod = await DB.companyPaymentMethod.findOne({ where: { companyId: order.companyId, paymentMethodId: order.paymentMethodId } });
			const settings = companyPaymentMethod.get('settings');

			const referenceId = `${initialStringId}:${orderId}`;

			const picpay = new Picpay(settings.picpayToken, settings.sellerToken);

			const { status, data } = await picpay.payment.status(referenceId);

			if (status !== 200) throw data;
				
			//paid status
			const completeStatus = ['paid', 'completed', 'chargeback'];
			if (completeStatus.includes(data.status)) await order.update({ status: 'waiting' });

			return data;
		}
    },
};

export async function checkPicPayPayment({ referenceId }) {
	const [name, orderId] = referenceId.split(":");
	if (name !== initialStringId) throw new Error('ID do pagamento inválido');

	const order = await DB.order.findByPk(orderId);
	if (!order) throw new Error('Pedido não encontrado');

	const companyPaymentMethod = await DB.companyPaymentMethod.findOne({ where: { companyId: order.companyId, paymentMethodId: order.paymentMethodId } });
	const settings = companyPaymentMethod.get('settings');

	const picpay = new Picpay(settings.picpayToken, settings.sellerToken);

	const { status, data } = await picpay.payment.status(referenceId);

	if (status !== 200) throw data;
		
	// paid status
	const completeStatus = ['paid', 'completed', 'chargeback'];
	const isPaid = completeStatus.includes(data.status);

	// change order status
	if (isPaid) await OrderController.changeStatus(order, 'waiting')

	return isPaid;
}

AppRouter.add('picpay', (router) => {
	router.post(callbackUrl, async (req, res) => {
		try {
			const { referenceId, authorizationId } = req.body;

			const isPaid = await checkPicPayPayment({ referenceId, authorizationId });
			if(!isPaid) return res.send('Não foi pago')

			res.send('Pago')
		} catch (err) {
			res.status(404).send(err.message)
		}
	})
})
