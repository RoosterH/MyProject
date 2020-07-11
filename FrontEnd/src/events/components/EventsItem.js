import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import './EventsItem.css';

const EventsItem = props => {
	let startDate = moment(props.startDate).format('MM/DD/YY, ddd');
	let endDate = moment(props.endDate).format('MM/DD/YY, ddd');
	return (
		<li className="events-item">
			<Card className="events-item__content">
				<Link to={`/events/${props.id}`}>
					<div className="events-item__image">
						<Avatar
							image={props.image}
							alt={props.name}
							className="avatar__event"
						/>
					</div>
					<div className="events-item__info">
						<h2>{props.type}</h2>
						<h1>{props.name}</h1>
						<h4>by {props.clubName}</h4>
						<h2>
							{startDate} - {endDate}{' '}
						</h2>
						<h2> {props.venue}</h2>
					</div>
				</Link>
			</Card>
		</li>
	);
};

export default EventsItem;
