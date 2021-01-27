import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import { useHttpClient } from '../../shared/hooks/http-hook';

import '../../shared/css/Events.css';

const UserVerificationRequest = () => {
	let email = useParams().email;
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [userNotFound, setUserNotFound] = useState(false);
	const [resendStatus, setResendStatus] = useState(true);
	const [isVerified, setIsVerified] = useState(false);
	const resendHandler = async () => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/users/verificationRequest/${email}/`,
				'GET',
				null,
				{ 'Content-type': 'application/json' }
			);
			if (!responseData.user) {
				setUserNotFound(true);
				setResendStatus(false);
			} else if (responseData.resendStatus) {
				setResendStatus(true);
			} else if (responseData.verified) {
				setResendStatus(false);
				setIsVerified(true);
			}
		} catch (err) {}
	};
	useEffect(() => {
		resendHandler();
	}, []);

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{userNotFound && (
				<div className="search-page-header">
					<h5>
						Your user account is not found. Please sign up again.
					</h5>
				</div>
			)}
			{!resendStatus && (
				<div className="search-page-header">
					<h5>
						You have not verified your account yet. Please request to
						resend the verification link to your email account.
					</h5>
					<Button size="medium" onClick={resendHandler}>
						RESEND
					</Button>
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
			{isVerified && (
				<div className="search-page-header">
					<h5>Your account is now verified. Please log in.</h5>
				</div>
			)}
		</React.Fragment>
	);
};

export default UserVerificationRequest;
