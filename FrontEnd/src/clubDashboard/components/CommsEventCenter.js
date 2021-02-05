import React, {
	useCallback,
	useContext,
	useEffect,
	useState
} from 'react';
import MaterialTableCommsEventCenter from './MaterialTableCommsEventCenter';

import Button from '../../shared/components/FormElements/Button';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import EmailComposer from './EmailComposer.js';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Modal from '../../shared/components/UIElements/Modal';

import '../../shared/components/FormElements/Button.css';

const NOT_ATTENDING = 'Not Attending';
const PAID = 'Paid';
const REFUNDED = 'Refunded';
const STRIPE = 'stripe';

const CommsEventCenter = props => {
	let eventId = props.commsCenterData.eventId;
	const clubAuthContext = useContext(ClubAuthContext);
	const [showLoading, setShowLoading] = useState(false);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// days = how many days for this event
	const [days, setDays] = useState(
		props.commsCenterData.entryData
			? props.commsCenterData.entryData.length
			: 0
	);
	const [eventEntryList, setEventEntryList] = useState(
		props.commsCenterData.entryData
			? props.commsCenterData.entryData
			: undefined
	);

	const [eventName, setEventName] = useState(
		props.commsCenterData.eventName !== ''
			? props.commsCenterData.eventName
			: ''
	);

	const [showSentModal, setShowSentModal] = useState(false);
	const closeSentModalHandler = () => {
		setShowSentModal(false);
	};

	// create an array from day 1 to loop through when we are rendering day buttons
	const [dayArray, setDayArray] = useState([]);
	useEffect(() => {
		let tmp = [];
		if (days > 1) {
			for (var i = 0; i < days; ++i) {
				tmp.push(i);
			}
		}
		setDayArray(tmp);
	}, [setDayArray, days]);

	// check the page has been initialized, if not, we want to hightlight multi-day event day button to day 1
	const [init, setInit] = useState(false);
	const [daySelection, setDaySelection] = useState(0);
	// entryListArray elements are the data passing to Material-Table
	const [entryListArray, setEntryListArray] = useState([]);

	// return index of matched value
	const getMapKey = (val, myMap) => {
		// in case workerAssignment not defined
		if (myMap === undefined) {
			myMap = [];
		}
		let answer;
		for (var i = 0; i < myMap.length; ++i) {
			if (myMap[i] === val) {
				answer = i;
				break;
			}
		}
		return answer;
	};

	// callback for Day Buttons
	const daySelectionCallback = index => {
		// index starts from 0, because we add All Days as day 0
		setDaySelection(index);
	};

	// create ref for day 1 button. For multi-day events, we want to set focus on day 1 button initially
	// We didn’t choose useRef in this example because an object ref doesn’t notify us about changes to
	// the current ref value. Using a callback ref ensures that even if a child component displays the
	// button later, we still get notified about it in the parent component and can update the color.
	const allDaysButtonRef = useCallback(button => {
		if (!init && button) {
			button.focus();
			setInit(true);
		}
	});

	const [emailRecipient, setEmailRecipient] = useState();
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
						eventId: eventId,
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

	const emailHandler = selections => {
		let recipients = [];
		for (let i = 0; i < selections.length; ++i) {
			let recipient = {};
			recipient.userId = selections[i].userId;
			recipient.lastName = selections[i].lastName;
			recipient.firstName = selections[i].firstName;
			recipient.email = selections[i].email;
			recipient.phone = selections[i].phone;
			recipients.push(recipient);
		}
		setEmailRecipient(recipients);
	};

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
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
			{(isLoading || showLoading) && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{!emailRecipient &&
				days > 1 &&
				dayArray.map(day => {
					if (day === 0) {
						// create ref for All button
						return (
							<button
								ref={allDaysButtonRef}
								key={'entrylistforUsers' + day}
								className="button--small-white"
								onClick={e => daySelectionCallback(day)}>
								All Attendees
							</button>
						);
					} else {
						return (
							<button
								key={'entrylistforUsers' + day}
								className="button--small-white"
								onClick={e => daySelectionCallback(day)}>
								Day {day}
							</button>
						);
					}
				})}
			{/* render material table according to event day */}
			{!emailRecipient && eventEntryList.length > 0 && (
				<MaterialTableCommsEventCenter
					entryList={eventEntryList[daySelection]}
					displayName={true}
					eventName={
						eventEntryList.length > 1
							? daySelection === 0
								? eventName + ' All Attendees'
								: eventName + ' Day' + daySelection
							: eventName
					}
					showLoading={showLoading}
					emailHandler={emailHandler}
				/>
			)}
			{emailRecipient && (
				<EmailComposer
					commsEventCenter={true}
					recipientNumber={emailRecipient.length}
					getEmailContent={getEmailContent}
				/>
			)}
		</React.Fragment>
	);
};

export default CommsEventCenter;
