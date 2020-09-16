import { toString } from 'lodash';

import CompanyController from '../../controller/company';
import NotificationController from '../../controller/notification';
import Delivery from '../../model/delivery';
import Order from '../../model/order';
import User from '../../model/user';
import pubSub, { instanceToData } from '../../services/pubsub';
import { RedirectService } from '../../services/redirect.service';
import {
    DESKTOP_TOKEN_META,
    DEVICE_TOKEN_META,
    ORDER_UPDATED,
} from '../../utilities/notifications';

export async function setDeliveryMan({ data: { deliveryId, deliveryManId } }) {
    // check if delivery exists
    const delivery = await Delivery.findByPk(deliveryId);
    if (!delivery) throw new Error('Pedido não encontrado');

    // check if user exists
    const user = await User.findByPk(deliveryManId);
    if (!user) throw new Error('Usuário não encontrado');

    // if is delivery from order
    const orderId = delivery.get('orderId');

    if (orderId) {
        // checks if order exists
        const order = await Order.findByPk(orderId);
        if (!order) throw new Error('Pedido não encontrado');

        // get companyId
        const companyId = order.get('companyId');

        // send notification to subscribed clients
        pubSub.publish(ORDER_UPDATED, {
            orderUpdated: instanceToData(order),
            companyId,
        });

        // generate data
        const notificationData = {
            title: 'Um entregador aceitou um pedido',
            body: `O entregador ${user.get(
                'firstName',
            )} irá retirar o pedido #${orderId} em instantes`,
            data: {
                orderId: toString(orderId),
                deliveryManId: toString(deliveryManId),
                deliveryId: toString(deliveryId),
            },
        };

        // get desktop tokens
        const desktopTokens = await CompanyController.getUserTokens(
            companyId,
            DESKTOP_TOKEN_META,
        );
        NotificationController.sendDesktop(desktopTokens, notificationData);

        // get device tokens
        const deviceTokens = await CompanyController.getUserTokens(
            companyId,
            DEVICE_TOKEN_META,
        );

        NotificationController.sendDevice(deviceTokens, {
            ...notificationData,
            data: {
                ...notificationData.data,
                redirect: new RedirectService('companyOrders', {
                    refetchOrders: true,
                }),
                alertData: notificationData,
            },
        });
    }

    return true;
}
