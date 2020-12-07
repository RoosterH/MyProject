import React, { useState, useContext, useEffect } from 'react';
import {
	useStripe,
	useElements,
	CardElement
} from '@stripe/react-stripe-js';

import Button from '../../shared/components/FormElements/Button';
import CardSection from './CardSection';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { UserAuthContext } from '../../shared/context/auth-context';

import './CardSectionStyles.css';

const CardSetupForm = props => {
	const stripe = useStripe();
	const elements = useElements();
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
	const [email, setEmail] = useState();
	const [submitted, setSubmitted] = useState(false);

	const onclearCallBack = () => {
		clearError();
	};

	// request backend to create setupIntent, we need client_secret and intentId
	useEffect(() => {
		const getSetupIntent = async () => {
			let responseData, responseStatus, responseMessage;
			try {
				[
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + `/stripe/setupIntent/`,
					'POST',
					JSON.stringify({
						eventId: props.eventId
					}),
					{
						'Content-type': 'application/json',
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + userAuthContext.userToken
					}
				);
			} catch (err) {
				console.log('err = ', err);
			}
			console.log(
				'responseData.setupIntent.client_secret = ',
				responseData.setupIntent.client_secret
			);
			console.log(
				'responseData.setupIntent.id = ',
				responseData.setupIntent.id
			);
			setClientSecret(responseData.setupIntent.client_secret);
			setSetupIntentId(responseData.setupIntent.id);
			setEmail(responseData.email);
		};
		if (userAuthContext.userToken) {
			getSetupIntent();
		}
	}, [
		setClientSecret,
		setSetupIntentId,
		userAuthContext.userToken,
		props.eventId,
		sendRequest
	]);

	useEffect(() => {
		props.getStripeSetupIntentId(setupIntentId);
	}, [props.getStripeSetupIntentId, setupIntentId]);

	const handleSubmit = async event => {
		setStripeLoading(true);
		// We don't want to let default form submission happen here,
		// which would refresh the page.
		event.preventDefault();

		if (!stripe || !elements) {
			// Stripe.js has not yet loaded.
			// Make sure to disable form submission until Stripe.js has loaded.
			return;
		}

		const result = await stripe.confirmCardSetup(clientSecret, {
			payment_method: {
				card: elements.getElement(CardElement),
				billing_details: {
					name: props.userName,
					email: email
				}
			}
		});

		if (result.error) {
			setStripeLoading(false);
			// Display result.error.message in your UI.
			console.log('result.error = ', result.error);
			props.getStripeError(result.error);
		} else {
			setStripeLoading(false);
			// The setup has succeeded. Display a success message and send
			// result.setupIntent.payment_method to your server to save the
			// card to a Customer
			console.log(
				'result.setupIntent.payment_method = ',
				result.setupIntent.payment_method
			);
			props.getStripePaymentMethod(result.setupIntent.payment_method);
			setSubmitted(true);
		}
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
				<CardSection />
				<Button
					size="stripe"
					disabled={
						!stripe ||
						!clientSecret ||
						!setupIntentId ||
						isLoading ||
						stripeLoading ||
						submitted
					}
					onClick={handleSubmit}>
					Save Card to Stripe
				</Button>
			</div>
			{/* </form> */}
		</React.Fragment>
	);
};

export default CardSetupForm;
