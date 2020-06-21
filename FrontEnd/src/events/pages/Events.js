import React from 'react';

import EventsList from '../components/EventsList';

// Events is called in App.js where the route been defined
// @to-do
const Events = () => {
	// calling EventsList from EventsList.js where it passes EVENTS to child EventsList
	// just treat the following call as EventsList(items = EVENTS); items is the props
	// name defined in EventsList
	return <EventsList items={[]} />;
};

export default Events;
