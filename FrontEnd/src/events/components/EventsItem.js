import React from 'react';
import { Link } from 'react-router-dom';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import './EventsItem.css';

const EventsItem = props => {
	return (
		<li className="events-item">
			<Card className="events-item__content">
				<Link to={`/Events/${props.id}`}>
					<div className="events-item__image">
						<Avatar image={props.image} alt={props.name} />
					</div>
					<div className="events-item__info">
						<h2>Event: {props.name}</h2>
						<h3>Details: {props.detail}</h3>
					</div>
				</Link>
			</Card>
		</li>
	);
};

export default EventsItem;
