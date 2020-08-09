import { createContext } from 'react';

/**
 * insideForm: is used to indicate current page is inside a form (new form or form builder).
 *     We want to disable "logout" if we are inside of a form to avoid conflict between
 *     leaving page promop and logging out race condition
 */
//
export const FormContext = createContext({
	isInsideForm: false,
	setIsInsideForm: () => {}
});
