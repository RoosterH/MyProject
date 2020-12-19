import React, { useState, useContext, useEffect } from 'react';
import {
	useStripe,
	useElements,
	CardElement
} from '@stripe/react-stripe-js';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { UserAuthContext } from '../../shared/context/auth-context';

import './CardSectionStyles.css';
const PAID = 'Paid';

const CardAuthentication = props => {
	const entryId = props.entryId;
	const stripe = useStripe();
	const [stripeLoading, setStripeLoading] = useState(false);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const userAuthContext = useContext(UserAuthContext);
	const [clientSecret, setClientSecret] = useState();
	const [setupIntentId, setSetupIntentId] = useState();
	const [
		authenticationButtonText,
		setAuthenticationButtonText
	] = useState('Authenticate Charge');

	const onclearCallBack = () => {
		clearError();
	};

	const authenticationHandler = async () => {
		setStripeLoading(true);
		const [
			responseData,
			responseStatus,
			responseMessage
		] = await sendRequest(
			process.env.REACT_APP_BACKEND_URL +
				`/entries/authentication/${entryId}`,
			'GET',
			null,
			{
				// adding JWT to header for authentication
				Authorization: 'Bearer ' + userAuthContext.userToken
			}
		);
		let clientSecret = responseData.clientSecret;
		let paymentMethodId = responseData.paymentMethodId;

		// Pass the failed PaymentIntent to your client from your server
		let result = await stripe.confirmCardPayment(clientSecret, {
			payment_method: paymentMethodId
		});

		if (result.error) {
			console.log('1860 err = ', result.error);
			console.log(
				'1861 result.paymentIntent.status = ',
				result.paymentIntent.status
			);
			error = result.error;
		}
		if (result.paymentIntent.status === 'succeeded') {
			// update paymentStatus to backend
			console.log('succeeded');
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/entries/paymentStatus/${entryId}`,
				'POST',
				JSON.stringify({
					paymentStatus: PAID
				}),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);
			if (responseData.paymentStatus === PAID) {
				setAuthenticationButtonText(PAID);
				props.updatePaymentStatus(PAID);
			}
		}

		setStripeLoading(false);
	};

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={onclearCallBack} />
			{(isLoading || stripeLoading) && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}

			{/* <form onSubmit={handleSubmit} className="cardform"> */}
			<div className="cardform">
				<Button
					onClick={authenticationHandler}
					size="small-block-payment"
					disabled={
						stripeLoading || authenticationButtonText === PAID
					}>
					{authenticationButtonText}
				</Button>
			</div>
		</React.Fragment>
	);
};

export default CardAuthentication;
