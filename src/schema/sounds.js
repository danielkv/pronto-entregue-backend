import { gql }  from 'apollo-server';
import NotificationSoundsController from '../controller/notificationsSounds';

export const typeDefs =  gql`
	extend type Query {
		availableSounds: [JSON]!
	}
`;

export const resolvers =  {
	Query: {
		availableSounds() {
			return NotificationSoundsController.availableSounds();
		}
	}
}