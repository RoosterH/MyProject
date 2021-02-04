import React, { useState, useEffect, useContext } from 'react';
import { useField, Field, Form, Formik } from 'formik';
import NavigationPrompt from 'react-router-navigation-prompt';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { ClubAuthContext } from '../../shared/context/auth-context';
import PromptModal from '../../shared/components/UIElements/PromptModal';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './EmailComposer.css';

const EmailComposer = props => {
	const clubAuthContext = useContext(ClubAuthContext);
	const [OKLeavePage, setOKLeavePage] = useState('true');

	let recipientNum = props.recipientNumber;
	let getEmailContent = props.getEmailContent;
	// EditorState provides a snapshot of the editor state. This includes the undo/redo history, contents, and cursor.
	//  start with an empty state created using the createEmpty method of EditorState
	const [editorState, setEditorState] = useState(() =>
		EditorState.createEmpty()
	);

	const [convertedContent, setConvertedContent] = useState(null);

	const handleEditorChange = state => {
		setEditorState(state);
		convertContentToHTML(state);
	};

	const convertContentToHTML = () => {
		// let currentContentAsHTML = convertToHTML(
		// 	editorState.getCurrentContent()
		// );
		let currentContentAsHTML = draftToHtml(
			convertToRaw(editorState.getCurrentContent())
		);
		setConvertedContent(currentContentAsHTML);
		console.log('currentContentAsHTML = ', currentContentAsHTML);
	};

	const submitHandler = values => {
		console.log('I am in submit');
		console.log('values = ', values);
		getEmailContent(values.subject, convertedContent);
		setOKLeavePage(true);
	};

	const validateSubject = value => {
		let error;
		if (!value) {
			error = 'Subject is required.';
		}
		return error;
	};

	const EditorField = ({ label, ...props }) => {
		const [field, meta, helpers] = useField(props);
		return (
			<Editor
				editorState={editorState}
				onEditorStateChange={handleEditorChange}
				wrapperClassName="wrapper-class"
				editorClassName="editor-class"
				toolbarClassName="toolbar-class"
			/>
		);
	};

	const initialValues = {
		subject: ''
	};

	const emailForm = () => (
		<div className="event-form">
			<Formik
				enableReinitialize={true}
				initialValues={initialValues}
				onSubmit={(values, actions) => {
					submitHandler(values);
					if (actions.isSubmitting) {
						actions.setSubmitting(false);
					}
				}}>
				{({
					errors,
					handleBlur,
					handleChange,
					handleSubmit,
					isSubmitting,
					isValid,
					setFieldValue,
					touched,
					values
				}) => (
					<Form className="event-form-container">
						<label
							htmlFor="subject"
							className="event-form__label_inline">
							Subject :
						</label>
						<Field
							id="subject"
							name="subject"
							type="text"
							className="subject__field"
							validate={validateSubject}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
							}}
						/>
						{touched.subject && errors.subject && (
							<div className="event-form__field-error">
								{errors.subject}
							</div>
						)}
						<EditorField />
						<Button
							type="submit"
							size="medium"
							margin-left="1.5rem"
							disabled={isSubmitting || !isValid}>
							Send
						</Button>
						<NavigationPrompt
							afterConfirm={() => {
								// localStorage.removeItem('eventID');
							}}
							// Confirm navigation if going to a path that does not start with current path:
							when={(crntLocation, nextLocation) => {
								// remove ClubRedirectURL from memory
								clubAuthContext.setClubRedirectURL(null);
								// OKLeavePage meaning form was not touched yet
								if (
									OKLeavePage ||
									nextLocation.pathname === '/clubs/auth'
								) {
									return false;
								} else {
									return (
										!nextLocation ||
										!nextLocation.pathname.startsWith(
											crntLocation.pathname
										)
									);
								}
							}}>
							{({ isActive, onCancel, onConfirm }) => {
								if (isActive) {
									return (
										<PromptModal
											onCancel={onCancel}
											onConfirm={onConfirm}
											contentClass="event-item__modal-content"
											footerClass="event-item__modal-actions"
											error="You sure want to leave? Unsaved data will be lost."></PromptModal>
									);
								}
								return (
									<div>
										This is probably an anti-pattern but ya know...
									</div>
								);
							}}
						</NavigationPrompt>
					</Form>
				)}
			</Formik>
		</div>
	);

	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="emailcomposer-title">Compose Email</div>
			</div>
			<div className="emailcomposer-container">
				<div>Recipient: total recipients {recipientNum}</div>
				{emailForm()}
			</div>
		</React.Fragment>
	);
};
export default EmailComposer;
