import React, { useEffect, useState } from 'react';
import {
	ErrorMessage,
	Field,
	Form,
	Formik,
	useFormikContext
} from 'formik';
import moment from 'moment';
import * as Yup from 'yup';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import EventsList from '../components/EventsList';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

import './Events.css';
import { eventTypes } from '../../event/components/EventTypes';

// Events is called in App.js where the route been defined
// @to-do
const Events = () => {
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [curValues, setCurValues] = useState();
	const [loadedEvents, setLoadedEvents] = useState();

	const AutoSubmitToken = () => {
		const { values, submitForm } = useFormikContext();
		useEffect(() => {
			// Submit the form imperatively as an effect as soon as form values.token are 5 digits long
			if (values.zip.length === 5 && values !== curValues) {
				submitForm();
				setCurValues(values);
			}
		}, [values, submitForm]);
		return null;
	};

	let today = moment().format('YYYY-MM-DD');
	let halfMonth = moment().add(15, 'days').format('YYYY-MM-DD');
	let eventType = 'Autocross',
		startDate = today,
		endDate = halfMonth,
		distance = 50,
		zip = '';

	const storageData = JSON.parse(localStorage.getItem('searchData'));
	if (storageData && moment(storageData.expiration) > moment()) {
		eventType = storageData.eventType;
		startDate = storageData.startDate;
		endDate = storageData.endDate;
		distance = storageData.distance;
		zip = storageData.zip;
	}

	const initialValues = {
		eventType: eventType,
		startDate: startDate,
		endDate: endDate,
		distance: distance,
		zip: zip
	};

	const mainSearch = values => (
		<div>
			<div className="search-page-header">
				<h4>
					<span>Find driving events near you</span>
				</h4>
			</div>
			<Formik
				initialValues={initialValues}
				validationSchema={Yup.object({
					zip: Yup.string().matches(
						/^[0-9]{5}$/,
						'Must be exactly 5 digits'
					)
				})}
				onSubmit={(values, actions) => {
					const fetchEvents = async () => {
						try {
							// the request needs to match backend clubsRoutes /signup route
							// With fromData, headers cannot be {Content-Type: application/json}
							const responseData = await sendRequest(
								process.env.REACT_APP_BACKEND_URL + '/events/date',
								'POST',
								JSON.stringify({
									eventType: values.eventType,
									startDate: moment(values.startDate),
									endDate: moment(values.endDate),
									distance: values.distance,
									zip: values.zip
								}),
								{ 'Content-type': 'application/json' }
							);

							setLoadedEvents(responseData.events);
							actions.setSubmitting(false);

							// set the search criteria to localStorage so the next time
							// user open the page, we will perform the same search
							const tokenExp = moment(
								moment().add(7, 'days'),
								moment.ISO_8601
							);
							// Save data in localStorage for page refreshing
							// localStorage is a global js API for browser localStorage.
							// 'searchData' is the key
							localStorage.setItem(
								'searchData',
								JSON.stringify({
									eventType: values.eventType,
									startDate: values.startDate,
									endDate: values.endDate,
									distance: values.distance,
									zip: values.zip,
									expiration: tokenExp
								})
							);
						} catch (err) {}
					};
					fetchEvents();
				}}>
				{({ values, error, touched, isSubmitting }) => (
					<Form className="inline">
						<Field
							name="eventType"
							as="select"
							className="inline__input eventType" /* inherit from inline__input, in css "inline__input.eventType"*/
						>
							<option value="Event Type" disabled>
								Event Type
							</option>
							{eventTypes.map(option => {
								let res = option.split(':');
								return (
									<option name={res[0]} key={res[0]}>
										{res[1]}
									</option>
								);
							})}
						</Field>
						<Field
							type="date"
							name="startDate"
							placeholder={today}
							min="2020-07-01"
							max="2020-12-31"
							className="inline__input date"
						/>
						<Field
							type="date"
							name="endDate"
							placeholder={today}
							min="2020-07-01"
							max="2020-12-31"
							className="inline__input date"
						/>
						<Field
							as="select"
							name="distance"
							className="inline__input distance">
							<option value="50">50 miles</option>
							<option value="100">100 miles</option>
							<option value="250">250 miles</option>
							<option value="500">500 miles</option>
							<option value="3500">Anywhere</option>
						</Field>
						<Field
							type="text"
							name="zip"
							placeholder="5 digit zip"
							className="inline__input zip"
						/>
						<ErrorMessage name="zip">
							{msg => <div className="inline__error_zip">{msg}</div>}
						</ErrorMessage>
						<AutoSubmitToken />
					</Form>
				)}
			</Formik>
		</div>
	);

	// calling EventsList from EventsList.js where it passes EVENTS to child EventsList
	// just treat the following call as EventsList(items = EVENTS); items is the props
	// name defined in EventsList
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{mainSearch()}
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{!isLoading && loadedEvents && (
				<EventsList items={loadedEvents} />
			)}
		</React.Fragment>
	);
};

export default Events;
