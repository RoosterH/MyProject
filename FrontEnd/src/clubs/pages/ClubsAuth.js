import React, { useContext } from 'react';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { useForm } from '../../shared/hooks/form-hook';
import {
	VALIDATOR_REQUIRE,
	VALIDATOR_MINLENGTH
} from '../../shared/util/validators';

import './ClubsAuth.css';

const CLUBS = [
	{ name: 'AAS', password: 'havefun', id: 'c1' },
	{ name: 'SCCASFR', password: 'autocross', id: 'c2' },
	{ name: 'GGLC', password: 'lotusisfun', id: 'c3' },
	{ name: 'BMWCCA', password: 'bmwsucks', id: 'c4' }
];

const ClubAuth = () => {
	const clubAuthContext = useContext(ClubAuthContext);

	const [formState, inputHandler] = useForm(
		{
			name: {
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

	const eventSubmitHandler = event => {
		// meaning we don't want to reload the page after form submission
		// all the input values stay intact on the form
		event.preventDefault();
		console.log('clubName = ', formState.inputs.name.value);
		const identifiedClub = CLUBS.find(
			club =>
				club.name === formState.inputs.name.value &&
				club.password === formState.inputs.password.value
		);
		console.log('identifiedClub=', identifiedClub);
		if (identifiedClub) {
			console.log('clubauth1 id =', identifiedClub.id);
			clubAuthContext.clubLogin();
			console.log('clubauth2 id=', clubAuthContext.clubId);
		}
	};

	return (
		<Card className="authentication">
			<form title="Club Login" onSubmit={eventSubmitHandler}>
				<Input
					id="name"
					element="input"
					type="text"
					label="Name"
					validators={[VALIDATOR_REQUIRE()]}
					errorText="Please enter a valid club name or email."
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
				<Button disabled={!formState.isValid}>LOGIN</Button>
				<Button to="/">CANCEL</Button>
			</form>
			<p>No Account? Please sign up a new account.</p>
			<Button inverse to="/clubs/signup">
				SIGNUP
			</Button>
		</Card>
	);
};

export default ClubAuth;
