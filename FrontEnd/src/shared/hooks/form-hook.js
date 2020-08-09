import { useCallback, useState } from 'react';

export const useFormHook = () => {
	// FormContext state
	const [isInsideForm, setInForm] = useState(false);

	const setIsInsideForm = useCallback(val => {
		setInForm(val);
	}, []);

	return {
		isInsideForm,
		setIsInsideForm
	};
};
