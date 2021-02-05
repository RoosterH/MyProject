import React, { useContext } from 'react';

import EventsItem from './EventsItem';
import { UserAuthContext } from '../../shared/context/auth-context';
import '../../shared/css/EventsList.css';

// treat this as a function looks like
// EventList(props.items), caller will call as <EventList items=(value to be passed in) \>
const EventList = props => {
	const userAuthContext = useContext(UserAuthContext);
	if (props.items.length === 0) {
		return (
			<div className="events-list">
				<h2>No event found.</h2>
			</div>
		);
	}

	// we use localStorage to store useEntries and match the event to find out wheather it's a user signed up event.
	let entries = [];
	if (userAuthContext.userId) {
		let userData = JSON.parse(localStorage.getItem('userData'));
		if (userData.userId === userAuthContext.userId) {
			for (let i = 0; i < userData.userEntries.length; ++i) {
				entries.push(userData.userEntries[i]);
			}
		}
	}

	let events = props.items;
	let signup = new Map();
	let waitlist = new Map();
	for (let i = 0; i < events.length; ++i) {
		for (let j = 0; j < entries.length; ++j) {
			if (entries[j].eventId === events[i].id) {
				let days = entries[j].waitlist.length;
				// For multiple day events, same entry could be on entry list for one day and waitlist
				// for the other day. In this case, we display ENROLLED + WAITLIST
				for (let k = 0; k < days; ++k) {
					// if entry is on the waitlist on one of the days
					if (entries[j].waitlist[k]) {
						waitlist[events[i].id] = true;
					} else {
						// if not on waitlist
						signup[events[i].id] = true;
					}
				}
			}
		}
	}

	return (
		<ul className="events-list">
			{events.map(event => (
				<EventsItem
					// In React, each child in the array should have a unique "key" prop
					// so when render it will only render one element not the whole array
					key={event.id}
					id={event.id}
					name={event.name}
					type={event.type}
					image={event.image}
					clubName={event.clubName}
					clubId={event.clubId}
					startDate={event.startDate}
					endDate={event.endDate}
					venue={event.venue}
					entryFormData={event.entryFormData}
					published={props.displayPublished ? event.published : false} // getting flag from event
					closed={event.closed}
					readOnly={props.readOnly}
					signup={signup[event.id]}
					waitlist={waitlist[event.id]}
					entryReportManager={props.entryReportManager}
					paymentCenter={props.paymentCenter}
					refundCenter={props.refundCenter}
					dataCenter={props.dataCenter}
					commsCenter={props.commsCenter}
				/>
			))}
		</ul>
	);
};

export default EventList;
