import moment from 'moment';

import CompanyController from '../../controller/company';
import { ORDER_CREATED } from '../../controller/order';
import UserController from '../../controller/user';
import ConfigEntity from '../../entities/Config';
import JobQueue from '../../factory/queue';
import pubSub, { instanceToData } from '../../services/pubsub';
import { RedirectService } from '../../services/redirect.service';
import { TIME_BEFORE_SCHEDULED_ORDER_NOTIFICATION } from '../../utilities/config';
import {
    DEVICE_TOKEN_META,
    DESKTOP_TOKEN_META,
} from '../../utilities/notifications';

const configEntity = new ConfigEntity();

/**
 * Queue notifications for scheduled orders
 *
 * @param {Object} param
 */
export default async function createScheduledOrder({ order, company }) {
    const orderId = order.get('id');
    const companyId = company.get('id');
    const createdAt = order.get('createdAt');
    const scheduledTo = order.get('scheduledTo');
    const userId = order.get('userId');

    // publish pubsub
    pubSub.publish(ORDER_CREATED, {
        orderCreated: instanceToData(order),
        companyId,
    });

    const userTokens = await UserController.getTokensById(
        [userId],
        DEVICE_TOKEN_META,
    );
    const companyDeviceTokens = await CompanyController.getUserTokens(
        companyId,
        DEVICE_TOKEN_META,
    );
    const companyDesktopTokens = await CompanyController.getUserTokens(
        companyId,
        DESKTOP_TOKEN_META,
    );

    // queue notification to ADM NOW
    const companyCreatedOrderMessage = {
        title: `${company.get(
            'displayName',
        )} recebeu um novo pedido encomendado`,
        body: `O pedido #${orderId} foi agendado para ${moment(
            scheduledTo,
        ).calendar()}.`,
    };

    JobQueue.notifications.add(
        `simpleNotification.scheduledOrder.company.${orderId}`,
        {
            deviceTokens: companyDeviceTokens,
            desktopTokens: companyDesktopTokens,
            message: {
                ...companyCreatedOrderMessage,
                data: {
                    ...companyCreatedOrderMessage,
                    redirect: new RedirectService('companyOrders', {
                        refetchOrders: true,
                    }),
                    alertData: companyCreatedOrderMessage,
                },
            },
        },
    );

    // queue notification to USER NOW
    const userCreatedOrderMessage = {
        title: `${company.get('displayName')} recebeu seu pedido`,
        body: `O pedido #${orderId} foi agendado para ${moment(
            scheduledTo,
        ).calendar()}.`,
    };

    JobQueue.notifications.add(
        `simpleNotification.scheduledOrder.user.${orderId}`,
        {
            deviceTokens: userTokens,
            message: {
                ...userCreatedOrderMessage,
                data: {
                    ...userCreatedOrderMessage,
                    redirect: new RedirectService('order', {
                        orderId,
                    }),
                    alertData: userCreatedOrderMessage,
                },
            },
        },
    );

    // queue notif

    // jobIds
    const userJobId = `scheduledOrder.user.${orderId}`;
    const companyJobId = `scheduledOrder.company.${orderId}`;

    // calculate jo delay
    const timeBefore = await configEntity.get(
        TIME_BEFORE_SCHEDULED_ORDER_NOTIFICATION,
    );
    const jobDelay = moment(scheduledTo)
        .subtract(timeBefore, 'minutes')
        .diff(moment(), 'milliseconds');

    // do not queue notifications in this case
    if (jobDelay < 0) return;

    const userNotificationMessage = {
        title: `Você tem um pedido agendado de ${company.get('displayName')}`,
        body: `O pedido #${orderId} foi agendado para ${moment(
            scheduledTo,
        ).calendar(
            moment(timeBefore),
        )}. Fique no aguardo das notificações pra saber quando ele estiver a caminho 🤩`,
    };

    const userMessage = {
        ...userNotificationMessage,
        data: {
            ...userNotificationMessage,
            redirect: new RedirectService('order', {
                orderId,
            }),
            alertData: userNotificationMessage,
        },
    };

    // queue user notification
    JobQueue.notifications.add(
        `simpleNotification.scheduled.${orderId}`,
        { deviceTokens: userTokens, message: userMessage },
        { delay: jobDelay, jobId: userJobId },
    );

    const companyNotificationMessage = {
        title: 'Você tem um pedido agendado para alguns instantes',
        body: `O pedido #${orderId} foi agendado ${moment(createdAt).calendar(
            moment(timeBefore),
        )}. Enviamos essa notifição apenas pra você lembrar do pedido 😊`,
    };

    const companyMessage = {
        ...companyNotificationMessage,
        data: {
            ...companyNotificationMessage,
            alertData: companyNotificationMessage,
        },
    };

    // queue company notifications
    JobQueue.notifications.add(
        `simpleNotification.scheduled.${orderId}`,
        {
            deviceTokens: companyDeviceTokens,
            desktopTokens: companyDesktopTokens,
            message: companyMessage,
        },
        { delay: jobDelay, jobId: companyJobId },
    );
}
