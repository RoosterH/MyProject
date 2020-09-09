import React, { useState, useEffect } from 'react';
import UpdateEvent from '../../event/pages/UpdateEvent';
import FormBuilder from '../../event/components/FormBuilder';
import EventPhotos from '../../event/pages/EventPhotos';
import EventRegistration from '../../event/pages/EventRegistration';
import './ClubManager.css';
import { useParams } from 'react-router-dom';

const EditEventManager = props => {
	let eventId = props.event.id;

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
	const [percentage, setPercentage] = useState('25');

	const eventInfoClickHandler = () => {
		setEventInfo(true);
		setEventInfoClass('li-tab_orange');
		setPhoto(false);
		setPhotoClass('li-tab');
		setFormBuilder(false);
		setFormBuilderClass('li-tab');
		setRegistration(false);
		setRegistrationClass('li-tab');
		setPercentage('25');
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
		setPercentage('50');
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
		setPercentage('75');
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
		setPercentage('100');
	};

	// set defualt page, if none is false, we will use eventInfo as default
	if (!eventInfo && !photo && !formBuilder && !registration) {
		eventInfoClickHandler();
	}

	// getting continue status back from <EditEvent />
	const [newEventStatus, setNewEventStatus] = useState(false);
	const EditEventHandler = status => {
		if (status) {
			// set newEventStatus to true
			setNewEventStatus(true);
		}
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

	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="h3">{props.event.name}</div>
			</div>

			{/* Edit Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					{/* <div className="progress">
						<div
							className="progress-bar progress-bar-striped progress-bar-animated"
							role="progressbar"
							style={{ width: `${percentage}%` }}
							aria-valuenow={percentage}
							aria-valuemin="0"
							aria-valuemax="100">
							{`${percentage}%`}
						</div>
					</div> */}
					<br />
					<ul className="nav nav-tabs">
						<li className={eventInfoClass}>Event Information</li>
						<li className={photoClass}>Photos</li>
						<li className={formBuilderClass}>FormBuilder</li>
						<li className={registrationClass}>Registration</li>
						{/* <li>
							<button
								className="btn btn-default tab-link"
								autoFocus
								onClick={eventInfoClickHandler}>
								Event Information
							</button>
						</li> */}
						{/* <li className="btn btn-default tab-link" autoFocus> */}

						{/* <li>
							<button className="btn btn-default tab-link">
								Photos
							</button>
						</li> */}

						{/* <li>
							<button
								className="btn btn-default tab-link"
								onClick={formBuilderClickHandler}>
								Form Builder
							</button>
						</li> */}
						{/* <li>
							<button className="btn btn-default tab-link">
								Video
							</button>
						</li> */}
					</ul>
					<div className="tab-content">
						{eventInfo && <UpdateEvent eventId={eventId} />}
						{photo && <EventPhotos eventId={eventId} />}
						{formBuilder && <FormBuilder eventId={eventId} />}
						{registration && <EventRegistration eventId={eventId} />}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default EditEventManager;
