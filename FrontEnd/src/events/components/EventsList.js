import React from 'react';

import EventsItem from './EventsItem';
import Card from '../../shared/components/UIElements/Card';
import './EventsList.css';

// treat this as a function looks like
// EventList(props.items), caller will call as <EventList items=(value to be passed in) \>
const EventList = props => {
	if (props.items.length === 0) {
		return (
			<div className="center">
				<Card>
					<h2>No event found. Please click to create a new event</h2>
					<button className="big-btn">Create a new event</button>
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
					image={event.image}
					name={event.name}
					detail={event.detail}
				/>
			))}
		</ul>
	);
};

export default EventList;
