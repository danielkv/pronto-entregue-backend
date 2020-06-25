class StatusControl {
	statusLabel(status) {
		// isIn: [['waiting', 'preparing', 'delivering', 'delivered', 'canceled']],
			
		switch(status) {
			case 'waiting':
				return 'Aguardando';
			case 'preparing':
				return 'Preparando';
			case 'waitingDelivery':
				return 'Aguardando entregador';
			case 'waitingPickUp':
				return 'Aguardando retirada';
			case 'delivering':
				return 'A caminho';
			case 'delivered':
				return 'Entregue';
			case 'canceled':
				return 'Cancelado';
			default: return '';
		}
		
	}

}

const StatusController = new StatusControl();

export default StatusController;