import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';

import ClubEvents from '../../clubs/pages/ClubEvents';
import { ClubAuthContext } from '../../shared/context/auth-context';

import '../components/ClubManager.css';

// Calling ClubEvents
const CommsEventSelector = () => {
	let clubId = useParams().clubId;
	const clubAuthContext = useContext(ClubAuthContext);
	if (
		!clubAuthContext ||
		!clubAuthContext.clubId ||
		clubAuthContext.clubId !== clubId
	) {
		return (
			<div className="list-header clearfix">
				<div className="selector-title">
					Not authorized to view event data
				</div>
			</div>
		);
	}

	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="selector-title">Please select an event</div>
			</div>
			<ClubEvents
				clubId={clubId}
				commsCenter={true}
				readOnly={true}
			/>
		</React.Fragment>
	);
};

export default CommsEventSelector;
