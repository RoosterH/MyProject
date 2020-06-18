import React from 'react';
import { Link } from 'react-router-dom';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import './EventsItem.css';

const EventsItem = props => {
	var startDate = new Date(props.startDate);
	var startDay = startDate.toLocaleDateString('en-US', {
		weekday: 'short'
	});
	var endDate = new Date(props.endDate);
	var endDay = endDate.toLocaleDateString('en-US', {
		weekday: 'short'
	});
	return (
		<li className="events-item">
			<Card className="events-item__content">
				<Link to={`/events/${props.id}`}>
					<div className="events-item__image">
						<Avatar
							image={props.eventImage}
							alt={props.name}
							className="avatar__event"
						/>
					</div>
					<div className="events-item__info">
						<h3>Event: {props.name}</h3>
						<h4>
							Date: {props.startDate}, {startDay} — {props.endDate},{' '}
							{endDay}
						</h4>
					</div>
				</Link>
			</Card>
		</li>
	);
};

export default EventsItem;
