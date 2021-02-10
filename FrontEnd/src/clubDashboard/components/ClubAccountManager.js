import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '../../shared/components/FormElements/Button';
import ClubCredential from './ClubCredential';
import ClubStripe from './ClubStripe';
import ClubSES from './ClubSES';
import ClubPayment from './ClubPayment';
import ClubSettings from './ClubSettings';
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
	const [ses, setSES] = useState(false);
	const [sesClass, setSESClass] = useState('editeventmanager-grey');
	const [payment, setPayment] = useState(false);
	const [paymentClass, setPaymentClass] = useState(
		'editeventmanager-grey'
	);
	const [clubSettings, setClubSettings] = useState(false);
	const [clubSettingsClass, setClubSettingsClass] = useState(
		'editeventmanager-grey'
	);

	const [stripeConnectURL, setStripeConnectURL] = useState();

	const getStripeConnectURL = url => {
		setStripeConnectURL(url);
	};

	useEffect(() => {
		if (stripeConnectURL) {
			clubAuthContext.setClubRedirectURL(stripeConnectURL);
			history.push('/stripeConnect/');
		}
	}, [stripeConnectURL]);

	const credentialClickHandler = () => {
		setCredential(true);
		setCredentialClass('editeventmanager-orange');
		setStripe(false);
		setStripeClass('editeventmanager-grey');
		setSES(false);
		setSESClass('editeventmanager-grey');
		setPayment(false);
		setPaymentClass('editeventmanager-grey');
		setClubSettings(false);
		setClubSettingsClass('editeventmanager-grey');
	};

	const stripeClickHandler = () => {
		setCredential(false);
		setCredentialClass('editeventmanager-grey');
		setStripe(true);
		setStripeClass('editeventmanager-orange');
		setSES(false);
		setSESClass('editeventmanager-grey');
		setPayment(false);
		setPaymentClass('editeventmanager-grey');
		setClubSettings(false);
		setClubSettingsClass('editeventmanager-grey');
	};

	const sesClickHandler = () => {
		setCredential(false);
		setCredentialClass('editeventmanager-grey');
		setStripe(false);
		setStripeClass('editeventmanager-grey');
		setSES(true);
		setSESClass('editeventmanager-orange');
		setPayment(false);
		setPaymentClass('editeventmanager-grey');
		setClubSettings(false);
		setClubSettingsClass('editeventmanager-grey');
	};

	const paymentClickHandler = () => {
		setCredential(false);
		setCredentialClass('editeventmanager-grey');
		setStripe(false);
		setStripeClass('editeventmanager-grey');
		setSES(false);
		setSESClass('editeventmanager-grey');
		setPayment(true);
		setPaymentClass('editeventmanager-orange');
		setClubSettings(false);
		setClubSettingsClass('editeventmanager-grey');
	};

	const clubSettingsClickHandler = () => {
		setCredential(false);
		setCredentialClass('editeventmanager-grey');
		setStripe(false);
		setStripeClass('editeventmanager-grey');
		setSES(false);
		setSESClass('editeventmanager-grey');
		setPayment(false);
		setPaymentClass('editeventmanager-grey');
		setClubSettings(true);
		setClubSettingsClass('editeventmanager-orange');
	};

	// set defualt page, if none is false, we will use eventInfo as default
	if (!credential && !stripe && !ses && !payment && !clubSettings) {
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
							size={sesClass}
							autoFocus
							onClick={sesClickHandler}>
							Email
						</Button>
						<Button
							size={paymentClass}
							autoFocus
							onClick={paymentClickHandler}>
							Payment
						</Button>
						<Button
							size={clubSettingsClass}
							autoFocus
							onClick={clubSettingsClickHandler}>
							Club Settings
						</Button>
					</ul>
					<div className="tab-content">
						{credential && <ClubCredential />}
						{stripe && (
							<ClubStripe getStripeConnectURL={getStripeConnectURL} />
						)}
						{ses && <ClubSES />}
						{payment && <ClubPayment />}
						{clubSettings && <ClubSettings />}
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
