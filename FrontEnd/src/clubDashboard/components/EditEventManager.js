import React, { useState, useEffect } from 'react';
import UpdateEvent from '../../event/pages/UpdateEvent';
import UpdateFormBuilder from '../../event/components/UpdateFormBuilder';
import UpdateEventPhotos from '../../event/pages/UpdateEventPhotos';
import UpdateEventRegistration from '../../event/pages/UpdateEventRegistration';
import Button from '../../shared/components/FormElements/Button';
import './ClubManager.css';

const EditEventManager = props => {
	let eventId = props.event.id;

	// eventInfo controls what to display in Tab Content
	const [eventInfo, setEventInfo] = useState(false);
	// eventInfoClass contorls className used for Button
	const [eventInfoClass, setEventInfoClass] = useState(
		'editeventmanager-grey'
	);
	const [photo, setPhoto] = useState(false);
	const [photoClass, setPhotoClass] = useState(
		'editeventmanager-grey'
	);
	const [formBuilder, setFormBuilder] = useState(false);
	const [formBuilderClass, setFormBuilderClass] = useState(
		'editeventmanager-grey'
	);
	const [registration, setRegistration] = useState(false);
	const [registrationClass, setRegistrationClass] = useState(
		'editeventmanager-grey'
	);

	const eventInfoClickHandler = () => {
		setEventInfo(true);
		setEventInfoClass('editeventmanager-orange');
		setPhoto(false);
		setPhotoClass('editeventmanager-grey');
		setFormBuilder(false);
		setFormBuilderClass('editeventmanager-grey');
		setRegistration(false);
		setRegistrationClass('editeventmanager-grey');
	};
	const photoClickHandler = () => {
		setEventInfo(false);
		setEventInfoClass('editeventmanager-grey');
		setPhoto(true);
		setPhotoClass('editeventmanager-orange');
		setFormBuilder(false);
		setFormBuilderClass('editeventmanager-grey');
		setRegistration(false);
		setRegistrationClass('editeventmanager-grey');
	};
	const formBuilderClickHandler = () => {
		setEventInfo(false);
		setEventInfoClass('editeventmanager-grey');
		setPhoto(false);
		setPhotoClass('editeventmanager-grey');
		setFormBuilder(true);
		setFormBuilderClass('editeventmanager-orange');
		setRegistration(false);
		setRegistrationClass('editeventmanager-grey');
	};
	const registrationClickHandler = () => {
		setEventInfo(false);
		setEventInfoClass('editeventmanager-grey');
		setPhoto(false);
		setPhotoClass('editeventmanager-grey');
		setFormBuilder(false);
		setFormBuilderClass('editeventmanager-grey');
		setRegistration(true);
		setRegistrationClass('editeventmanager-orange');
	};

	// set defualt page, if none is false, we will use eventInfo as default
	if (!eventInfo && !photo && !formBuilder && !registration) {
		eventInfoClickHandler();
	}

	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="h3">{props.event.name}</div>
			</div>

			{/* Edit Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<br />
					<ul className="nav nav-tabs">
						<Button
							size={eventInfoClass}
							autoFocus
							onClick={eventInfoClickHandler}>
							Event Information
						</Button>
						<Button
							size={photoClass}
							autoFocus
							onClick={photoClickHandler}>
							Photos
						</Button>
						<Button
							size={formBuilderClass}
							autoFocus
							onClick={formBuilderClickHandler}>
							Form Builder
						</Button>
						<Button
							size={registrationClass}
							autoFocus
							onClick={registrationClickHandler}>
							Registration
						</Button>
					</ul>
					<div className="tab-content">
						{eventInfo && <UpdateEvent event={props.event} />}
						{photo && <UpdateEventPhotos event={props.event} />}
						{formBuilder && <UpdateFormBuilder event={props.event} />}
						{registration && (
							<UpdateEventRegistration event={props.event} />
						)}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default EditEventManager;
