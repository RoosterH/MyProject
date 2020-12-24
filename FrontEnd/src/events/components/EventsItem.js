import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import '../../shared/css/EventsItem.css';

// EventsItem renders a card for each event
const EventsItem = props => {
	let startDate = moment(props.startDate).format('MM/DD/YY, ddd');
	let endDate = moment(props.endDate).format('MM/DD/YY, ddd');
	return (
		<li className="events-item">
			<Card className="events-item__content">
				{/****** Use Link to call the next component <Event /> *******/}
				{/* in order to pass props via Link, we need to make an object {{pathname: xxx, state: xxx}}
				 App.js Route also needs to make a change */}
				{/* link to <Event /> */}
				<Link
					to={{
						pathname: `/events/${props.id}`,
						state: {
							props: props
						}
					}}>
					<div className="events-item__image">
						<Avatar
							image={props.image}
							alt={props.name}
							className="avatar__event"
							published={props.published}
							publishDescription="PUBLISHED"
							signup={props.signup}
							signupDescription="ENROLLED"
						/>
					</div>
					<div className="events-item__info">
						<h2>{props.type}</h2>
						<div className="events-item__eventName">{props.name}</div>
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
