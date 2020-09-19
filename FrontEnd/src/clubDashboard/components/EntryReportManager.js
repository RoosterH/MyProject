import React, { useState } from 'react';
import EntryReport from './EntryReport';
import UpdateFormBuilder from '../../event/components/UpdateFormBuilder';
import UpdateEventPhotos from '../../event/pages/UpdateEventPhotos';
import UpdateEventRegistration from '../../event/pages/UpdateEventRegistration';
import Button from '../../shared/components/FormElements/Button';
import './ClubManager.css';

const EntryReportManager = props => {
	console.log('props = ', props);
	let entryReportData = props.entryReportData;
	// entryReport controls what to display in Tab Content
	const [entryReport, setEntryReport] = useState(false);
	// entryReportClass contorls className used for Button
	const [entryReportClass, setEntryReportClass] = useState(
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

	const entryReportClickHandler = () => {
		setEntryReport(true);
		setEntryReportClass('editeventmanager-orange');
		setPhoto(false);
		setPhotoClass('editeventmanager-grey');
		setFormBuilder(false);
		setFormBuilderClass('editeventmanager-grey');
		setRegistration(false);
		setRegistrationClass('editeventmanager-grey');
	};
	const photoClickHandler = () => {
		setEntryReport(false);
		setEntryReportClass('editeventmanager-grey');
		setPhoto(true);
		setPhotoClass('editeventmanager-orange');
		setFormBuilder(false);
		setFormBuilderClass('editeventmanager-grey');
		setRegistration(false);
		setRegistrationClass('editeventmanager-grey');
	};
	const formBuilderClickHandler = () => {
		setEntryReport(false);
		setEntryReportClass('editeventmanager-grey');
		setPhoto(false);
		setPhotoClass('editeventmanager-grey');
		setFormBuilder(true);
		setFormBuilderClass('editeventmanager-orange');
		setRegistration(false);
		setRegistrationClass('editeventmanager-grey');
	};
	const registrationClickHandler = () => {
		setEntryReport(false);
		setEntryReportClass('editeventmanager-grey');
		setPhoto(false);
		setPhotoClass('editeventmanager-grey');
		setFormBuilder(false);
		setFormBuilderClass('editeventmanager-grey');
		setRegistration(true);
		setRegistrationClass('editeventmanager-orange');
	};

	// set defualt page, if none is false, we will use entryReport as default
	if (!entryReport && !photo && !formBuilder && !registration) {
		entryReportClickHandler();
	}

	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="eventname">
					EVENT NAME &nbsp;&nbsp;&nbsp;{' '}
				</div>
			</div>

			{/* Edit Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<br />
					<ul className="nav nav-tabs">
						<Button
							size={entryReportClass}
							autoFocus
							onClick={entryReportClickHandler}>
							Entry List
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
						{entryReport && (
							<EntryReport entryReportData={entryReportData} />
						)}
						{photo && <UpdateEventPhotos />}
						{formBuilder && <UpdateFormBuilder />}
						{registration && <UpdateEventRegistration />}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default EntryReportManager;
