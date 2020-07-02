import { gql }  from 'apollo-server';

import CompanyController from '../controller/company';
import NotificationSoundsController from '../controller/notificationsSounds';

export const typeDefs =  gql`
	extend type Query {
		availableSounds: [JSON]!
		companySound(companyId: ID): JSON!
	}
`;

export const resolvers =  {
	Query: {
		availableSounds() {
			return NotificationSoundsController.availableSounds();
		},
		async companySound(_, { companyId }) {
			const sound = await CompanyController.getConfig(companyId, 'notificationSound');
			if (!sound) return NotificationSoundsController.availableSounds()[0]
			
			return sound;
		}
	}
}