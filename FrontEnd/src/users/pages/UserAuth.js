import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import Input from '../../shared/components/FormElements/Input';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';

import { UserAuthContext } from '../../shared/context/auth-context';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import {
	VALIDATOR_REQUIRE,
	VALIDATOR_EMAIL,
	VALIDATOR_MINLENGTH
} from '../../shared/util/validators';

import './UserAuth.css';

const UserAuth = () => {
	const userAuthContext = useContext(UserAuthContext);
	const [isLoginMode, setIsLoginMode] = useState(true);
	const [isSignUp, setIsSignup] = useState(false);
	const [passwordError, setPasswordError] = useState();
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	/**
	 * Flow of usage of useForm:
	 * setFormData: set initial form value
	 * inputHandler: will be called in each <Input /> and <ImageUpload />. When there is an input
	 * 				 useForm will get the input value and put it in the formState
	 * formState: return value that contains all the form field values (including the other fields)
	 */
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
		if (isLoginMode) {
			// login mode
			setFormData(
				{
					// when we switch from signup to login
					// name, image, and passwordValidation are gone
					// so we need to set their value to '' and isValid: false
					...formState.inputs,
					name: {
						value: '',
						isValid: false
					},
					image: {
						value: null,
						isValid: false
					},
					passwordValidation: {
						value: '',
						isValid: false
					}
				},
				false
			);
		} else {
			// signup mode
			setFormData(
				{
					...formState.inputs,
					// set to undefined because the value was set in login mode
					name: undefined,
					image: undefined,
					passwordValidation: undefined
				},
				formState.inputs.email.isValid &&
					formState.inputs.password.isValid
			);
		}
		setIsLoginMode(prevMode => !prevMode);
	};

	const history = useHistory();
	const userSubmitHandler = async event => {
		// meaning we don't want to reload the page after form submission
		// all the input values stay intact on the form
		event.preventDefault();

		if (isLoginMode) {
			try {
				// use custom hook. send login request to Backend
				const responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + '/users/login',
					'POST',
					JSON.stringify({
						email: formState.inputs.email.value,
						password: formState.inputs.password.value
					}),
					{
						'Content-Type': 'application/json'
					}
				);
				/**
				 * Unlike ClubAuth, here we need to call userAuthContext.userLogin first;
				 * otherwise responseData.userId is not yet available
				 */
				userAuthContext.userLogin(
					responseData.userId,
					responseData.name,
					responseData.token
				);

				history.push(`/events/user/${responseData.userId}`);
			} catch (err) {
				// empty. Custom hook takes care of it already
				console.log('UserAuth err= ', err);
			}
		} else {
			//user signup
			try {
				// matching passwords
				if (
					formState.inputs.password.value !==
					formState.inputs.passwordValidation.value
				) {
					setPasswordError('Passwords do not match!');
					throw new Error('password no match');
				}

				// FormData() is a browser API. We can append text or binary data to FormData
				const formData = new FormData();
				formData.append('email', formState.inputs.email.value);
				formData.append('name', formState.inputs.name.value);
				formData.append('password', formState.inputs.password.value);
				formData.append(
					'passwordValidation',
					formState.inputs.passwordValidation.value
				);
				formData.append('image', formState.inputs.image.value);

				// the request needs to match backend usersRoutes /signup route
				// With fromData, headers cannot be {Content-Type: application/json}
				await sendRequest(
					process.env.REACT_APP_BACKEND_URL + '/users/signup',
					'POST',
					formData
				);
				// set isLoginMode and isSignUp to true to render login page
				setIsLoginMode(true);
				setIsSignup(true);
			} catch (err) {
				console.log('err2 = ', err);
			}
		}
	};
	const clearErr = () => {
		clearError();
		setPasswordError(null);
	};
	// set Card title
	const cardTitle = isLoginMode
		? isSignUp
			? 'Account created. Please login'
			: 'User Login'
		: 'User Signup';

	return (
		<React.Fragment>
			{/* error coming from const [error, setError] = useState(); */}
			<ErrorModal error={error || passwordError} onClear={clearErr} />
			<Card className="authentication" title={cardTitle}>
				{isLoading && <LoadingSpinner asOverlay />}
				<form
					title="User Authentication"
					onSubmit={userSubmitHandler}>
					{!isLoginMode && (
						<Input
							element="input"
							id="name"
							type="text"
							label="User Name"
							validators={[VALIDATOR_REQUIRE()]}
							errorText="Please enter user name."
							onInput={inputHandler}
						/>
					)}
					{!isLoginMode && (
						<ImageUpload
							center
							id="image"
							onInput={inputHandler}
							errorText="Please provide a user image"
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
					{!isLoginMode && (
						<Input
							id="passwordValidation"
							element="input"
							type="password"
							label="Please type password again"
							validators={[VALIDATOR_MINLENGTH(6)]}
							errorText="Please make sure passwords match."
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
				{/* <Button inverse  to="/users/signup">
				SIGNUP
			</Button> */}
				<Button inverse onClick={switchModeHandler}>
					SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
				</Button>
			</Card>
		</React.Fragment>
	);
};

export default UserAuth;
