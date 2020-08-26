import React from 'react';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import EventsItem from './EventsItem';
import '../../shared/css/EventsList.css';

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
					// In React, each child in the array should have a unique "key" prop
					// so when render it will only render one element not the whole array
					key={event.id}
					id={event.id}
					name={event.name}
					type={event.type}
					image={process.env.REACT_APP_ASSET_URL + `/${event.image}`}
					clubName={event.clubName}
					startDate={event.startDate}
					endDate={event.endDate}
					venue={event.venue}
					entryFormData={event.entryFormData}
					published={props.displayPublished ? event.published : false}
				/>
			))}
		</ul>
	);
};

export default EventList;
