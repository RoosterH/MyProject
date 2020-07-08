import React, { useReducer, useEffect } from 'react';

import { validate } from '../../util/validators';
import './Input.css';

// this function is to validate action whenever there is a state change
// action.type === 'CHANGE' comes from onChange, we will return new set of state
// action.type === 'TOUCH' comes from onBlur
const inputReducer = (state, action) => {
	switch (action.type) {
		case 'CHANGE':
			return {
				// spread operator meaning for all the key/value pairs
				...state,
				// override the old values with new ones
				value: action.val,
				isValid: validate(action.val, action.validators)
			};
		case 'TOUCH': {
			return {
				...state,
				isTouched: true
			};
		}
		default:
			return state;
	}
};

const Input = props => {
	/**
	 * Reason we need to use reducer is because we are handling 2 events changeHandler and
	 * touchHandler. We want to get the updated state for the 2 events and put the logic
	 * in the same function.
	 * useReducer params: (reducer function, optional init state)
	 * returns: inputState and a dispatch function
	 * we will call the dispatch function with the new action state in the event handler
	 * return value inputState will be used in useEffect() to check for the state update
	 * and to determine what to be displayed in our component return section
	 **/
	const [inputState, dispatch] = useReducer(inputReducer, {
		value: props.initialValue || '',
		isValid: props.initialValid || false,
		isTouched: false
	});

	// props is from NewEvent.js/UpdateEvent.js <Input onInput={}/> which is a callback function
	const { id, onInput } = props;
	const { value, isValid } = inputState;

	useEffect(() => {
		// we get onInput function above from props, onInput takes 3 arguments.
		// const inputHandler = useCallback((id, value, isValid), [])
		onInput(id, value, isValid);
	}, [id, value, isValid, onInput]);

	// onChange=changeHandler, onChange will be triggered when user enters something on the form
	const changeHandler = event => {
		// calling distach function to dispatch actions to reducer
		dispatch({
			type: 'CHANGE',
			val: event.target.value,
			validators: props.validators
		});
	};

	const touchHandler = () => {
		dispatch({
			type: 'TOUCH'
		});
	};

	console.log('class = ', props.className);
	let className = props.className
		? props.className
		: `form-control ${
				!inputState.isValid &&
				inputState.isTouched &&
				'form-control--invalid'
		  }`;

	const element =
		props.element === 'input' ? (
			<input
				id={props.id}
				type={props.type}
				placeholder={props.placeholder}
				onChange={changeHandler}
				onBlur={touchHandler}
				value={inputState.value}
				file={props.file}
				min={props.min}
				max={props.max}
				className={className}
			/>
		) : (
			<textarea
				id={props.id}
				rows={props.rows || 3}
				onChange={changeHandler}
				onBlur={touchHandler}
				value={inputState.value}
			/>
		);

	return (
		<div className={className}>
			<label htmlFor={props.id}>{props.label}</label>
			{element}
			{!inputState.isValid && inputState.isTouched && (
				<p>{props.errorText}</p>
			)}
		</div>
	);
};

export default Input;
