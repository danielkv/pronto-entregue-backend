const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
const expo = new Expo();

export function createMessages(somePushTokens, data) {
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

/*
	
*/

export async function send(messages) {
	let chunks = expo.chunkPushNotifications(messages);
	let tickets = [];

	// Send the chunks to the Expo push notification service.
	for (let chunk of chunks) {
		let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
		tickets.push(...ticketChunk);
	}
}