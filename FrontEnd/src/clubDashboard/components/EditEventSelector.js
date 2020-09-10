import React, { useContext } from 'react';
import { ClubAuthContext } from '../../shared/context/auth-context';
import ClubEvents from '../../clubs/pages/ClubEvents';

import './ClubManager.css';
import { useParams } from 'react-router-dom';

const EditEventSelector = () => {
	let clubId = useParams().clubId;
	const clubAuthContext = useContext(ClubAuthContext);
	if (
		!clubAuthContext ||
		!clubAuthContext.clubId ||
		clubAuthContext.clubId != clubId
	) {
		return <div>Not authorized to edit events.</div>;
	}
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="selector-title">
					Please select an event to edit
				</div>
				<div className="selector-warning">
					Editing on published events will need to re-publish again
				</div>
			</div>
			<div>
				<ClubEvents clubId={clubId} />
			</div>
		</React.Fragment>
	);
};

export default EditEventSelector;
