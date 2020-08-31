import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import '../../shared/css/EventsItem.css';
import { isPropertyAssignment } from 'typescript';

// UserCarItem renders a card for each event
const UserCarsItem = props => {
	return (
		<li className="events-item">
			<Card className="events-item__content">
				<Link to={`/users/cars/${props.id}`}>
					<div className="events-item__image">
						<Avatar
							image={props.image}
							alt={props.model}
							className="avatar__event"
							published={true}
							publishDescription={
								props.active ? 'ON DUTY' : 'RETIRED'
							}
						/>
					</div>
					<div className="events-item__info">
						<h2>{props.year}</h2>
						<h1>
							{props.make}&nbsp;{props.model}&nbsp;{props.trimLevel}
						</h1>
						{/* <h1>{props.model}</h1> */}
						{/* <h4>by {props.clubName}</h4> */}
						<h2></h2>
						{/* <h2> {props.venue}</h2> */}
					</div>
				</Link>
			</Card>
		</li>
	);
};

export default UserCarsItem;
