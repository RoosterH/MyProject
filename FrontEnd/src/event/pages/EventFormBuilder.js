import React from 'react';
import { useParams } from 'react-router-dom';

import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import FormBuilder from '../components/FormBuilder';

import './EventForm.css';

const EventFormBuilder = () => {
	let eventId = useParams().id;
	useClubLoginValidation();

	return <FormBuilder id={eventId} />;
};

export default EventFormBuilder;
