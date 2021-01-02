import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '../../shared/components/FormElements/Button';
import ClubCredential from './ClubCredential';
import ClubStripe from './ClubStripe';
import ClubAccount from './ClubAccount';
import RedirectExternalURL from '../../shared/hooks/redirectExternalURL';
import '../../shared/css/EventForm.css';
import '../../shared/css/EventItem.css';
import './ClubManager.css';
import ClubAuthConetxt, {
	ClubAuthContext
} from '../../shared/context/auth-context';
import { Redirect } from 'react-router-dom';

const ClubAccountManager = () => {
	const history = useHistory();
	const clubAuthContext = useContext(ClubAuthContext);
	// eventInfo controls what to display in Tab Content
	const [credential, setCredential] = useState(false);
	// eventInfoClass contorls className used for Button
	const [credentialClass, setCredentialClass] = useState(
		'editeventmanager-grey'
	);
	const [stripe, setStripe] = useState(false);
	const [stripeClass, setStripeClass] = useState(
		'editeventmanager-grey'
	);
	const [account, setAccount] = useState(false);
	const [accountClass, setAccountClass] = useState(
		'editeventmanager-grey'
	);

	const [stripeConnectURL, setStripeConnectURL] = useState();

	const getStripeConnectURL = url => {
		setStripeConnectURL(url);
	};

	useEffect(() => {
		if (stripeConnectURL) {
			console.log('found stripe URL = ', stripeConnectURL);
			clubAuthContext.setClubRedirectURL(stripeConnectURL);
			history.push('/stripeConnect/');
		}
	}, [stripeConnectURL]);

	const credentialClickHandler = () => {
		setCredential(true);
		setCredentialClass('editeventmanager-orange');
		setStripe(false);
		setStripeClass('editeventmanager-grey');
		setAccount(false);
		setAccountClass('editeventmanager-grey');
	};
	const stripeClickHandler = () => {
		setCredential(false);
		setCredentialClass('editeventmanager-grey');
		setStripe(true);
		setStripeClass('editeventmanager-orange');
		setAccount(false);
		setAccountClass('editeventmanager-grey');
	};

	const accountClickHandler = () => {
		setCredential(false);
		setCredentialClass('editeventmanager-grey');
		setStripe(false);
		setStripeClass('editeventmanager-grey');
		setAccount(true);
		setAccountClass('editeventmanager-orange');
	};

	// set defualt page, if none is false, we will use eventInfo as default
	if (!credential && !stripe && !account) {
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
							size={stripeClass}
							autoFocus
							onClick={stripeClickHandler}>
							Stripe
						</Button>
						<Button
							size={accountClass}
							autoFocus
							onClick={accountClickHandler}>
							Payment
						</Button>
					</ul>
					<div className="tab-content">
						{credential && <ClubCredential />}
						{stripe && (
							<ClubStripe getStripeConnectURL={getStripeConnectURL} />
						)}
						{account && <ClubAccount />}
					</div>
				</div>
			</div>

			{/* {stripeConnectURL && (
				<RedirectExternalURL url={stripeConnectURL} />
			)} */}
		</React.Fragment>
	);
};

export default ClubAccountManager;
