import React from 'react';
import { useParams } from 'react-router-dom';

import Card from '../../shared/components/UIElements/Card';
import EventItem from '../components/EventItem';

// Events is called in App.js where the route been defined
// @to-do
const Event = () => {
	const eventId = useParams().id;
	const EVENTS = [];
	const event = EVENTS.find(element => element.id === eventId);

	if (event === undefined) {
		return (
			<div className="center">
				<Card>
					<h2>Not a valid event.</h2>
				</Card>
			</div>
		);
	}

	return <EventItem event={event} />;
};

export default Event;
