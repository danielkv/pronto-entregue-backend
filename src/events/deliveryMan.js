import DeliveryManController from '../controller/deliveryMan';
import UserController from '../controller/user';
import JobQueue from '../factory/queue';
import { DEVICE_TOKEN_META, DESKTOP_TOKEN_META } from '../utilities/notifications';

export default new class DeliveryManEvents {
	start () {
		/**
		 * checks if there is still some delivery man enabled after each delivery man disable
		 */
		DeliveryManController.on('disable', async () => {
			// get enabled delivery men
			const enabledDeliveryMan = await DeliveryManController.getEnabled();

			// if there are enabled delivey men, does nothing
			if (enabledDeliveryMan.length) return;

			// get tokens
			const deviceTokens = await UserController.getTokensByRole('master', DEVICE_TOKEN_META);
			const desktopTokens = await UserController.getTokensByRole('master', DESKTOP_TOKEN_META);

			// create message
			const message = {
				title: 'Atenção',
				body: 'Não há nenhum entregador ativo. Verifique se há entregas aguardando',
				data: {
					variant: 'error'
				}
			}

			// queue notification
			JobQueue.notifications.add('simpleNotification', { desktopTokens, deviceTokens, message })
		})


		console.log(' - Setup DeliveryMan events')
	}
}