import React, { useState, useEffect } from 'react';
import NewEvent from '../../event/pages/NewEvent';
import FormBuilder from '../../event/components/FormBuilder';
import EventPhotos from '../../event/pages/EventPhotos';
import EventRegistration from '../../event/pages/EventRegistration';
import './ClubManager.css';

const NewEventManager = () => {
	const [eventId, setEventId] = useState();
	const [eventInfo, setEventInfo] = useState(false);
	const [eventInfoClass, setEventInfoClass] = useState('li-tab');
	const [photo, setPhoto] = useState(false);
	const [photoClass, setPhotoClass] = useState('li-tab');
	const [formBuilder, setFormBuilder] = useState(false);
	const [formBuilderClass, setFormBuilderClass] = useState('li-tab');
	const [registration, setRegistration] = useState(false);
	const [registrationClass, setRegistrationClass] = useState(
		'li-tab'
	);
	const [percentage, setPercentage] = useState('0');

	const eventInfoClickHandler = () => {
		setEventInfo(true);
		setEventInfoClass('li-tab_orange');
		setPhoto(false);
		setPhotoClass('li-tab');
		setFormBuilder(false);
		setFormBuilderClass('li-tab');
		setRegistration(false);
		setRegistrationClass('li-tab');
		setPercentage('0');
	};
	const photoClickHandler = () => {
		setEventInfo(false);
		setEventInfoClass('li-tab');
		setPhoto(true);
		setPhotoClass('li-tab_orange');
		setFormBuilder(false);
		setFormBuilderClass('li-tab');
		setRegistration(false);
		setRegistrationClass('li-tab');
		setPercentage('25');
	};
	const formBuilderClickHandler = () => {
		setEventInfo(false);
		setEventInfoClass('li-tab');
		setPhoto(false);
		setPhotoClass('li-tab');
		setFormBuilder(true);
		setFormBuilderClass('li-tab_orange');
		setRegistration(false);
		setRegistrationClass('li-tab');
		setPercentage('50');
	};
	const registrationClickHandler = () => {
		setEventInfo(false);
		setEventInfoClass('li-tab');
		setPhoto(false);
		setPhotoClass('li-tab');
		setFormBuilder(false);
		setFormBuilderClass('li-tab');
		setRegistration(true);
		setRegistrationClass('li-tab_orange');
		setPercentage('75');
	};
	const saveClickHandler = () => {
		setPercentage('100');
	};

	// set defualt page, if none is false, we will use eventInfo as default
	if (!eventInfo && !photo && !formBuilder && !registration) {
		eventInfoClickHandler();
	}

	// getting continue status back from <NewEvent />
	const [newEventStatus, setNewEventStatus] = useState(false);
	const NewEventHandler = status => {
		if (status) {
			// set newEventStatus to true
			setNewEventStatus(true);
		}
	};
	const EventIDHandler = eId => {
		setEventId(eId);
	};
	useEffect(() => {
		// if newEventStatus is true, move to the next stage => Photo.
		if (newEventStatus) {
			photoClickHandler();
		}
	}, [newEventStatus, eventInfo]);

	// getting continue status back from <EventPhoto />
	const [photoStatus, setPhotoStatus] = useState(false);
	const PhotoHandler = status => {
		if (status) {
			setPhotoStatus(true);
		}
	};
	useEffect(() => {
		if (photoStatus) {
			formBuilderClickHandler();
		}
	}, [photoStatus, formBuilderClickHandler]);

	// getting continue status back from <FormBuilder />
	const [formBuilderStatus, setFormBuilderStatus] = useState(false);
	const FormBuilderHandler = status => {
		if (status) {
			setFormBuilderStatus(status);
		}
	};
	useEffect(() => {
		if (formBuilderStatus) {
			registrationClickHandler();
		}
	}, [formBuilderStatus, registrationClickHandler]);

	// getting continue status back from <FormBuilder />
	const [registrationStatus, setRegistrationStatus] = useState(false);
	const RegistrationHandler = status => {
		if (status) {
			setRegistrationStatus(status);
		}
	};
	useEffect(() => {
		if (registrationStatus) {
			registrationClickHandler();
		}
	}, [registrationStatus, registrationClickHandler]);

	const [saveStatus, setSaveStatus] = useState(false);
	const saveHandler = status => {
		if (status) {
			setSaveStatus(status);
		}
	};
	useEffect(() => {
		if (saveStatus) {
			saveClickHandler();
		}
	}, [saveStatus, saveClickHandler]);

	const [multiDayEvent, setMultiDayEvent] = useState(false);
	const isMultiDayEvent = multi => {
		setMultiDayEvent(multi);
	};
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="h3">New Event Manager</div>
			</div>

			{/* New Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<div className="progress">
						<div
							className="progress-bar progress-bar-striped progress-bar-animated"
							role="progressbar"
							style={{ width: `${percentage}%` }}
							aria-valuenow={percentage}
							aria-valuemin="0"
							aria-valuemax="100">
							{`${percentage}%`}
						</div>
					</div>
					<br />
					<ul className="nav nav-tabs">
						<li className={eventInfoClass}>Event Information</li>
						<li className={photoClass}>Photos</li>
						<li className={formBuilderClass}>FormBuilder</li>
						<li className={registrationClass}>Registration</li>
					</ul>
					<div className="tab-content">
						{eventInfo && (
							<NewEvent
								newEventStatus={NewEventHandler}
								eventIdHandler={EventIDHandler}
								isMultiDayEvent={isMultiDayEvent}
							/>
						)}
						{photo && (
							<EventPhotos
								eventPhotosStatus={PhotoHandler}
								eventId={eventId}
							/>
						)}
						{formBuilder && (
							<FormBuilder
								formbuilderStatus={FormBuilderHandler}
								eventId={eventId}
							/>
						)}
						{registration && (
							<EventRegistration
								registrationStatus={RegistrationHandler}
								saveStatus={saveHandler}
								eventId={eventId}
								multiDayEvent={multiDayEvent}
							/>
						)}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default NewEventManager;
