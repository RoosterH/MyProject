import React, { useState, useContext } from 'react';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import Input from '../../shared/components/FormElements/Input';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { UserAuthContext } from '../../shared/context/auth-context';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import {
	VALIDATOR_REQUIRE,
	VALIDATOR_EMAIL,
	VALIDATOR_MINLENGTH
} from '../../shared/util/validators';

import './UsersAuth.css';

const UserAuth = () => {
	const userAuthContext = useContext(UserAuthContext);
	const [isLoginMode, setIsLoginMode] = useState(true);
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

	const userSubmitHandler = async event => {
		// meaning we don't want to reload the page after form submission
		// all the input values stay intact on the form
		event.preventDefault();

		if (isLoginMode) {
			try {
				// use custom hook.
				await sendRequest(
					'http://localhost:5000/api/users/login',

					'POST',
					{
						'Content-Type': 'application/json'
					},
					JSON.stringify({
						email: formState.inputs.email.value,
						password: formState.inputs.password.value
					})
				);
				userAuthContext.clubLogin();
			} catch (err) {
				// empty. Custom hook takes care of it already
			}
		} else {
			try {
				// the request needs to match backend clubsRoutes /signup route
				await sendRequest(
					'http://localhost:5000/api/users/signup',
					'POST',
					JSON.stringify({
						name: formState.inputs.name.value,
						email: formState.inputs.email.value,
						password: formState.inputs.password.value
					}),
					{
						'Content-Type': 'application/json'
					}
				);

				userAuthContext.userLogin();
			} catch (err) {}
		}
	};

	// set Card title
	const cardTitle = isLoginMode ? 'Driver Login' : 'Driver Signup';

	return (
		<React.Fragment>
			{/* error coming from const [error, setError] = useState(); */}
			<ErrorModal error={error} onClear={clearError} />
			<Card className="authentication" title={cardTitle}>
				{isLoading && <LoadingSpinner asOverlay />}
				<form title="Driver Login" onSubmit={userSubmitHandler}>
					{!isLoginMode && (
						<Input
							element="input"
							id="name"
							type="text"
							label="User Name"
							validators={[VALIDATOR_REQUIRE()]}
							errorText="Please enter username."
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
					<Input
						id="password"
						element="input"
						type="password"
						label="Password"
						validators={[VALIDATOR_MINLENGTH(6)]}
						errorText="Please enter a valid password."
						onInput={inputHandler}
					/>
					<Button disabled={!formState.isValid}>
						{isLoginMode ? 'LOGIN' : 'SIGNUP'}
					</Button>
					<Button to="/">CANCEL</Button>
				</form>
				<p>No Account? Please sign up a new account.</p>
				<Button inverse onClick={switchModeHandler}>
					SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
				</Button>
			</Card>
		</React.Fragment>
	);
};

export default UserAuth;
