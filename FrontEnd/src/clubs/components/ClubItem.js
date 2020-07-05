import React from 'react';
import { Link } from 'react-router-dom';

import Avatar from '../../shared/components/UIElements/Avatar';
import Card from '../../shared/components/UIElements/Card';
import './ClubItem.css';

const ClubItem = props => {
	return (
		<li className="club-item">
			<Card className="club-item__content">
				<Link to={`/events/club/${props.id}`}>
					<div className="club-item__image">
						<Avatar
							image={`http://localhost:5000/${props.image}`}
							alt={props.name}
							className="avatar__club"
						/>
					</div>
					<div className="club-item__info">
						<h2>{props.name}</h2>
						<h3>
							{props.eventCount}{' '}
							{props.eventCount === 1 ? 'Event' : 'Events'}
						</h3>
					</div>
				</Link>
			</Card>
		</li>
	);
};

export default ClubItem;
