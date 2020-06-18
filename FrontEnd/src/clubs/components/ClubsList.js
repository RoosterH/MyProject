import React from 'react';

import ClubItem from './ClubItem';
import Card from '../../shared/components/UIElements/Card';
import './ClubsList.css';

const ClubsList = props => {
	if (props.items.length === 0) {
		return (
			<div className="center">
				<Card>
					<h2>No clubs found.</h2>
				</Card>
			</div>
		);
	}

	return (
		<ul className="clubs-list">
			{props.items.map(club => (
				<ClubItem
					key={club.id}
					id={club.id}
					image={club.image}
					name={club.name}
					eventCount={club.events.length}
					className="avatar2"
				/>
			))}
		</ul>
	);
};

export default ClubsList;
