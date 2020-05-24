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
						<Avatar image={props.imageUrl} alt={props.name} />
					</div>
					<div className="events-item__info">
						<h3>Event: {props.name}</h3>
						<h4>
							Date: {props.startDate} to {props.endDate}
						</h4>
					</div>
				</Link>
			</Card>
		</li>
	);
};

export default EventsItem;
