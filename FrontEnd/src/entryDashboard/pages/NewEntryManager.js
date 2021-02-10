import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import CarSelector from './CarSelector';
import ClubInformation from './ClubInformation';
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
	const [payMembership, setPayMembership] = useState(false);
	const [formAnswer, setFormAnswer] = useState();

	const [carSelector, setCarSelector] = useState(false);
	const [carSelectorClass, setCarSelectorClass] = useState('li-tab');
	const [clubInformation, setClubInformation] = useState(false);
	const [clubInformationClass, setClubInformationClass] = useState(
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
		setClubInformation(false);
		setClubInformationClass('li-tab');
		setFform(false);
		setFformClass('li-tab');
		setSubmit(false);
		setSubmitClass('li-tab');
		setPercentage('25');
	};
	const clubInformationClickHandler = () => {
		setCarSelector(false);
		setCarSelectorClass('li-tab');
		setClubInformation(true);
		setClubInformationClass('li-tab_orange');
		setFform(false);
		setFformClass('li-tab');
		setSubmit(false);
		setSubmitClass('li-tab');
		setPercentage('50');
	};
	const formClickHandler = () => {
		setCarSelector(false);
		setCarSelectorClass('li-tab');
		setClubInformation(false);
		setClubInformationClass('li-tab');
		setFform(true);
		setFformClass('li-tab_orange');
		setSubmit(false);
		setSubmitClass('li-tab');
		setPercentage('75');
	};
	const submitClickHandler = () => {
		setCarSelector(false);
		setCarSelectorClass('li-tab');
		setClubInformation(false);
		setClubInformationClass('li-tab');
		setFform(false);
		setFformClass('li-tab');
		setSubmit(true);
		setSubmitClass('li-tab_orange');
		setPercentage('100');
	};

	const finishHandler = () => {
		// setPercentage('100');
	};

	// set defualt page, if none is false, we will use carSelector as default
	if (!carSelector && !clubInformation && !form && !submit) {
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
		// if carSelectorStatus is true, move to the next stage => clubinformation.
		if (carSelectorStatus) {
			clubInformationClickHandler();
		}
	}, [carSelectorStatus, clubInformationClickHandler]);

	// getting continue status back from <NumberClass />
	const [clubInformationStatus, setClubInformationStatus] = useState(
		false
	);
	const clubInformationHandler = status => {
		if (status) {
			setClubInformationStatus(true);
		}
	};
	useEffect(() => {
		if (clubInformationStatus) {
			formClickHandler();
		}
	}, [clubInformationStatus, formClickHandler]);

	const carNumberHandler = number => {
		if (number) {
			setCarNumber(number);
		}
	};

	const payMembershipHandler = pay => {
		if (pay) {
			setPayMembership(pay);
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
						<li className={clubInformationClass}>Club Information</li>
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
						{clubInformation && (
							<ClubInformation
								eventId={eventId}
								clubInformationStatus={clubInformationHandler}
								carNumberHandler={carNumberHandler}
								payMembershipHandler={payMembershipHandler}
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
								payMembership={payMembership}
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
