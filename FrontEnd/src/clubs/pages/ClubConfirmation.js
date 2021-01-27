import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import { useHttpClient } from '../../shared/hooks/http-hook';

import '../../shared/css/Events.css';

const ClubConfirmation = () => {
	let email = useParams().email;
	let token = useParams().token;
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [clubNotFound, setClubNotFound] = useState(false);
	const [showResend, setShowResend] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	useEffect(() => {
		const verifyClubAccount = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/confirmation/${email}/${token}`,
					'GET',
					null,
					{ 'Content-type': 'application/json' }
				);
				if (!responseData.club) {
					setClubNotFound(true);
				} else if (!responseData.token) {
					setShowResend(true);
				} else if (responseData.verified) {
					setIsVerified(true);
				}
			} catch (err) {}
		};
		verifyClubAccount();
	}, []);

	const [resendStatus, setResendStatus] = useState(false);
	const resendHandler = async () => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/clubs/confirmationRequest/${email}/`,
				'GET',
				null,
				{ 'Content-type': 'application/json' }
			);
			if (!responseData.club) {
				setClubNotFound(true);
				setShowResend(false);
			} else if (responseData.verified) {
				setIsVerified(true);
				setShowResend(false);
			} else if (responseData.resendStatus) {
				setResendStatus(true);
				setShowResend(false);
			}
		} catch (err) {}
	};

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{clubNotFound && (
				<div className="search-page-header">
					<h5>
						Your club account is not found. Please sign up again.
					</h5>
				</div>
			)}
			{showResend && (
				<div className="search-page-header">
					<h5>
						Your email verification link may have expired. Please
						request it again.
					</h5>
					<Button size="medium" onClick={resendHandler}>
						RESEND
					</Button>
				</div>
			)}
			{isVerified && (
				<div className="search-page-header">
					<h5>Your account is now verified. Please log in.</h5>
				</div>
			)}
			{resendStatus && (
				<div className="search-page-header">
					<h5>
						We have sent a verification link to your email. Please
						verify it. If you don't receive the email, please request
						it again.
					</h5>
					<Button size="medium" onClick={resendHandler}>
						RESEND
					</Button>
				</div>
			)}
		</React.Fragment>
	);
};

export default ClubConfirmation;
