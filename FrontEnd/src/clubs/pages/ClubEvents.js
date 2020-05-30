import React from 'react';
import { useParams } from 'react-router-dom';

import EventsList from '../../events/components/EventsList';
import { EVENTS } from '../../event/pages/Event';

// Events is called in App.js where the route been defined
// @to-do
const ClubEvents = () => {
	const clubId = useParams().cid;

	const clubEvents = EVENTS.filter(event => event.clubId === clubId);
	console.log('foundEvents = ', clubEvents);

	// calling EventsList from EventsList.js where it passes EVENTS to child EventsList
	// just treat the following call as EventsList(items = EVENTS); items is the props
	// name defined in EventsList
	return <EventsList items={clubEvents} />;
};

export default ClubEvents;
