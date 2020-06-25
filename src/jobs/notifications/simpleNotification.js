import NotificationController from '../../controller/notification';

export async function simpleNotification({ data }) {
	const { deviceTokens, desktopTokens, message } = data;

	if (deviceTokens && deviceTokens) {
		NotificationController.sendDevice(deviceTokens, message)
	}

	if (desktopTokens) {
		NotificationController.sendDesktop(desktopTokens, message)
	}

	return true;
}
