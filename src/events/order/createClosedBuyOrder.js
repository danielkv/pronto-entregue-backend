import _ from 'lodash';
import moment from 'moment';
import Sequelize from 'sequelize';

import CompanyController from '../../controller/company';
import { ORDER_CREATED } from '../../controller/order';
import UserController from '../../controller/user';
import JobQueue from '../../factory/queue';
import DB from '../../model';
import pubSub, { instanceToData } from '../../services/pubsub';
import { RedirectService } from '../../services/redirect.service';
import {
    DEVICE_TOKEN_META,
    DESKTOP_TOKEN_META,
} from '../../utilities/notifications';

export default async function createClosedBuyOrder({ order, company }) {
    const orderId = order.get('id');
    const userId = order.get('userId');
    const companyId = company.get('id');

    // publish pubsub
    pubSub.publish(ORDER_CREATED, {
        orderCreated: instanceToData(order),
        companyId,
    });

    //get tokens
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

    // setup company data and config
    const notificationCompanyData = {
        title: 'Novo pedido em reserva em!',
        body: `Chegou pedido (#${orderId}) em ${company.get('displayName')}`,
        data: {
            action: 'orderCreated',
            variant: 'warning',
            orderId: _.toString(orderId),
            companyId: _.toString(companyId),
        },
    };

    // queue comany notifications for now
    JobQueue.notifications.add(
        `simpleNotification.orderBuyClosed.${orderId}.company`,
        {
            deviceTokens: companyDeviceTokens,
            desktopTokens: companyDesktopTokens,
            message: {
                ...notificationCompanyData,
                priority: 'high',
                data: {
                    ...notificationCompanyData.data,
                    redirect: new RedirectService('companyOrders', {
                        refetchOrders: true,
                    }),
                    alertData: notificationCompanyData,
                },
            },
        },
    );

    // MESSAGE BEFORE OPEN
    const { nextOpen } = await DB.companyMeta.findOne({
        attributes: [
            [
                Sequelize.fn(
                    'COMPANY_NEXT_OPEN_DATE',
                    Sequelize.col('metas.value'),
                    Sequelize.fn('NOW'),
                ),
                'nextOpen',
            ],
        ],
        where: { key: 'businessHours', companyId },
    });
    if (!nextOpen) return;

    const jobDelay = moment(nextOpen)
        .subtract(15, 'minutes')
        .diff(moment(), 'milliseconds');
    if (jobDelay < 0) return;

    // setup user data and config
    const delayedNotificationUserData = {
        title: `Você tem um pedido reservado em ${company.get('displayName')}`,
        body: `Não precisa fazer nada, só precisa esperar seu pedido 😄. Iremos te avisa quando estiver a caminho.`,
    };

    // queue comany notifications for now
    JobQueue.notifications.add(
        `simpleNotification.orderBuyClosed.${orderId}.company`,
        {
            deviceTokens: userTokens,
            message: {
                ...delayedNotificationUserData,
                priority: 'high',
                data: {
                    ...delayedNotificationUserData.data,
                    redirect: new RedirectService('order', { orderId }),
                    alertData: delayedNotificationUserData,
                },
            },
        },
        { delay: jobDelay },
    );

    // notification reminder to company

    const jobId = `orderBuyClosed.reminder.${companyId}`;

    const delayedNotificationCompanyData = {
        title: `Há pedidos reservados em ${company.get('displayName')}`,
        body: `Este é apenas um lembrete, seu estabelecimento abre ${moment(
            nextOpen,
        ).calendar()} e seus clientes já estarão esperando esses pedidos.`,
        data: {
            action: 'orderCreated',
            variant: 'warning',
            orderId: _.toString(orderId),
            companyId: _.toString(companyId),
        },
    };

    // queue comany notifications for now
    JobQueue.notifications.add(
        `simpleNotification.orderBuyClosed.${orderId}.company`,
        {
            deviceTokens: companyDeviceTokens,
            desktopTokens: companyDesktopTokens,
            message: {
                ...delayedNotificationCompanyData,
                priority: 'high',
                data: {
                    ...delayedNotificationCompanyData.data,
                    redirect: new RedirectService('companyOrders', {
                        refetchOrders: true,
                    }),
                    alertData: delayedNotificationCompanyData,
                },
            },
        },
        { delay: jobDelay, jobId },
    );
}
