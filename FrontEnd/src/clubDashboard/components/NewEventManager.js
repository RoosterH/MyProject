import React, { useState } from 'react';
import NewEvent from '../../event/pages/NewEvent';
import EventFormBuilder from '../../event/pages/EventFormBuilder';
import './ClubManager.css';

const NewEventManager = () => {
	const [eventInfo, setEventInfo] = useState(true);
	const [eventInfoClass, setEventInfoClass] = useState(
		'li-tab_orange'
	);
	const [photo, setPhoto] = useState(false);
	const [photoClass, setPhotoClass] = useState('li-tab');
	const [formBuilder, setFormBuilder] = useState(false);
	const [formBuilderClass, setFormBuilderClass] = useState('li-tab');
	const [submit, setSubmit] = useState(false);
	const [submitClass, setSubmitClass] = useState('li-tab');
	const [percentage, setPercentage] = useState('25');

	const eventInfoClickHandler = () => {
		setEventInfo(true);
		setEventInfoClass('li-tab_orange');
		setPhoto(false);
		setPhotoClass('li-tab');
		setFormBuilder(false);
		setFormBuilder('li-tab');
		setSubmit(false);
		setSubmitClass('li-tab');
		setPercentage('25');
	};
	const photoClickHandler = () => {
		setEventInfo(false);
		setEventInfoClass('li-tab');
		setPhoto(true);
		setPhotoClass('li-tab_orange');
		setFormBuilder(false);
		setFormBuilder('li-tab');
		setSubmit(false);
		setSubmitClass('li-tab');
		setPercentage('50');
	};
	const formBuilderClickHandler = () => {
		setEventInfo(false);
		setEventInfoClass('li-tab');
		setPhoto(false);
		setPhotoClass('li-tab');
		setFormBuilder(true);
		setFormBuilderClass('li-tab_orange');
		setSubmit(false);
		setSubmitClass('li-tab');
		setPercentage('75');
	};
	const submitClickHandler = () => {
		setEventInfo(false);
		setEventInfoClass('li-tab');
		setPhoto(false);
		setPhotoClass('li-tab');
		setFormBuilder(false);
		setFormBuilderClass('li-tab');
		setSubmit(true);
		setSubmitClass('li-tab_orange');
		setPercentage('100');
	};
	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="h3">New Event Manager</div>
			</div>

			<div className="progress">
				<div
					className="progress-bar"
					role="progressbar"
					style={{ width: `${percentage}%` }}
					aria-valuenow={percentage}
					aria-valuemin="0"
					aria-valuemax="100">
					{`${percentage}%`}
				</div>
			</div>
			{/* New Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<ul className="nav nav-tabs">
						<li className={eventInfoClass}>Event Information</li>
						<li className={photoClass}>Photos</li>
						<li className={formBuilderClass}>FormBuilder</li>
						<li className={submitClass}>Submit</li>
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
						{eventInfo && <NewEvent />}
						{formBuilder && <EventFormBuilder />}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default NewEventManager;
