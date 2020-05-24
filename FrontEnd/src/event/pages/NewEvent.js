import React, { useCallback, useReducer } from 'react';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import {
	VALIDATOR_REQUIRE,
	VALIDATOR_MINLENGTH,
	VALIDATOR_FILE
} from '../../shared/util/validators';
import './NewEvent.css';

/**
 * more complex logic to derive our required state update.
 * This function is the state we need to update info of the form reducer based on the different
 * actions we might receive.  We need to update the input state which changed and the overall
 * form validity state.
 **/
const formReducer = (state, action) => {
	switch (action.type) {
		case 'INPUT_CHANGE':
			let formIsValid = true;
			/**
			 * state.inputs is our form inputs.  We have 2 inputs id="title" and
			 * id="descrption". The following for loop validates all inputs on the form.
			 */
			for (const inputId in state.inputs) {
				// matching inputId(either "title" or "description") with action.inputId
				if (inputId === action.inputId) {
					// matches with action.inputId meaning there is a change so we want to
					// validate the change
					formIsValid = formIsValid && action.isValid;
				} else {
					// not matching the action.inputId meaning no change was made but we
					// still need to validate it using state.inputs[inputId]
					formIsValid = formIsValid && state.inputs[inputId].isValid;
				}
			}
			return {
				...state,
				inputs: {
					...state.inputs,
					[action.inputId]: { value: action.value, isValid: action.isValid }
				},
				isValid: formIsValid
			};
		default:
			return state;
	}
};

const NewEvent = () => {
	const [formState, dispatch] = useReducer(formReducer, {
		/**
		 * The following section is the initial state, our form has 2 inputs id="title" and
		 * id="descrption".  We will check if any of the input has the state change
		 * */

		inputs: {
			// validity of individual input
			title: {
				value: '',
				isValid: false
			},
			description: {
				value: '',
				isValid: false
			},
			courseMap: {
				value: '',
				isValid: false
			}
		},
		// overall form validity
		isValid: false
	});

	/**
	 * Purpose of useCallback is to avoid infinite loop when the component gets re-rendered
	 * With useCallback hook, if the component function re-executes, this function here will
	 * be stored away by React and will be reused so that no new function object is created
	 * whenever the component function re-renders.  Since no new function will be re-created
	 * so there will not be any state change, thus useEffect() will not be called.
	 * [] defines the dependencies of this function under where should be re-rendered
	 **/
	const inputHandler = useCallback((id, value, isValid) => {
		dispatch({
			type: 'INPUT_CHANGE',
			value: value,
			isValid: isValid,
			inputId: id
		});
	}, []);

	const eventSubmitHandler = event => {
		// meaning we don't want to reload the page after form submission
		// all the input values stay intact on the form
		event.preventDefault();
		// we will send the form inputs to back end later
		console.log(formState.inputs);
	};

	return (
		<form className="event-form" onSubmit={eventSubmitHandler}>
			<Input
				id="title"
				element="input"
				type="text"
				label="Title"
				validators={[VALIDATOR_REQUIRE()]}
				errorText="Please enter a valid title."
				onInput={inputHandler}
			/>
			<Input
				id="startDate"
				element="input"
				type="date"
				label="Starting Date"
				validators={[VALIDATOR_REQUIRE()]}
				errorText="Please enter a valid date."
				onInput={inputHandler}
			/>
			<Input
				id="endDate"
				element="input"
				type="date"
				label="End Date"
				validators={[VALIDATOR_REQUIRE()]}
				errorText="Please enter a valid date."
				onInput={inputHandler}
			/>
			<Input
				id="venue"
				element="input"
				type="text"
				label="Venue"
				validators={[VALIDATOR_REQUIRE()]}
				errorText="Please enter a valid venue."
				onInput={inputHandler}
			/>
			<Input
				id="address"
				element="input"
				type="text"
				label="Address"
				validators={[VALIDATOR_MINLENGTH(10)]}
				errorText="Please enter a valid address."
				onInput={inputHandler}
			/>
			<Input
				id="coordinate"
				element="input"
				type="text"
				label="Cooridnate"
				validators={[VALIDATOR_REQUIRE()]}
				errorText="Please enter a valid coordinate."
				onInput={inputHandler}
			/>
			<Input
				id="description"
				element="textarea"
				label="Description"
				validators={[VALIDATOR_MINLENGTH(5)]}
				errorText="Please enter a valid description with min length 5 chars."
				onInput={inputHandler}
			/>
			<Input
				id="courseMap"
				element="input"
				type="file"
				label="Course Map"
				validators={[VALIDATOR_FILE()]}
				errorText="Please select a jpg or png file."
				onInput={inputHandler}
			/>
			<Button type="submit" disabled={!formState.isValid}>
				Add Event
			</Button>
		</form>
	);
};

export default NewEvent;
