import fbAdmin from 'firebase-admin';
import _ from "lodash";
import path from 'path';
import { Op } from "sequelize";


import DB from '../model';
import UserMeta from "../model/userMeta";
import { NOTIFICATIONS_ENABLED } from '../utilities/config';
import { DESKTOP_TOKEN_META, DEVICE_TOKEN_META } from "../utilities/notifications";

const { Expo } = require('expo-server-sdk');

class NotificationControl {
	constructor() {
		fbAdmin.initializeApp({
			credential: fbAdmin.credential.cert(path.resolve(__dirname, '..', '..', 'fb-privatekey.json')),
			databaseURL: "https://pronto-entregue.firebaseio.com"
		});

		this.messaging = fbAdmin.messaging();

		this.expo = new Expo();
	}

	async isEnabled() {
		const enabledConfig =  await DB.config.findOne({ where: { key: NOTIFICATIONS_ENABLED } });

		if (enabledConfig.value === 'true')
			return true;

		return false
	}
	
	getMetaKey(type) {
		return type === 'desktop' ? DESKTOP_TOKEN_META : DEVICE_TOKEN_META;
	}
	
	async getUserTokens(userId, type) {
		const metaKey = this.getMetaKey(type);
		
		const meta = await UserMeta.findOne({ where: { userId, key: metaKey } })
		if (meta) return JSON.parse(meta.value);
		
		return [];
	}
	
	async addToken(userId, token, type) {
		const metaKey = this.getMetaKey(type);
		
		const meta = await UserMeta.findOne({ where: { key: metaKey, userId } })
		if (meta) {
			const tokens = JSON.parse(meta.value);
			
			//check if token exists
			if (tokens.includes(token)) return true;
			tokens.push(token);
			
			await meta.update({ value: JSON.stringify(tokens) });
		} else {
			await UserMeta.create({ userId, key: metaKey, value: JSON.stringify([token]) });
		}
		
		return true;
	}
	
	async removeToken(token, type) {
		const metaKey = this.getMetaKey(type);
		
		// check if meta exists
		const meta = await UserMeta.findOne({ where: { key: metaKey, value: { [Op.like]: `%${token}%` } } });
		if (!meta) return false;
		
		// parse tokens
		const tokens = JSON.parse(meta.value);
		const tokenIndex = tokens.findIndex(t => t === token);
		if (tokenIndex === -1) return false;
		
		// remove token
		tokens.splice(tokenIndex, 1);
		const newValue = JSON.stringify(tokens);
		// save tokens
		await meta.update({ value: newValue });
		
		return true;
	}
	
	async sendDesktop(to, { title, body, data }, options={}) {
		const enabled = await this.isEnabled();
		if (!enabled) {
			console.log('Notificações desativadas\n', `Não foram enviadas para ${Array.isArray(to) ? to.length : '1'} desktops`)
			return;
		}

		if (data) {
			Object.keys(data).map(key=>{
				const value = data[key];
				if (!_.isString(value)) data[key] = _.toString(value);
			})
		}

		const message = {
			data,
			notification: {
				title: title,
				body: body
			},
			webpush: {
				headers: {
					Urgency: 'high'
				},
				notification: {
					icon: 'https://www.prontoentregue.com.br/icon-bkp.png'
				}
			},
			...options
		}

		if (Array.isArray(to)) {
			if (!to.length) return;
			message.tokens = to;
			return fbAdmin.messaging().sendMulticast(message)
		} else {
			if (!to) return;
			message.token = to;
			return fbAdmin.messaging().send(message)
		}
	}

	createDeviceMessages(somePushTokens, data) {
		// Create the messages that you want to send to clents
		let messages = [];
		for (let pushToken of somePushTokens) {
			// Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
	
			// Check that all your push tokens appear to be valid Expo push tokens
			if (!Expo.isExpoPushToken(pushToken)) {
				throw new Error('Push token inválido');
			}
	
			messages.push({
				to: pushToken,
				priority: 'high',
				channelId: "Standard",
				sound: 'default',
				...data
			})
		}
	
		return messages;
	}
	
	async sendDevice(tokens, notificationData, options) {
		const enabled = await this.isEnabled();
		if (!enabled) {
			console.log('Notificações desativadas\n', `Não foram enviadas para ${tokens.length} dispositivos móveis`)
			return;
		}

		if (!tokens.length) return;

		const data = {
			...notificationData,
			priority: 'high',
			...options
		}
		const messages = this.createDeviceMessages(tokens, data);
		let chunks = this.expo.chunkPushNotifications(messages);
		let tickets = [];
	
		// Send the chunks to the Expo push notification service.
		for (let chunk of chunks) {
			let ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
			tickets.push(...ticketChunk);
		}
	}
	
	
}

const NotificationController = new NotificationControl();

export default NotificationController;