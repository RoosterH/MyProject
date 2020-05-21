import React from 'react';

import EventsList from '../components/EventsList';
import BigEvent from './bigEvent.jpg';

// Events is called in App.js where the route been defined
// @to-do
const Events = () => {
	// dummy events
	const EVENTS = [
		{
			id: 'u1',
			name: 'Solo 1',
			image:
				'https://media.gettyimages.com/photos/san-jose-twilight-picture-id1058214402?s=2048x2048',
			detail: '06/25/2020',
		},
		{
			id: 'u2',
			name: 'Solo 2',
			image: BigEvent,
			detail: '06/25/2020',
		},
		{
			id: 'u3',
			name: 'Solo 3',
			//image: BigEvent,
			image: `${process.env.PUBLIC_URL}/event.jpg`, // public folder
			detail: '06/25/2020',
		},
	];

	// calling EventsList from EventsList.js where it passes EVENTS to child EventsList
	// just treat the following call as EventsList(items = EVENTS); items is the props
	// name defined in EventsList
	return <EventsList items={EVENTS} />;
};

export default Events;
