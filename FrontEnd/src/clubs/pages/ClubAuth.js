import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import Input from '../../shared/components/FormElements/Input';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import {
	VALIDATOR_REQUIRE,
	VALIDATOR_EMAIL,
	VALIDATOR_MINLENGTH
} from '../../shared/util/validators';

import './ClubAuth.css';

const ClubAuth = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	const [isLoginMode, setIsLoginMode] = useState(true);
	const [isSignUp, setIsSignup] = useState(false);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [formState, inputHandler, setFormData] = useForm(
		{
			email: {
				value: '',
				isValid: false
			},
			password: {
				value: '',
				isValid: false
			}
		},
		false
	);

	const switchModeHandler = () => {
		if (!isLoginMode) {
			setFormData(
				{
					...formState.inputs,
					name: undefined
				},
				formState.inputs.email.isValid &&
					formState.inputs.password.isValid
			);
		} else {
			setFormData(
				{
					...formState.inputs,
					name: {
						value: '',
						isValid: false
					}
				},
				false
			);
		}
		setIsLoginMode(prevMode => !prevMode);
	};

	const history = useHistory();
	const clubSubmitHandler = async event => {
		// meaning we don't want to reload the page after form submission
		// all the input values stay intact on the form
		event.preventDefault();

		if (isLoginMode) {
			try {
				// use custom hook.
				const responseData = await sendRequest(
					'http://localhost:5000/api/clubs/login',
					'POST',
					{
						'Content-Type': 'application/json'
					},
					JSON.stringify({
						email: formState.inputs.email.value,
						password: formState.inputs.password.value
					})
				);
				/**
				 * Need to put redirect before calling clubAuthContext.clubLogin(responseData.club.id).
				 * Otherwise App.js has ClubAuthContext.provider will re-render App and go to
				 * <Redirect to="/"> If we have components that send http request in that Route
				 * the http request will be aborted and got a warning:
				 * Warning: Can't perform a React state update on an unmounted component. when
				 * trying to redirect page after logging
				 */
				history.push(`/events/club/${responseData.club.id}`);
				// club.id is coming from clubsController loginClub
				// id is from {getters: true}
				clubAuthContext.clubLogin(
					responseData.club.id,
					responseData.club.name
				);
			} catch (err) {
				// empty. Custom hook takes care of it already
				console.log('ClubAuth err= ', err);
			}
		} else {
			//club signup
			try {
				// the request needs to match backend clubsRoutes /signup route
				await sendRequest(
					'http://localhost:5000/api/clubs/signup',
					'POST',
					{
						'Content-Type': 'application/json'
					},
					JSON.stringify({
						name: formState.inputs.name.value,
						email: formState.inputs.email.value,
						password: formState.inputs.password.value
					})
				);
				// set isLoginMode and isSignUp to true to render login page
				setIsLoginMode(true);
				setIsSignup(true);
			} catch (err) {
				console.log('err2 = ', err);
			}
		}
	};

	// set Card title
	const cardTitle = isLoginMode
		? isSignUp
			? 'Account created. Please login'
			: 'Club Login'
		: 'Club Signup';

	return (
		<React.Fragment>
			{/* error coming from const [error, setError] = useState(); */}
			<ErrorModal error={error} onClear={clearError} />
			<Card className="authentication" title={cardTitle}>
				{isLoading && <LoadingSpinner asOverlay />}
				<form
					title="Club Authentication"
					onSubmit={clubSubmitHandler}>
					{!isLoginMode && (
						<Input
							element="input"
							id="name"
							type="text"
							label="Club Name"
							validators={[VALIDATOR_REQUIRE()]}
							errorText="Please enter club name."
							onInput={inputHandler}
						/>
					)}
					<Input
						id="email"
						element="input"
						type="text"
						label="Email"
						validators={[VALIDATOR_EMAIL()]}
						errorText="Please enter a valid email."
						onInput={inputHandler}
					/>
					{!isLoginMode && (
						<Input
							id="password"
							element="input"
							type="password"
							label="Password (min length 6 letters)"
							validators={[VALIDATOR_MINLENGTH(6)]}
							errorText="Please enter a valid password."
							onInput={inputHandler}
						/>
					)}
					{isLoginMode && (
						<Input
							id="password"
							element="input"
							type="password"
							label="Password"
							validators={[]}
							errorText="Please enter a valid password."
							onInput={inputHandler}
						/>
					)}
					<Button disabled={!formState.isValid}>
						{isLoginMode ? 'LOGIN' : 'SIGNUP'}
					</Button>
					<Button to="/">CANCEL</Button>
				</form>
				<p>No Account? Please sign up a new account.</p>
				{/* <Button inverse  to="/clubs/signup">
				SIGNUP
			</Button> */}
				<Button inverse onClick={switchModeHandler}>
					SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
				</Button>
			</Card>
		</React.Fragment>
	);
};

export default ClubAuth;
