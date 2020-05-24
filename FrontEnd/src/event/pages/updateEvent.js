import React from 'react';
import { useParams } from 'react-router-dom';

import { EVENTS } from './Event';
const UpdateEvent = () => {
	const eventId = useParams().eid;
	return <h2>Update Event</h2>;
};

export default UpdateEvent;
