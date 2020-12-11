import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';

import '../../shared/css/EventForm.css';
import './ClubManager.css';

const ClubStripe = props => {
	const history = useHistory();
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const clubAuthContext = useContext(ClubAuthContext);
	const clubId = clubAuthContext.clubId;

	// authentication check check whether club has logged in
	useClubLoginValidation(`/clubs/accountManager/${clubId}`);

	const [stripeButtonText, setStripeButtonText] = useState(
		'Setup Payouts on Stripe'
	);
	const [stripeConnectURL, setStripeConnectURL] = useState();

	// If we are re-directing to this page, we want to clear up clubRedirectURL
	let location = useLocation();
	let path;
	useEffect(() => {
		path = location.pathname;
		let clubRedirectURL = clubAuthContext.clubRedirectURL;
		if (path === clubRedirectURL) {
			// re-init redirectURL after re-direction route
			clubAuthContext.setClubRedirectURL(null);
		}
	}, [location]);

	const [stripeAccount, setStripeAccount] = useState();
	// check if club has stripe account created
	useEffect(() => {
		const getStripeAccount = async values => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/stripeAccount/${clubId}`,
					'GET',
					null,
					{
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
				setStripeAccount(responseData.stripeAccount);
			} catch (err) {}
		};
		getStripeAccount();
	}, []);

	// check if stripe account has completed setup
	const [detailsSubmitted, setDetailsSubmitted] = useState(false);
	const [chargesEnabled, setChargesEnabled] = useState(false);

	useEffect(() => {
		if (stripeAccount) {
			if (stripeAccount.details_submitted) {
				setDetailsSubmitted(true);
			}
			if (stripeAccount.charges_enabled) {
				setChargesEnabled(true);
			}
		}
	}, [stripeAccount, setDetailsSubmitted]);

	const connectWithStripeHandler = async () => {
		let mounted = true;
		try {
			// let mounted = true;
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/stripe/connect`,
				'GET',
				null,
				{
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			// re-direct to connect to setup account
			if (mounted && responseData.url) {
				// setStripeConnectURL(responseData.url);
				clubAuthContext.setClubRedirectURL(responseData.url);
				history.push('/stripeConnect');
			}
		} catch (err) {
			console.log(' err= ', err);
		}
		return () => {
			mounted = false;
		};
	};

	useEffect(() => {
		if (stripeConnectURL) {
			props.getStripeConnectURL(stripeConnectURL);
		}
	}, [
		stripeConnectURL,
		props.getStripeConnectURL,
		clubAuthContext,
		history
	]);

	if (isLoading) {
		return (
			<div className="center">
				<LoadingSpinner />
			</div>
		);
	}

	const accountForm = () => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>Setup Stripe Connect Account</h4>
				<hr className="event-form__hr" />
			</div>
			<div className="stripeconnect-container">
				{stripeAccount && detailsSubmitted && chargesEnabled && (
					<p className="stripeMessage">
						Congratulations! Your stripe account is now connected with
						MYSeatTime. You are ready to post events now. Entry fee
						will be automatically sent to your Stripe account after
						customers been charged.
					</p>
				)}
				{stripeAccount && detailsSubmitted && !chargesEnabled && (
					<p className="stripeMessageErr">
						Your Stripe Connect Account setup has missing required
						information! Please{' '}
						{/* with noopener it opens link in a new tab */}
						<a
							rel="noopener noreferrer"
							href="https://dashboard.stripe.com"
							target="_blank">
							login Stripe
						</a>{' '}
						to complete it. If you do not see any reminder message on
						top of Stripe Dashoard, please wait for 30 minutes to
						check again.
					</p>
				)}
				{stripeAccount && !detailsSubmitted && (
					<React.Fragment>
						<p className="stripeMessageErr">
							Your Stripe Connect Account setup has not been completed
							yet! Press the button to continue it.
						</p>
						<Button
							onClick={connectWithStripeHandler}
							className="stripeconnect">
							{stripeButtonText}
						</Button>
					</React.Fragment>
				)}
				{!stripeAccount && (
					<Button
						onClick={connectWithStripeHandler}
						className="stripeconnect">
						{stripeButtonText}
					</Button>
				)}
			</div>
		</div>
	);

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{!isLoading && accountForm()}
		</React.Fragment>
	);
};

export default ClubStripe;
