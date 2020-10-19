import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import CarSelector from './CarSelector';
import Classification from './Classification';
import EventForm from '../../event/pages/EventForm';
import SubmitEntry from './SubmitEntry';
import { UserAuthContext } from '../../shared/context/auth-context';
import { useUserLoginValidation } from '../../shared/hooks/userLoginValidation-hook';

import './Entry.css';

const NewEntryManager = props => {
	const eventId = useParams().id;
	const [eventName, setEventName] = useState('');
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
	const userAuthContext = useContext(UserAuthContext);

	let userData = JSON.parse(localStorage.getItem('userData'));
	// get userId from localStorage
	let userId = undefined;
	if (userData && userData.userId) {
		userId = userData.userId;
	}

	useUserLoginValidation(`/events/newEntryManager/${eventId}`);
	let location = useLocation();
	useEffect(() => {
		// get current URL path
		let path = location.pathname;
		let userRedirectURL = userAuthContext.userRedirectURL;
		if (path === userRedirectURL) {
			// If we are re-directing to this page, we want to clear up userRedirectURL
			// re-init redirectURL after re-direction route
			userAuthContext.setUserRedirectURL(null);
		}
	}, [userAuthContext, location]);

	// collect information from each tab, we will send them to backend via SUBMIT tab
	const [carId, setCarId] = useState();
	const [carNumber, setCarNumber] = useState();
	const [raceClass, setRaceClass] = useState();
	const [formAnswer, setFormAnswer] = useState();

	const [carSelector, setCarSelector] = useState(false);
	const [carSelectorClass, setCarSelectorClass] = useState('li-tab');
	const [classification, setClassification] = useState(false);
	const [classificationClass, setClassificationClass] = useState(
		'li-tab'
	);
	const [form, setFform] = useState(false);
	const [formClass, setFformClass] = useState('li-tab');
	const [submit, setSubmit] = useState(false);
	const [submitClass, setSubmitClass] = useState('li-tab');
	const [percentage, setPercentage] = useState('0');

	const carSelectorClickHandler = () => {
		setCarSelector(true);
		setCarSelectorClass('li-tab_orange');
		setClassification(false);
		setClassificationClass('li-tab');
		setFform(false);
		setFformClass('li-tab');
		setSubmit(false);
		setSubmitClass('li-tab');
		setPercentage('0');
	};
	const classificationClickHandler = () => {
		setCarSelector(false);
		setCarSelectorClass('li-tab');
		setClassification(true);
		setClassificationClass('li-tab_orange');
		setFform(false);
		setFformClass('li-tab');
		setSubmit(false);
		setSubmitClass('li-tab');
		setPercentage('25');
	};
	const formClickHandler = () => {
		setCarSelector(false);
		setCarSelectorClass('li-tab');
		setClassification(false);
		setClassificationClass('li-tab');
		setFform(true);
		setFformClass('li-tab_orange');
		setSubmit(false);
		setSubmitClass('li-tab');
		setPercentage('50');
	};
	const submitClickHandler = () => {
		setCarSelector(false);
		setCarSelectorClass('li-tab');
		setClassification(false);
		setClassificationClass('li-tab');
		setFform(false);
		setFformClass('li-tab');
		setSubmit(true);
		setSubmitClass('li-tab_orange');
		setPercentage('75');
	};

	const finishHandler = () => {
		setPercentage('100');
	};

	// set defualt page, if none is false, we will use carSelector as default
	if (!carSelector && !classification && !form && !submit) {
		carSelectorClickHandler();
	}

	// getting continue status back from <NewEvent />
	const [carSelectorStatus, setCarSelectorStatus] = useState(false);
	const carSelectorHandler = status => {
		if (status) {
			// set newEventStatus to true
			setCarSelectorStatus(true);
		}
	};
	const carIDHandler = cId => {
		setCarId(cId);
	};
	useEffect(() => {
		// if carSelectorStatus is true, move to the next stage => classification.
		if (carSelectorStatus) {
			classificationClickHandler();
		}
	}, [carSelectorStatus, classificationClickHandler]);

	// getting continue status back from <NumberClass />
	const [classificationStatus, setClassificationStatus] = useState(
		false
	);
	const classificationHandler = status => {
		if (status) {
			setClassificationStatus(true);
		}
	};
	useEffect(() => {
		if (classificationStatus) {
			formClickHandler();
		}
	}, [classificationStatus, formClickHandler]);

	const carNumberHandler = number => {
		if (number) {
			setCarNumber(number);
		}
	};

	const raceClassHandler = rclass => {
		if (rclass) {
			setRaceClass(rclass);
		}
	};

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

	// getting continue status back from <EventForm />
	const [submitStatus, setSubmitStatus] = useState(false);
	const SubmitHandler = status => {
		if (status) {
			setSubmitStatus(status);
		}
	};
	useEffect(() => {
		if (submitStatus) {
			finishHandler();
		}
	}, [submitStatus, submitClickHandler]);

	return (
		<React.Fragment>
			<div className="list-header clearfix">
				<div className="h3">{eventName}</div>
			</div>

			{/* New Event Manager Tabs*/}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<div className="progress">
						<div
							className="progress-bar progress-bar-striped progress-bar-animated"
							role="progressbar"
							style={{ width: `${percentage}%` }}
							aria-valuenow={percentage}
							aria-valuemin="0"
							aria-valuemax="100">
							{`${percentage}%`}
						</div>
					</div>
					<br />
					<ul className="nav nav-tabs">
						<li className={carSelectorClass}>Car</li>
						<li className={classificationClass}>Classification</li>
						<li className={formClass}>Form</li>
						<li className={submitClass}>Submit</li>
					</ul>
					<div className="tab-content">
						{carSelector && (
							<CarSelector
								userId={userId}
								carSelectorStatus={carSelectorHandler}
								carIdHandler={carIDHandler}
								isNewEntry={true}
							/>
						)}
						{classification && (
							<Classification
								classificationStatus={classificationHandler}
								carNumberHandler={carNumberHandler}
								raceClassHandler={raceClassHandler}
							/>
						)}
						{form && (
							<EventForm
								eventId={eventId}
								editingMode={false}
								eventFormStatus={formHandler}
								returnFormAnswer={getFormAnswer}
							/>
						)}
						{submit && (
							<SubmitEntry
								submitStatus={SubmitHandler}
								eventId={eventId}
								eventName={eventName}
								carId={carId}
								carNumber={carNumber}
								raceClass={raceClass}
								formAnswer={formAnswer}
								editingMode={false}
							/>
						)}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default NewEntryManager;
