import React, { useContext, useEffect, useState } from 'react';
import Button from '../../shared/components/FormElements/Button';
import ClubProfile from './ClubProfile';
import ClubPhotos from './ClubPhotos';
import '../../shared/css/EventForm.css';
import '../../event/components/EventItem.css';
import './ClubManager.css';

const ClubProfileManager = () => {
	// eventInfo controls what to display in Tab Content
	const [clubProfile, setClubProfile] = useState(false);
	// eventInfoClass contorls className used for Button
	const [clubProfileClass, setClubProfileClass] = useState(
		'editeventmanager-grey'
	);
	const [photo, setPhoto] = useState(false);
	const [photoClass, setPhotoClass] = useState(
		'editeventmanager-grey'
	);
	const [viewClubProfile, setViewClubProfile] = useState(false);
	const [viewClubProfileClass, setViewClubProfileClass] = useState(
		'editeventmanager-grey'
	);

	const clubProfileClickHandler = () => {
		setClubProfile(true);
		setClubProfileClass('editeventmanager-orange');
		setPhoto(false);
		setPhotoClass('editeventmanager-grey');
		setViewClubProfile(false);
		setViewClubProfileClass('editeventmanager-grey');
	};
	const photoClickHandler = () => {
		setClubProfile(false);
		setClubProfileClass('editeventmanager-grey');
		setPhoto(true);
		setPhotoClass('editeventmanager-orange');
		setViewClubProfile(false);
		setViewClubProfileClass('editeventmanager-grey');
	};
	const viewClubProfileClickHandler = () => {
		setClubProfile(false);
		setClubProfileClass('editeventmanager-grey');
		setPhoto(false);
		setPhotoClass('editeventmanager-grey');
		setViewClubProfile(true);
		setViewClubProfileClass('editeventmanager-orange');
	};

	// set defualt page, if none is false, we will use eventInfo as default
	if (!clubProfile && !photo && !viewClubProfile) {
		clubProfileClickHandler();
	}

	return (
		<React.Fragment>
			{/* Edit Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<br />
					<ul className="nav nav-tabs">
						<Button
							size={clubProfileClass}
							autoFocus
							onClick={clubProfileClickHandler}>
							Club Profile
						</Button>
						<Button
							size={photoClass}
							autoFocus
							onClick={photoClickHandler}>
							Photos
						</Button>
						<Button
							size={viewClubProfileClass}
							autoFocus
							onClick={viewClubProfileClickHandler}>
							View Club Profile
						</Button>
					</ul>
					<div className="tab-content">
						{clubProfile && <ClubProfile />}
						{photo && <ClubPhotos />}
						{/* {formBuilder && (
							<UpdateFormBuilder
								profile={profile}
								returnNewEvent={updateProfile}
							/>
						)}  */}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default ClubProfileManager;
