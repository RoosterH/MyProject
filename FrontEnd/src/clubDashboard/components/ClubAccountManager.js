import React, { useContext, useEffect, useState } from 'react';
import Button from '../../shared/components/FormElements/Button';
import ClubCredential from './ClubCredential';
import ClubAccount from './ClubAccount';
import '../../shared/css/EventForm.css';
import '../../event/components/EventItem.css';
import './ClubManager.css';

const ClubAccountManager = () => {
	// eventInfo controls what to display in Tab Content
	const [credential, setCredential] = useState(false);
	// eventInfoClass contorls className used for Button
	const [credentialClass, setCredentialClass] = useState(
		'editeventmanager-grey'
	);
	const [account, setAccount] = useState(false);
	const [accountClass, setAccountClass] = useState(
		'editeventmanager-grey'
	);

	const credentialClickHandler = () => {
		setCredential(true);
		setCredentialClass('editeventmanager-orange');
		setAccount(false);
		setAccountClass('editeventmanager-grey');
	};
	const accountClickHandler = () => {
		setCredential(false);
		setCredentialClass('editeventmanager-grey');
		setAccount(true);
		setAccountClass('editeventmanager-orange');
	};

	// set defualt page, if none is false, we will use eventInfo as default
	if (!credential && !account) {
		credentialClickHandler();
	}

	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="h3">Account Manager</div>
			</div>

			{/* Edit Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<br />
					<ul className="nav nav-tabs">
						<Button
							size={credentialClass}
							autoFocus
							onClick={credentialClickHandler}>
							Club Credential
						</Button>
						<Button
							size={accountClass}
							autoFocus
							onClick={accountClickHandler}>
							Account
						</Button>
					</ul>
					<div className="tab-content">
						{credential && <ClubCredential />}
						{account && <ClubAccount />}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default ClubAccountManager;
