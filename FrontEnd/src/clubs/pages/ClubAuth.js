import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { Field, Form, Formik } from 'formik';
import ImageUploader from '../../shared/components/FormElements/ImageUploader';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';

const ClubAuth = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	const [isLoginMode, setIsLoginMode] = useState(true);
	const [passwordError, setPasswordError] = useState();
	const [imageValid, setImageValid] = useState();
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const switchModeHandler = () => {
		setIsLoginMode(prevMode => !prevMode);
	};

	const history = useHistory();
	const clubSubmitHandler = async values => {
		// meaning we don't want to reload the page after form submission
		// all the input values stay intact on the form
		// event.preventDefault();

		if (isLoginMode) {
			try {
				// use custom hook. send login request to Backend
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + '/clubs/login',
					'POST',
					JSON.stringify({
						email: values.email,
						password: values.password
					}),
					{
						'Content-Type': 'application/json'
					}
				);

				console.log(
					'clubRedirect = ',
					clubAuthContext.clubRedirectURL
				);
				if (clubAuthContext.clubRedirectURL) {
					console.log('inside clubRedirect');
					clubAuthContext.clubLogin(
						responseData.token,
						responseData.clubId,
						responseData.name,
						responseData.image
					);
					history.push(clubAuthContext.clubRedirectURL);
				} else {
					/**
					 * Need to put redirect before calling clubAuthContext.clubLogin(responseData.club.id).
					 * Otherwise App.js has ClubAuthContext.provider will re-render App and go to
					 * <Redirect to="/"> If we have components that send http request in that Route
					 * the http request will be aborted and got a warning:
					 * Warning: Can't perform a React state update on an unmounted component. when
					 * trying to redirect page after logging
					 */

					history.push(`/clubs/clubManager/`);
					// club.id is coming from clubsController loginClub
					// id is from {getters: true}
					clubAuthContext.clubLogin(
						responseData.clubId,
						responseData.name,
						responseData.token
					);
				}
			} catch (err) {
				// empty. Custom hook takes care of it already
				console.log('ClubAuth err= ', err);
			}
		} else {
			//club signup
			try {
				// matching passwords
				if (values.password !== values.passwordValidation) {
					setPasswordError('Passwords do not match!');
					throw new Error('password no match');
				}

				// FormData() is a browser API. We can append text or binary data to FormData
				const formData = new FormData();
				formData.append('email', values.email);
				formData.append('name', values.name);
				formData.append('password', values.password);
				formData.append(
					'passwordValidation',
					values.passwordValidation
				);
				formData.append('clubImage', values.image);

				// the request needs to match backend clubsRoutes /signup route
				// With fromData, headers cannot be {Content-Type: application/json}
				await sendRequest(
					process.env.REACT_APP_BACKEND_URL + '/clubs/signup',
					'POST',
					formData
				);
				// set isLoginMode  to true to render login page
				setIsLoginMode(true);
			} catch (err) {
				console.log('ClubAuth error = ', err);
			}
		}
	};
	const clearErr = () => {
		clearError();
		setPasswordError(null);
	};

	// Formik section
	const initialValues = {
		name: '',
		email: '',
		image: undefined,
		password: '',
		passwordValidation: ''
	};
	const validateClubName = value => {
		let error;
		if (!value) {
			error = 'Club Name is required.';
		}
		return error;
	};
	const validateEmail = value => {
		let error;
		if (!value) {
			error = 'Email is required.';
		} else {
			const pattern = /[a-z0-9A-Z!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9A-Z!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
			if (!pattern.test(value)) {
				error = 'Please enter a valid email';
			}
		}
		return error;
	};
	const validatePassword = value => {
		let error;
		if (!value) {
			error = 'Password is required.';
		} else if (value.length < 6) {
			error = 'Minimum password length is 6 characters.';
		}
		return error;
	};
	const validateImage = value => {
		let error;
		if (value && value.size > 1500000) {
			error = 'File size needs to be smaller than 1.5MB';
			setImageValid(false);
		} else {
			setImageValid(true);
		}
		return error;
	};

	const clubAuthForm = values => (
		<div className="auth-div">
			<h4 className="auth-form-header">
				<i className="fas fa-car"></i>&nbsp;Club Login
			</h4>
			<hr className="auth-form--hr" />

			<Formik
				initialValues={initialValues}
				onSubmit={clubSubmitHandler}>
				{({ errors, isValid, touched }) => (
					<Form className="auth-from-container">
						<div>
							<label htmlFor="email" className="auth-form-label">
								Email
							</label>
							<Field
								id="email"
								name="email"
								type="text"
								validate={validateEmail}
								className="auth-form-input"
								autoComplete="username"
							/>
							{touched.email && errors.email && (
								<div className="auth-form-error">{errors.email}</div>
							)}
						</div>
						<div>
							<label htmlFor="password" className="auth-form-label">
								Password
							</label>
							<Field
								id="password"
								name="password"
								type="password"
								validate={validatePassword}
								className="auth-form-input"
								autoComplete="new-password"
							/>
							{touched.password && errors.password && (
								<div className="auth-form-error">
									{errors.password}
								</div>
							)}
						</div>
						<Button disabled={!isValid} type="submit" size="small">
							LOGIN
						</Button>
						<Button size="small" to="/">
							CANCEL
						</Button>
					</Form>
				)}
			</Formik>
		</div>
	);

	const clubSignupForm = values => (
		<div className="auth-div">
			<h4 className="auth-form-header">
				<i className="fas fa-flag-checkered" />
				&nbsp;Sign up a new account
			</h4>
			<hr className="auth-form--hr" />

			<Formik
				initialValues={initialValues}
				onSubmit={clubSubmitHandler}>
				{({
					errors,
					isValid,
					touched,
					setFieldValue,
					handleBlur
				}) => (
					<Form className="auth-from-container">
						<div>
							<label htmlFor="name" className="auth-form-label">
								Club Name (Name cannot be modified once the account
								being created)
							</label>
							<Field
								id="name"
								name="name"
								type="text"
								validate={validateClubName}
								className="auth-form-input"
							/>
							{touched.name && errors.name && (
								<div className="auth-form-error">{errors.name}</div>
							)}
						</div>
						<div>
							<label htmlFor="email" className="auth-form-label">
								Email (Please use a private email address that is
								different from your club public email)
							</label>
							<Field
								id="email"
								name="email"
								type="text"
								validate={validateEmail}
								className="auth-form-input"
								autoComplete="username"
							/>
							{touched.email && errors.email && (
								<div className="auth-form-error">{errors.email}</div>
							)}
						</div>
						<Field
							id="image"
							name="image"
							title="Club Logo"
							component={ImageUploader}
							validate={validateImage}
							setFieldValue={setFieldValue}
							errorMessage={errors.image ? errors.image : ''}
							onBlur={event => {
								handleBlur(event);
							}}
							labelStyle="auth-form-label"
							inputStyle="auth-form-input"
							previewStyle="auth-form-image-upload__preview"
							errorStyle="auth-form-error"
						/>

						<div>
							<label htmlFor="password" className="auth-form-label">
								Password (minimum 6 characters)
							</label>
							<Field
								id="password"
								name="password"
								type="password"
								validate={validatePassword}
								className="auth-form-input"
								autoComplete="new-password"
							/>
							{touched.password && errors.password && (
								<div className="auth-form-error">
									{errors.password}
								</div>
							)}
						</div>
						<div>
							<label
								htmlFor="passwordValidation"
								className="auth-form-label">
								Please re-enter password
							</label>
							<Field
								id="passwordValidation"
								name="passwordValidation"
								type="password"
								validate={validatePassword}
								className="auth-form-input"
							/>
							{touched.passwordValidation &&
								errors.passwordValidation && (
									<div className="auth-form-error">
										{errors.passwordValidation}
									</div>
								)}
						</div>
						<Button size="small" disabled={!isValid} type="submit">
							Signup
						</Button>
						<Button to="/" size="small">
							CANCEL
						</Button>
					</Form>
				)}
			</Formik>
		</div>
	);
	return (
		<React.Fragment>
			{/* error coming from const [error, setError] = useState(); */}
			<ErrorModal error={error || passwordError} onClear={clearErr} />
			{isLoading && <LoadingSpinner asOverlay />}
			{isLoginMode && clubAuthForm()}
			{!isLoginMode && clubSignupForm()}
			<div className="auth-footer-div">
				<p>No Account? Please sign up a new account.</p>
				{/* <Button inverse to="/clubs/signup">
					SIGNUP
				</Button> */}
				<Button size="small" inverse onClick={switchModeHandler}>
					SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
				</Button>
			</div>
		</React.Fragment>
	);
};

export default ClubAuth;
