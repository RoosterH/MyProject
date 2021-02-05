import React, { useState, useContext, useEffect } from 'react';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { Field, Form, Formik } from 'formik';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Modal from '../../shared/components/UIElements/Modal';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import MaterialTableCommsMemberCenter from './MaterialTableCommsMemberCenter.js';
import EmailComposer from './EmailComposer.js';
import '../../shared/css/Auth.css';
import './ClubMemberList.css';

const CommsMemberCenter = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	const [csvFileValid, setCsvFileValid] = useState(true);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [showLoading, setShowLoading] = useState(true);

	const [showSentModal, setShowSentModal] = useState(false);
	const closeSentModalHandler = () => {
		setShowSentModal(false);
	};

	const [clubMemberList, setClubMemberList] = useState(null);
	// retrieve clubMemberLst from backend, if nothing existing meaning this is a new club
	// display import file field for new club
	useEffect(() => {
		let responseData, responseStatus, responseMessage;
		const getClubMemberList = async () => {
			[
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/clubs/commsMemberList/${clubAuthContext.clubId}`,
				'GET',
				null,
				{
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setClubMemberList(responseData.memberList);
		};
		getClubMemberList();
	}, []);

	const [materialData, setMaterialData] = useState();
	useEffect(() => {
		setMaterialData(clubMemberList);
		setShowLoading(false);
	}, [clubMemberList, setMaterialData]);

	const [emailRecipient, setEmailRecipient] = useState();
	const emailHandler = selections => {
		let recipients = [];
		for (let i = 0; i < selections.length; ++i) {
			let recipient = {};
			recipient.userId = selections[i].userId;
			recipient.lastName = selections[i].lastName;
			recipient.firstName = selections[i].firstName;
			recipient.email = selections[i].email;
			recipient.phone = selections[i].phone;
			console.log('recipient = ', recipient);
			recipients.push(recipient);
		}
		setEmailRecipient(recipients);
	};

	const [emailSubject, setEmailSubject] = useState();
	const [emailContent, setEmailContent] = useState();
	const getEmailContent = (subject, content) => {
		if (subject && content) {
			setEmailSubject(subject);
			setEmailContent(content);
		}
	};

	useEffect(() => {
		const sendEmail = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/sendEmail/${clubAuthContext.clubId}`,
					'POST',
					JSON.stringify({
						recipients: emailRecipient,
						subject: emailSubject,
						content: emailContent
					}),
					{
						'Content-Type': 'application/json',
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
				setShowSentModal(true);
				setEmailRecipient();
				setEmailSubject();
				setEmailContent();
			} catch (err) {}
		};
		if (emailRecipient && emailSubject && emailContent) {
			sendEmail();
		}
	}, [emailRecipient, emailSubject, emailContent, sendRequest]);

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{(isLoading || showLoading) && <LoadingSpinner asOverlay />}
			{showSentModal && (
				<Modal
					className="modal-delete"
					show={showSentModal}
					contentClass="event-item__modal-delete"
					onCancel={closeSentModalHandler}
					header="Email"
					footerClass="event-item__modal-actions"
					footer={
						<React.Fragment>
							<Button inverse onClick={closeSentModalHandler}>
								OK
							</Button>
						</React.Fragment>
					}>
					<p className="modal__content">Email has been delivered.</p>
				</Modal>
			)}
			{materialData && !emailRecipient && (
				<MaterialTableCommsMemberCenter
					showLoading={showLoading}
					clubName={clubAuthContext.clubName}
					memberList={materialData}
					emailHandler={emailHandler}
				/>
			)}
			{emailRecipient && (
				<EmailComposer
					commsEventCenter={false}
					recipientNumber={emailRecipient.length}
					getEmailContent={getEmailContent}
				/>
			)}
		</React.Fragment>
	);
};

export default CommsMemberCenter;
