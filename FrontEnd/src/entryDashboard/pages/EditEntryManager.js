import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import CarSelector from './CarSelector';
import EditClassification from './EditClassification';
import EventForm from '../../event/pages/EventForm';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import SubmitEntry from './SubmitEntry';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { UserAuthContext } from '../../shared/context/auth-context';

import './Entry.css';

const EditEntryManager = props => {
	const eventId = useParams().id;
	const [eventName, setEventName] = useState('');
	// Allow users to cancel registration after reg is closed. Currently un-supported,
	// Need to make an option for club to opt this option if we'd like to support this feature.
	const [regClosed, setRegClosed] = useState(false);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const userAuthContext = useContext(UserAuthContext);

	// passing from EventItem
	useEffect(() => {
		if (
			props.location &&
			props.location.state &&
			props.location.state.eventName
			// && props.location.state.regClosed
		) {
			setEventName(props.location.state.eventName);
			// setRegClosed(props.location.state.regClosed);
		}
	}, [props, setEventName]);

	const [entry, setEntry] = useState();
	const [entryId, setEntryId] = useState();
	const [entryCarId, setEntryCarId] = useState();
	const [carNumber, setCarNumber] = useState();
	const [raceClass, setRaceClass] = useState();
	const [paymentStatus, setPaymentStatus] = useState();

	// only get entry data from backend at the very beginning,
	// Whenever we modify the entry information in sub-tabs, we use getNewEntry to receive new entry
	// so each tab does not need to retrieve entry information again.
	useEffect(() => {
		const getEntry = async () => {
			let responseData, responseStatus, responseMessage;
			try {
				[
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/users/entry/${eventId}`,
					'GET',
					null,
					{
						// adding JWT to header for authentication, JWT contains userId
						Authorization: 'Bearer ' + userAuthContext.userToken
					}
				);
			} catch (err) {}
			console.log('responseData = ', responseData);
			setEntry(responseData.entry);
			setEntryCarId(responseData.entry.carId);
			setEntryId(responseData.entry.id);
			setCarNumber(responseData.entry.carNumber);
			setRaceClass(responseData.entry.raceClass);
			setPaymentStatus(responseData.paymentStatus);
		};
		getEntry();
	}, []);

	// get newEntry from sub-component whenever there is a new change
	const getNewEntry = newEntry => {
		setEntry(newEntry);
		setEntryCarId(newEntry.carId);
		setEntryId(newEntry.id);

		// write entry to localStorage
		let userData = JSON.parse(localStorage.getItem('userData'));

		let newUserEntries = [];
		newUserEntries = userData.userEntries;
		let userEntryIndex;
		for (let i = 0; i < newUserEntries.length; ++i) {
			if (newUserEntries[i].id === newEntry.id) {
				userEntryIndex = i;
				break;
			}
		}
		newUserEntries.splice(userEntryIndex, 1, newEntry);
		userData.userEntries = newUserEntries;
		localStorage.setItem('userData', JSON.stringify(userData));
	};

	let userData = JSON.parse(localStorage.getItem('userData'));
	// get userId from localStorage
	let userId = undefined;
	if (userData.userId) {
		userId = userData.userId;
	}

	// collect information from each tab, we will send them to backend via SUBMIT tab
	// const [carId, setCarId] = useState();
	const [formAnswer, setFormAnswer] = useState();

	const [carSelector, setCarSelector] = useState(false);
	const [carSelectorClass, setCarSelectorClass] = useState(
		'editeventmanager-grey'
	);
	const [classification, setClassification] = useState(false);
	const [classificationClass, setClassificationClass] = useState(
		'editeventmanager-grey'
	);
	const [form, setFform] = useState(false);
	const [formClass, setFformClass] = useState(
		'editeventmanager-grey'
	);
	const [submit, setSubmit] = useState(false);
	const [submitClass, setSubmitClass] = useState(
		'editeventmanager-grey'
	);
	const [percentage, setPercentage] = useState('0');

	const carSelectorClickHandler = () => {
		setCarSelector(true);
		setCarSelectorClass('editeventmanager-orange');
		setClassification(false);
		setClassificationClass('editeventmanager-grey');
		setFform(false);
		setFformClass('editeventmanager-grey');
		setSubmit(false);
		setSubmitClass('editeventmanager-grey');
		setPercentage('0');
	};
	const classificationClickHandler = () => {
		setCarSelector(false);
		setCarSelectorClass('editeventmanager-grey');
		setClassification(true);
		setClassificationClass('editeventmanager-orange');
		setFform(false);
		setFformClass('editeventmanager-grey');
		setSubmit(false);
		setSubmitClass('editeventmanager-grey');
		setPercentage('25');
	};
	const formClickHandler = () => {
		setCarSelector(false);
		setCarSelectorClass('editeventmanager-grey');
		setClassification(false);
		setClassificationClass('editeventmanager-grey');
		setFform(true);
		setFformClass('editeventmanager-orange');
		setSubmit(false);
		setSubmitClass('editeventmanager-grey');
		setPercentage('50');
	};
	const submitClickHandler = () => {
		setCarSelector(false);
		setCarSelectorClass('editeventmanager-grey');
		setClassification(false);
		setClassificationClass('editeventmanager-grey');
		setFform(false);
		setFformClass('editeventmanager-grey');
		setSubmit(true);
		setSubmitClass('editeventmanager-orange');
		setPercentage('75');
	};

	const finishHandler = () => {
		setPercentage('100');
	};

	// set defualt page, if none is false, we will use carSelector as default
	useEffect(() => {
		if (
			!carSelector &&
			!classification &&
			!form &&
			!submit &&
			!regClosed
		) {
			carSelectorClickHandler();
		} else if (regClosed) {
			submitClickHandler();
		}
	}, [
		carSelector,
		classification,
		form,
		submit,
		regClosed,
		carSelectorClickHandler,
		submitClickHandler
	]);

	// getting continue status back from <Form />
	const [formStatus, setFormStatus] = useState(false);
	const formHandler = status => {
		if (status) {
			setFormStatus(status);
		}
	};
	useEffect(() => {
		if (formStatus) {
			submitClickHandler();
		}
	}, [formStatus, submitClickHandler]);

	const getFormAnswer = answer => {
		setFormAnswer(answer);
	};

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			<div className="list-header clearfix">
				<div className="h3-heavy">{eventName}</div>
				<div className="h3">
					Please click on the tab to make changes.
				</div>
				{regClosed && (
					<div className="h3-heavy">
						Registration is now closed.&nbsp;&nbsp;You can not modify
						your entry except canceling it.
					</div>
				)}
			</div>

			{/* New Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<br />
					<ul className="nav nav-tabs">
						<Button
							size={carSelectorClass}
							disabled={regClosed}
							autoFocus
							onClick={carSelectorClickHandler}>
							Car
						</Button>
						<Button
							size={classificationClass}
							disabled={regClosed}
							autoFocus
							onClick={classificationClickHandler}>
							Classification
						</Button>
						<Button
							size={formClass}
							disabled={regClosed}
							autoFocus
							onClick={formClickHandler}>
							Form
						</Button>
						<Button
							size={submitClass}
							autoFocus
							onClick={submitClickHandler}>
							Registration
						</Button>
					</ul>
					<div className="tab-content">
						{carSelector && (
							<CarSelector
								entryId={entryId}
								userId={userId}
								isNewEntry={false}
								entryCarId={entryCarId}
								getNewEntry={getNewEntry}
							/>
						)}
						{classification && (
							<EditClassification
								entryId={entryId}
								userId={userId}
								carNumber={carNumber}
								raceClass={raceClass}
								getNewEntry={getNewEntry}
							/>
						)}
						{/* editingMode is to indicate request from EditEntryManager not NewNewEntryManager */}
						{form && (
							<EventForm
								entryId={entryId}
								eventId={eventId}
								editingMode={true}
								getNewEntry={getNewEntry}
							/>
						)}
						{submit && (
							<SubmitEntry
								entryId={entryId}
								editingMode={true}
								eventId={eventId}
								eventName={eventName}
								formAnswer={entry.answer}
								paymentStatus={paymentStatus}
							/>
						)}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default EditEntryManager;
