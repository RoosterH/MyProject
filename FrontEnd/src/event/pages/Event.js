import React from 'react';
import { useParams } from 'react-router-dom';

import Card from '../../shared/components/UIElements/Card';
import BigEvent from './bigEvent.jpg';
import EventItem from '../components/EventItem';

export const EVENTS = [
	{
		id: 'u1',
		name: 'SCCA - San Francisco Region - Solo 1',
		title: 'SCCA - San Francisco Region - Solo 1',
		imageUrl:
			'https://media.gettyimages.com/photos/san-jose-twilight-picture-id1058214402?s=2048x2048',
		startDate: '06/25/2020 Sat',
		endDate: '06/26/2020 Sun',
		venue: 'NASA Crows Landing Airport and Test Facility',
		address: 'Crows Landing, CA',
		coordinate: { lat: 37.4015069, lng: -121.1059222 },
		description:
			"SCCA - San Francisco Region - Solo. Reminder: You have to work! We keep a running list of those of you have skipped out on work. Check it out HERE and make sure you aren't on it.",
		courseMap:
			'https://www.bmwautocross.com/wp-content/uploads/2019/10/20191019-ggcautoxCourseMap-FINAL.png'
	},
	{
		id: 'u2',
		name: 'SCCA - San Francisco Region - Solo 2',
		title: 'SCCA - San Francisco Region - Solo 2',
		imageUrl: BigEvent,
		startDate: '07/25/2020 Sat',
		endDate: '07/26/2020 Sun',
		venue: 'NASA Crows Landing Airport and Test FacilityCrows Landing',
		address: 'Crows Landing, CA',
		coordinate: { lat: 37.4015069, lng: -121.1059222 },
		description: 'SCCA - San Francisco Region - Solo',
		courseMap:
			'https://www.bmwautocross.com/wp-content/uploads/2019/10/20191019-ggcautoxCourseMap-FINAL.png'
	},
	{
		id: 'u3',
		name: 'SCCA - San Francisco Region - Solo 3',
		title: 'SCCA - San Francisco Region - Solo 3',
		startDate: '08/25/2020 Fri',
		endDate: '08/27/2020 Sat',
		imageUrl: `${process.env.PUBLIC_URL}/event.jpg`, // public folder
		venue: 'NASA Crows Landing Airport and Test FacilityCrows Landing',
		address: 'Crows Landing',
		description: 'SCCA - San Francisco Region - Solo',
		coordinate: { lat: 37.4015069, lng: -121.1059222 },
		courseMap:
			'https://www.bmwautocross.com/wp-content/uploads/2019/10/20191019-ggcautoxCourseMap-FINAL.png'
	}
];
// Events is called in App.js where the route been defined
// @to-do
const Event = () => {
	const eventId = useParams().eid;
	const event = EVENTS.find(element => element.id === eventId);

	if (event === undefined) {
		return (
			<div className="center">
				<Card>
					<h2>Not a valid event.</h2>
				</Card>
			</div>
		);
	}

	return <EventItem event={event} />;
};

export default Event;
