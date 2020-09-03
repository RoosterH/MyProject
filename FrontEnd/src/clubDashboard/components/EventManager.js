import React from 'react';
import { Link } from 'react-router-dom';

import './ClubManager.css';

const EventManager = () => {
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="h3">Event Manager</div>
			</div>

			<div className="list-content">
				<div className="list-content-link">
					<Link to="/clubs/newEventManager/" exact="exact">
						<i
							className="fa fa-sort-desc pull-right"
							aria-hidden="true"
						/>
						Add New Event
					</Link>
					{/* <p className="list-content-link">Add New Event</p> */}

					<p className="list-content-desc">
						Here’s where you add a new event. Follow steps to add a
						new club event.
					</p>

					<p className="list-content-link">Edit Event</p>
					<p className="list-content-desc">
						Want to edit an existing event? Pick the one you want to
						edit.
					</p>
				</div>
			</div>
		</React.Fragment>
	);
};

export default EventManager;
