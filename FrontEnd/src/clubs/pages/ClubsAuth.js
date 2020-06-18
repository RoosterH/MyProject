import React, { useState, useContext } from 'react';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import Input from '../../shared/components/FormElements/Input';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { useForm } from '../../shared/hooks/form-hook';
import {
	VALIDATOR_REQUIRE,
	VALIDATOR_MINLENGTH
} from '../../shared/util/validators';

import './ClubsAuth.css';

const ClubAuth = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	const [isLoginMode, setIsLoginMode] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState();

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

	const eventSubmitHandler = async event => {
		// meaning we don't want to reload the page after form submission
		// all the input values stay intact on the form
		event.preventDefault();
		setIsLoading(true);
		if (isLoginMode) {
			try {
				// fetch sends a http request to backend
				// the request needs to match backend clubsRoutes /signup route
				const response = await fetch(
					'http://localhost:5000/api/clubs/login',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							email: formState.inputs.email.value,
							password: formState.inputs.password.value
						})
					}
				);

				// parse the response body, this is the response back from back
				const responseData = await response.json();
				// response with 400/500 status code
				if (!response.ok) {
					throw new Error(responseData.message);
				}
				setIsLoading(false);
				clubAuthContext.clubLogin();
			} catch (err) {
				setIsLoading(false);
				setError(
					err.message || 'System failure, please try again later.'
				);
			}
		} else {
			try {
				// fetch sends a http request to backend
				// the request needs to match backend clubsRoutes /signup route
				const response = await fetch(
					'http://localhost:5000/api/clubs/signup',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							name: formState.inputs.name.value,
							email: formState.inputs.email.value,
							password: formState.inputs.password.value
						})
					}
				);

				// parse the response body, this is the response back from back
				const responseData = await response.json();
				// response with 400/500 status code
				if (!response.ok) {
					throw new Error(responseData.message);
				}
				setIsLoading(false);
				clubAuthContext.clubLogin();
			} catch (err) {
				setIsLoading(false);
				setError(
					err.message || 'System failure, please try again later.'
				);
			}
		}
	};

	const errorHandler = () => {
		setError(null);
	};
	return (
		<React.Fragment>
			{/* error coming from const [error, setError] = useState(); */}
			<ErrorModal error={error} onClear={errorHandler} />
			<Card className="authentication">
				{isLoading && <LoadingSpinner asOverlay />}
				<form title="Club Login" onSubmit={eventSubmitHandler}>
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
						validators={[VALIDATOR_REQUIRE()]}
						errorText="Please enter a valid club email."
						onInput={inputHandler}
					/>
					<Input
						id="password"
						element="input"
						type="password"
						label="Password"
						validators={[VALIDATOR_MINLENGTH(5)]}
						errorText="Please enter a valid password."
						onInput={inputHandler}
					/>
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
