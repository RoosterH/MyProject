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
		) {
			setEventName(props.location.state.eventName);
		}
	}, [props, setEventName]);

	const [entry, setEntry] = useState();
	const [entryId, setEntryId] = useState();
	const [entryCarId, setEntryCarId] = useState();
	const [carNumber, setCarNumber] = useState();
	const [raceClass, setRaceClass] = useState();

	// get entry data from backend, whenever we modify the entry information, we need to update it
	// so each tab does not need to retrieve entry information again
	useEffect(() => {
		console.log('in effect');
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
			console.log('entry = ', responseData.entry);
			setEntry(responseData.entry);
			setEntryCarId(responseData.entry.carId);
			setEntryId(responseData.entry.id);
			setCarNumber(responseData.entry.carNumber);
			setRaceClass(responseData.entry.raceClass);
		};
		getEntry();
	}, [setEntry, setEntryCarId, sendRequest, userAuthContext]);

	// get newEntry from sub-component whenever there is a new change
	const getNewEntry = newEntry => {
		console.log('78 newEntry = ', newEntry);
		setEntry(newEntry);
		setEntryCarId(newEntry.carId);
		setEntryId(newEntry.id);

		// write entry to localStorage
		let userData = JSON.parse(localStorage.getItem('userData'));

		console.log('userData = ', userData);
		let newUserEntries = [];
		newUserEntries = userData.userEntries;
		let userEntryIndex;
		for (let i = 0; i < newUserEntries.length; ++i) {
			if (newUserEntries[i].id === newEntry.id) {
				userEntryIndex = i;
				break;
			}
		}
		console.log('newUserEntries1 = ', newUserEntries);
		newUserEntries.splice(userEntryIndex, 1, newEntry);
		console.log('newUserEntries2 = ', newUserEntries);
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
	if (!carSelector && !classification && !form && !submit) {
		carSelectorClickHandler();
	}

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
			</div>

			{/* New Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<br />
					<ul className="nav nav-tabs">
						<Button
							size={carSelectorClass}
							autoFocus
							onClick={carSelectorClickHandler}>
							Car
						</Button>
						<Button
							size={classificationClass}
							autoFocus
							onClick={classificationClickHandler}>
							Classification
						</Button>
						<Button
							size={formClass}
							autoFocus
							onClick={formClickHandler}>
							Form
						</Button>
						<Button
							size={submitClass}
							autoFocus
							onClick={submitClickHandler}>
							Submit
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
								editingMode={true}
								eventId={eventId}
								eventName={eventName}
								getNewEntry={getNewEntry}
							/>
						)}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default EditEntryManager;
