import React from 'react';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import EventsItem from './EventsItem';
import './EventsList.css';

// treat this as a function looks like
// EventList(props.items), caller will call as <EventList items=(value to be passed in) \>
const EventList = props => {
	if (props.items.length === 0) {
		return (
			<div className="center">
				<Card>
					<h2>No event found. Please click to create a new event</h2>
					<Button to="/events/new">Create a new event</Button>
				</Card>
			</div>
		);
	}

	return (
		<ul className="events-list">
			{props.items.map(event => (
				<EventsItem
					key={event.id}
					id={event.id}
					eventImage={event.eventImage}
					name={event.name}
					startDate={event.startDate}
					endDate={event.endDate}
				/>
			))}
		</ul>
	);
};

export default EventList;
