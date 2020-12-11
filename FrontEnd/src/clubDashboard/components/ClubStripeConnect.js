import React, { useContext, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';

import '../../shared/css/EventForm.css';
import './ClubManager.css';

const ClubStripeConnect = () => {
	let clubId = useParams().clubId;
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const clubAuthContext = useContext(ClubAuthContext);

	// authentication check check whether club has logged in
	useClubLoginValidation(`/clubs/accountManager/${clubId}`);

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

	const [stripeReceived, setStripeReceived] = useState(false);
	const [stripeConnectStat, setStripeConnectStat] = useState(false);
	useEffect(() => {
		const getStripeDetailsSubmitted = async () => {
			try {
				// let mounted = true;
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + `/stripe/webhook`,
					'POST',
					null,
					{
						'Content-Type': 'application/json',
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
				let account = responseData.account;
				console.log('responseData = ', responseData);
				console.log('responseData.account = ', responseData.account);
				console.log(
					'responseData.received = ',
					responseData.received
				);

				if (account.details_submitted) {
					// Club has completed stripe account details
					setStripeConnectStat(true);
				}
			} catch (err) {
				console.log(' err= ', err);
			}
		};
		getStripeDetailsSubmitted();
	}, [setStripeReceived, setStripeConnectStat, sendRequest]);

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{stripeReceived &&
				stripeConnectStat(
					<div>
						<p>
							Congratulations! Your stripe account is now connected
							with MYSeatTime. You are ready to post events.
						</p>
					</div>
				)}
			{stripeReceived && !stripeConnectStat && (
				<div>
					<p>
						Your setup is not completed. Please login Stripe to
						complete the required information.
					</p>
				</div>
			)}
		</React.Fragment>
	);
};

export default ClubStripeConnect;
