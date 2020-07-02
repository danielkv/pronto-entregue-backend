class NotificationSoundsControl {
	availableSounds () {
		const sounds = [
			{
				name: 'Padrão',
				slug: 'default',
				url: 'https://storage.googleapis.com/assets-pronto-entregue/sounds/notification.ogg'
			},
			{
				name: 'Air Horn',
				slug: 'air-horn',
				url: 'https://storage.googleapis.com/assets-pronto-entregue/sounds/Air%20Horn-SoundBible.com-964603082.mp3'
			},
			{
				name: 'Woop Woop',
				slug: 'woop-woop',
				url: 'https://storage.googleapis.com/assets-pronto-entregue/sounds/Woop%20Woop-SoundBible.com-198943467.mp3'
			},
			{
				name: 'Cartoon Telephone',
				slug: 'cartoon-telephone',
				url: 'https://storage.googleapis.com/assets-pronto-entregue/sounds/cartoon-telephone_daniel_simion.mp3'
			},
			{
				name: 'Fire Truck Air Horn',
				slug: 'fire-truck-air-horn',
				url: 'https://storage.googleapis.com/assets-pronto-entregue/sounds/fire-truck-air-horn_daniel-simion.mp3'
			},
			{
				name: 'Piece of Cake',
				slug: 'piece-of-cake',
				url: 'https://storage.googleapis.com/assets-pronto-entregue/sounds/piece-of-cake.ogg'
			},
			{
				name: 'Service Bell',
				slug: 'service-bell',
				url: 'https://storage.googleapis.com/assets-pronto-entregue/sounds/service-bell_daniel_simion.mp3'
			},
		]

		return sounds
	}
}

const NotificationSoundsController = new NotificationSoundsControl();

export default NotificationSoundsController;