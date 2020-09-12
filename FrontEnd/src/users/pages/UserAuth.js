import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { Field, Form, Formik } from 'formik';
import ImageUploader from '../../shared/components/FormElements/ImageUploader';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { UserAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';

const UserAuth = () => {
	const userAuthContext = useContext(UserAuthContext);
	const [isLoginMode, setIsLoginMode] = useState(true);
	const [passwordError, setPasswordError] = useState();
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
	const userSubmitHandler = async values => {
		// meaning we don't want to reload the page after form submission
		// all the input values stay intact on the form
		// event.preventDefault();

		if (isLoginMode) {
			try {
				// use custom hook. send login request to Backend
				const responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + '/users/login',
					'POST',
					JSON.stringify({
						email: values.email,
						password: values.password
					}),
					{
						'Content-Type': 'application/json'
					}
				);

				if (userAuthContext.userRedirectURL) {
					// for re-direction, we need to set login information to be able to send request to backend
					userAuthContext.userLogin(
						responseData.userId,
						responseData.username,
						responseData.token,
						'',
						responseData.entries,
						responseData.image
					);
					history.push(userAuthContext.userRedirectURL);
				} else {
					/**
					 * Need to put redirect before calling userAuthContext.userLogin(responseData.user.id).
					 * Otherwise App.js has UserAuthContext.provider will re-render App and go to
					 * <Redirect to="/"> If we have components that send http request in that Route
					 * the http request will be aborted and got a warning:
					 * Warning: Can't perform a React state update on an unmounted component. when
					 * trying to redirect page after logging
					 */
					// user.id is coming from usersController loginUser
					// id is from {getters: true}
					userAuthContext.userLogin(
						responseData.userId,
						responseData.username,
						responseData.token,
						'', //expirationDate will be defined in userAuth-hook
						responseData.entries,
						responseData.image
					);
					// forward page needs to be after userAuthContext.userLoging() because <Route> is designed
					// only if (userToken), we are able to access the route
					history.push(`/users/events/${responseData.userId}`);
				}
			} catch (err) {
				// empty. Custom hook takes care of it already
				console.log('UserAuth err= ', err);
			}
		} else {
			//user signup
			try {
				// matching passwords
				if (values.password !== values.passwordValidation) {
					setPasswordError('Passwords do not match!');
					throw new Error('password no match');
				}

				// FormData() is a browser API. We can append text or binary data to FormData
				const formData = new FormData();
				formData.append('username', values.username);
				formData.append('lastname', values.lastname);
				formData.append('firstname', values.firstname);
				formData.append('email', values.email);
				formData.append('password', values.password);
				formData.append(
					'passwordValidation',
					values.passwordValidation
				);
				formData.append('image', values.image);

				// the request needs to match backend usersRoutes /signup route
				// With fromData, headers cannot be {Content-Type: application/json}
				await sendRequest(
					process.env.REACT_APP_BACKEND_URL + '/users/signup',
					'POST',
					formData
				);
				// set isLoginMode to true to render login page
				setIsLoginMode(true);
			} catch (err) {
				console.log('UserAuth error = ', err);
			}
		}
	};
	const clearErr = () => {
		clearError();
		setPasswordError(null);
	};

	// Formik section
	const initialValues = {
		username: '',
		lastname: '',
		firstname: '',
		email: '',
		image: undefined,
		password: '',
		passwordValidation: ''
	};
	const validateUserName = value => {
		let error;
		if (!value) {
			error = 'User Name is required.';
		}
		return error;
	};
	const validateLastName = value => {
		let error;
		if (!value) {
			error = 'Last Name is required.';
		}
		return error;
	};
	const validateFirstName = value => {
		let error;
		if (!value) {
			error = 'First Name is required.';
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
		}
		return error;
	};
	const validateImage = value => {
		let error;
		if (value && value.size > 1500000) {
			error = 'File size needs to be smaller than 1.5MB';
		} else {
		}
		return error;
	};

	const userAuthForm = values => (
		<div className="auth-div">
			<h4 className="auth-form-header">
				<i className="far fa-user" />
				&nbsp;Driver Login
			</h4>
			<hr className="auth-form--hr" />

			<Formik
				initialValues={initialValues}
				onSubmit={userSubmitHandler}>
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
								type="text"
								validate={validatePassword}
								className="auth-form-input"
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

	const userSignupForm = values => (
		<div className="auth-div">
			<h4 className="auth-form-header">
				<i className="fas fa-user-plus" />
				&nbsp;Sign up a new account
			</h4>
			<hr className="auth-form--hr" />

			<Formik
				initialValues={initialValues}
				onSubmit={userSubmitHandler}>
				{({
					errors,
					isValid,
					touched,
					setFieldValue,
					handleBlur
				}) => (
					<Form className="auth-from-container">
						<div>
							<label htmlFor="username" className="auth-form-label">
								User Name
							</label>
							<Field
								id="username"
								name="username"
								type="text"
								validate={validateUserName}
								className="auth-form-input"
							/>
							{touched.username && errors.username && (
								<div className="auth-form-error">
									{errors.username}
								</div>
							)}
						</div>
						<div>
							<label htmlFor="lastname" className="auth-form-label">
								Last Name
							</label>
							<Field
								id="lastname"
								name="lastname"
								type="text"
								validate={validateLastName}
								className="auth-form-input"
							/>
							{touched.lastname && errors.lastname && (
								<div className="auth-form-error">
									{errors.lastname}
								</div>
							)}
						</div>
						<div>
							<label htmlFor="firstname" className="auth-form-label">
								First Name
							</label>
							<Field
								id="firstname"
								name="firstname"
								type="text"
								validate={validateFirstName}
								className="auth-form-input"
							/>
							{touched.firstname && errors.firstname && (
								<div className="auth-form-error">
									{errors.firstname}
								</div>
							)}
						</div>
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
							/>
							{touched.email && errors.email && (
								<div className="auth-form-error">{errors.email}</div>
							)}
						</div>
						<Field
							id="image"
							name="image"
							title="User Image"
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
								Password
							</label>
							<Field
								id="password"
								name="password"
								type="text"
								validate={validatePassword}
								className="auth-form-input"
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
								type="text"
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
			{isLoginMode && userAuthForm()}
			{!isLoginMode && userSignupForm()}
			<div className="auth-footer-div">
				<p>No Account? Please sign up a new account.</p>
				{/* <Button inverse to="/users/signup">
					SIGNUP
				</Button> */}
				<Button size="small" inverse onClick={switchModeHandler}>
					SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
				</Button>
			</div>
		</React.Fragment>
	);
};

export default UserAuth;
