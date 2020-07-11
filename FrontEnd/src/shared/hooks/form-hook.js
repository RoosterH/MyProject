import { useCallback, useReducer } from 'react';

/**
 * more complex logic to derive our required state update.
 * This function is the state we need to update info of the form reducer based on the different
 * actions we might receive.  We need to update the input state which changed and the overall
 * form validity state.
 **/
const formReducer = (state, action) => {
	console.log('action.type = ', action.type);
	console.log('action.inputId = ', action.inputId);
	console.log('action.value = ', action.value);
	console.log('action.isValid = ', action.isValid);
	switch (action.type) {
		case 'INPUT_CHANGE':
			let formIsValid = true;
			/**
			 * state.inputs is our form inputs that defined in useReducer initial state.
			 * We have inputs such as id="name", id="descrption", ... etc. The following for loop
			 * validates all inputs on the form.
			 */
			for (const inputId in state.inputs) {
				if (!state.inputs[inputId]) {
					continue;
				}
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
					// spread operator means the current inputs original state
					// we only override the action item to make to the next state
					...state.inputs,
					[action.inputId]: {
						value: action.value,
						isValid: action.isValid
					}
				},
				isValid: formIsValid
			};
		case 'SET_DATA':
			return {
				inputs: action.inputs,
				isValid: action.formIsValid
			};
		default:
			return state;
	}
};

// custom hook naming convention starts with lower case
export const useForm = (initialInputs, initialFormValidaty) => {
	/**
	 * useReducer defines how state changes when an action occurs. We can define different
	 * logic per action inside of useReducer.  "formState" will be the result for the next
	 * state.
	 **/
	// formReducer: reducer function
	// {inputs: initalInputs, isValid: initialFormValidaty}: initial state
	// dspatch: dispatch function to call reducer function
	// formState: return value from reducer function
	const [formState, dispatch] = useReducer(formReducer, {
		/**
		 * The following section is the initial state, inputs are the actions such as
		 * title: {
		 *      value: '',
		 *      isValid: false
		 * }
		 * title is the id of the inputs.  We will check if any of the input has the state change
		 * */
		inputs: initialInputs,
		// overall form validity
		isValid: initialFormValidaty
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

	const setFormData = useCallback((inputData, formValidity) => {
		dispatch({
			type: 'SET_DATA',
			inputs: inputData,
			formIsValid: formValidity
		});
	}, []);

	/**
	 * formState: next state return value
	 * inputHandler: a callback function that can be called for type: 'INPUT_CHANGE'
	 * setForData: a callback function for type: 'SET_DATA'
	 **/
	return [formState, inputHandler, setFormData];
};
