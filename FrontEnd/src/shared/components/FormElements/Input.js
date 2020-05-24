import React, { useReducer, useEffect } from 'react';

import { validate } from '../../util/validators';
import './Input.css';

// if action.type === 'CHANGE', we will return new set of state
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
		value: '',
		isValid: false,
		isTouched: false
	});

	// props is from NewEvent.js <Input onInput={}/> which is a callback function
	const { id, onInput } = props;
	const { value, isValid } = inputState;

	useEffect(() => {
		// we get onInput function above from props, onInput takes 3 arguments.
		// const inputHandler = useCallback((id, value, isValid), [])
		onInput(id, value, isValid);
	}, [id, value, isValid, onInput]);

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

	const element =
		props.element === 'input' ? (
			<input
				id={props.id}
				type={props.type}
				placeholder={props.placeholder}
				onChange={changeHandler}
				onBlur={touchHandler}
				value={inputState.value}
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
		<div
			className={`form-control ${
				!inputState.isValid && inputState.isTouched && 'form-control--invalid'
			}`}
		>
			<label htmlFor={props.id}>{props.label}</label>
			{element}{' '}
			{!inputState.isValid && inputState.isTouched && <p>{props.errorText}</p>}
		</div>
	);
};

export default Input;
