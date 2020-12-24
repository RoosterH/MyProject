import React, { useState, useContext, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment';

// DO NOT REMOVE IT, this is a plugin of moment() for moment().countdown
// eslint-disable-next-line
import countdown from 'moment-countdown';

import Button from '../../shared/components/FormElements/Button';

import Image from '../../shared/components/UIElements/Image';
import Map from '../../shared/components/UIElements/Map';
import Modal from '../../shared/components/UIElements/Modal';

import { UserAuthContext } from '../../shared/context/auth-context';
import './EventItem.css';

import googleMapImg from '../../shared/utils/png/GMapSmall.png';

const EventItem = props => {
	// coming from Club Event Manager => View Evetns, we want to disable Register Event Button
	const clubReadOnly = props.clubReadOnly;
	// useContext is listening to "ClubAuthContext"
	const userAuthContext = useContext(UserAuthContext);
	// check whether event registration is closed by club
	const [registrationClosed, setRegistrationClosed] = useState(
		props.event.closed
	);

	// modal section
	const [showModal, setShowModal] = useState(false);
	const openModalHandler = () => setShowModal(true);
	const closeModalHandler = () => {
		closeMapContainer();
		setShowModal(false);
	};

	// modals for courseMap and delete confirmation
	const [showMap, setShowMap] = useState(false);

	// event handlers
	const openMapHandler = () => {
		openModalHandler();
		setShowMap(true);
	};
	const closeMapHandler = () => setShowMap(false);
	const [showCourse, setShowCourse] = useState(false);
	const openCourseHandler = () => {
		openModalHandler();
		setShowCourse(true);
	};
	const closeCourseHandler = () => setShowCourse(false);

	const closeMapContainer = () => {
		showMap && closeMapHandler();
		showCourse && closeCourseHandler();
	};

	// date related section
	let startDate = moment(props.event.startDate).format(
		'MM/DD/YYYY, ddd'
	);
	let endDate = moment(props.event.endDate).format('MM/DD/YYYY, ddd');

	const [regDuration, setRegDuration] = useState('');
	useEffect(() => {
		let mounted = true;
		let runSetInterval;
		const countInterval = () => {
			// setInterval runs setRegStartDuration every 1 sec
			if (moment(props.event.regStartDate) > moment()) {
				runSetInterval = setInterval(
					() =>
						setRegDuration(
							moment().countdown(props.event.regStartDate).toString()
						),
					1000
				);
			} else if (moment(props.event.regEndDate) > moment()) {
				runSetInterval = setInterval(
					() =>
						setRegDuration(
							moment().countdown(props.event.regEndDate).toString()
						),
					1000
				);
			}
		};
		if (mounted) {
			countInterval();
		}
		return () => {
			mounted = false;
			clearInterval(runSetInterval);
		};
	}, [props.event.regStartDate, props.event.regEndDate]);

	// Reason to use useEffect is because we cannot set state in render()
	// For example, if calling setOpenRegistration durning rendering RegistrationMSG, there will be a warning msg.
	// '0': registration not open yet
	// '1': registration closes in more than 7 days
	// '2': registration closes in more than 3 days
	// '3': registration closes in less than 3 days
	// '4': registration closed
	const [openRegistration, setOpenRegistration] = useState(false);
	const [regTimeline, setRegTimeline] = useState('0');
	let regStartDate = props.event.regStartDate;
	let regEndDate = props.event.regEndDate;
	let now = moment();
	useEffect(() => {
		if (registrationClosed) {
			setOpenRegistration(false);
		} else {
			if (moment(regStartDate) > now) {
				setRegTimeline('0');
			} else {
				if (moment(regEndDate) - now > 604800000) {
					setRegTimeline('1');
					setOpenRegistration(true);
				} else if (moment(regEndDate) - now > 259200000) {
					setOpenRegistration(true);
					setRegTimeline('2');
				} else if (moment(regEndDate) - now > 0) {
					setRegTimeline('3');
					setOpenRegistration(true);
				} else {
					setOpenRegistration(false);
					setRegTimeline('4');
				}
			}
		}
	}, [
		now,
		regStartDate,
		regEndDate,
		setOpenRegistration,
		registrationClosed
	]);

	const RegistrationMSG = () => {
		if (registrationClosed) {
			return (
				<h4 className="alert alert-dark" role="alert">
					Registration is now closed
				</h4>
			);
		} else {
			if (regTimeline === '0') {
				// registration not yet started
				return (
					<h4 className="alert alert-primary" role="alert">
						Registration starts in {regDuration}
					</h4>
				);
			} else {
				if (regTimeline === '1') {
					// registration closed in more than 7 days
					return (
						<h4 className="alert alert-success" role="alert">
							Registration ends in {regDuration}
						</h4>
					);
				} else if (regTimeline === '2') {
					// registration closed in more than 3 days
					return (
						<h4 className="alert alert-warning" role="alert">
							Registration ends in {regDuration}
						</h4>
					);
				} else if (regTimeline === '3') {
					// registration closed in less than 3 days
					return (
						<h4 className="alert alert-danger" role="alert">
							Registration ends in {regDuration}
						</h4>
					);
				} else {
					// (regTimeline === '4')
					return (
						<h4 className="alert alert-dark" role="alert">
							Registration is now closed
						</h4>
					);
				}
			}
		}
	};

	const [showDescription, setShowDescription] = useState(
		'btn collapsible minus-sign toggle-btn'
	);
	const toggleDescriptionButton = () => {
		if (showDescription === 'btn collapsible minus-sign toggle-btn') {
			setShowDescription('btn collapsible plus-sign toggle-btn');
		} else {
			setShowDescription('btn collapsible minus-sign toggle-btn');
		}
	};

	const [showInstruction, setShowInstruction] = useState(
		'btn collapsible minus-sign toggle-btn'
	);
	const toggleInstructionButton = () => {
		if (showInstruction === 'btn collapsible minus-sign toggle-btn') {
			setShowInstruction('btn collapsible plus-sign toggle-btn');
		} else {
			setShowInstruction('btn collapsible minus-sign toggle-btn');
		}
	};

	// Determine this is a user registered event
	const [userRegisteredEvent, setUserRegisteredEvent] = useState(
		false
	);
	const [userOnWaitlist, setUserOnWaitlist] = useState(false);
	const [waitlistMSG, setWaitlistMSG] = useState(
		'You are currently on waitlist.'
	);
	const [userOnGroupWaitlist, setUserOnGroupWaitlist] = useState(
		false
	);

	// Instead of getting information from backend, trick here is to useLocalStorage.
	// Once user entered the event, form.jsx returns entry back to EventForm.formSubmitted()
	// We will save the entry to localStorage "UserData.userEntries" array.
	// Here we match the current event with the array to determine using 'REGISTER EVENT' or 'MODIFY ENTRY'
	const [buttonName, setButtonName] = useState('REGISTER EVENT');
	let eventId = useParams().id;
	useEffect(() => {
		if (userAuthContext.userId) {
			let storageData = JSON.parse(localStorage.getItem('userData'));
			if (storageData.userId === userAuthContext.userId) {
				let userEntries = storageData.userEntries;
				if (userEntries) {
					for (let i = 0; i < userEntries.length; ++i) {
						if (userEntries[i].eventId === eventId) {
							setUserRegisteredEvent(true);
							if (userEntries[i].waitlist !== undefined) {
								let waitlist = false;
								let tmpWaitlistMSG = waitlistMSG;
								for (
									let j = 0;
									j < userEntries[i].waitlist.length;
									++j
								) {
									if (userEntries[i].waitlist[j]) {
										if (waitlist) {
											tmpWaitlistMSG += ' and Day ' + (j + 1);
										} else {
											if (userEntries[i].waitlist.length > 1) {
												tmpWaitlistMSG += ' Day ' + (j + 1);
												waitlist = true;
											}
										}
										setUserOnWaitlist(true);
									}
								}
								if (waitlist) {
									tmpWaitlistMSG += '.';
									setWaitlistMSG(tmpWaitlistMSG);
								}
							}
							if (userEntries[i].groupWaitlist) {
								setUserOnGroupWaitlist(true);
							}
							setButtonName('MODIFY ENTRY');
							break;
						}
					}
				}
			}
		}
	}, [
		userAuthContext.userId,
		eventId,
		setUserRegisteredEvent,
		setButtonName
	]);

	const [containerClassName, setContainerClassName] = useState(
		'entryinfo-container'
	);

	useEffect(() => {
		if (props.event.courseMap) {
			setContainerClassName('entryinfo-container-coursemap-exists');
		}
	}, [props.event.courseMap, setContainerClassName]);

	return (
		// React.Frgment connect multiple components
		<React.Fragment>
			{/* Modal to show google map and course map */}
			<Modal
				show={showModal}
				onCancel={() => closeModalHandler()}
				header={props.event.name}
				contentClass="event-item__modal-content"
				footerClass="event-item__modal-actions"
				footer={
					<Button onClick={() => closeModalHandler()}>CLOSE</Button>
				}>
				{/* render props.children */}
				<div className="map-container">
					{showCourse && (
						<React.Fragment>
							<h3>Right click on map for more actions.</h3>
							<img
								src={
									// process.env.REACT_APP_ASSET_URL +
									// `/${props.event.courseMap}`
									props.event.courseMap
								}
								alt={props.event.alt}
								className="map-container"></img>
						</React.Fragment>
					)}
					{showMap && (
						<Map center={props.event.coordinate} zoom={10} />
					)}
				</div>
			</Modal>
			{/* This section is for Users and  Clubs that do not own the event */}
			{/* render logo/club name/event type  */}
			<div className="event-pages eventtype-page">
				<section id="header" title="">
					<div className="section-container">
						<div className="logo-container ">
							<img
								src={
									// process.env.REACT_APP_ASSET_URL +
									// `/${props.event.clubImage}`
									props.event.clubImage
								}
								alt={props.event.clubName}
							/>
						</div>
						<div className="primary-info">
							<h3 className="header-title">{props.event.name}</h3>
						</div>
						<div className="clubname-container">
							From{' '}
							<a
								href="/"
								target="_blank"
								className="provider-clubname">
								{props.event.clubName}
							</a>
						</div>
						<div className="clearfix">
							<div>
								<div className="eventitem-eventtype">
									<a href="/" className="eventtype">
										{props.event.type}
									</a>
								</div>
							</div>
						</div>
					</div>
				</section>
				{/* this section is for event image */}
				{/* Regitration container */}
				<div className="section-container">
					{/* event image on the left */}
					<div className="page-basic-container">
						<div className="eventimage-container">
							<img
								src={
									// process.env.REACT_APP_ASSET_URL +
									// `/${props.event.image}`
									props.event.image
								}
								alt={props.event.name}
								className="eventimage-container-img"
							/>
						</div>
					</div>
					{/* registration container on the right */}
					<div className="registration-container">
						<div className="col-xs-12">
							<div className="clearfix">
								<RegistrationMSG />
							</div>
							<div className="section">
								<strong>
									{startDate} — {endDate}
								</strong>
								<br /> <br />
							</div>
							<div>
								<h3>{props.event.venue}</h3>
								<Image
									title={props.event.venue}
									alt={props.event.venue}
									// src={require('../../shared/utils/png/GMapSmall.png')}
									src={googleMapImg}
									onClick={() => openMapHandler()}
									onHoover
								/>
								<h4>{props.event.address}</h4>
							</div>
						</div>
						<div className="col-xs-12">
							{buttonName === 'REGISTER EVENT' && (
								<Link
									to={{
										pathname: `/events/newEntryManager/${props.event.id}`,
										state: {
											eventName: props.event.name
										}
									}}>
									<Button
										disabled={!openRegistration || clubReadOnly}
										size="small-orange">
										{buttonName}
									</Button>
								</Link>
							)}
							{buttonName === 'MODIFY ENTRY' && (
								<Link
									to={{
										pathname: `/events/editEntryManager/${props.event.id}`,
										state: {
											eventName: props.event.name
											// regClosed: !openRegistration
										}
									}}>
									<Button
										disabled={!openRegistration}
										size="small-orange">
										{buttonName}
									</Button>
								</Link>
							)}
							<div className="waitlist-msg">
								{userOnWaitlist && waitlistMSG}
							</div>
						</div>
					</div>
					{userRegisteredEvent && (
						// <div className="entryinfo-container">
						<div className={containerClassName}>
							<div className="col-xs-12">
								{/* {userOnWaitlist && waitlistMSG} */}
								<div>
									<Link
										to={{
											pathname: `/events/entrylist/${eventId}`,
											state: {
												displayName: true,
												eventName: props.event.name,
												eventId: eventId
											}
										}}>
										View Event Entry List
									</Link>
								</div>
								<div>
									<Link
										to={{
											pathname: `/events/entrylist/${eventId}`,
											state: {
												displayName: true,
												eventName: props.event.name,
												eventId: eventId
											}
										}}>
										View Event Result
									</Link>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="section-container">
					<div className="page-basic-container">
						<div className="about-description">
							<div className="toggle-section description">
								<div className="short-description">
									<div className="sub-heading">
										<a
											href="#description"
											data-toggle="collapse"
											onClick={toggleDescriptionButton}>
											Event Description {'   '}
											<button
												type="button"
												className={showDescription}
												onClick={toggleDescriptionButton}></button>
										</a>
									</div>
									<div id="description" className="collapse show">
										<div
											dangerouslySetInnerHTML={{
												__html: props.event.description
											}}></div>
										<br />
									</div>
								</div>
							</div>
						</div>
					</div>

					{props.event.courseMap && (
						<div className="courseMap-container">
							<div className="col-xs-12">
								<div className="section">
									<div className="coursemap-title">Course Map</div>
								</div>
								<div>
									<Image
										title={props.event.courseMap}
										alt={props.event.courseMap}
										src={
											// process.env.REACT_APP_ASSET_URL +
											// `/${props.event.courseMap}`
											props.event.courseMap
										}
										onClick={() => openCourseHandler()}
										onHoover
										className="courseMap"
									/>
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="section-container">
					<div className="page-basic-container">
						<div className="about-description">
							<div className="toggle-section description">
								<div className="short-description">
									<div className="sub-heading">
										<a
											href="#instruction"
											data-toggle="collapse"
											onClick={toggleInstructionButton}>
											Instruction {'   '}
											<button
												type="button"
												className={showInstruction}
												onClick={toggleInstructionButton}></button>
										</a>
									</div>
									<div id="instruction" className="collapse show">
										<div
											dangerouslySetInnerHTML={{
												__html: props.event.instruction
											}}></div>
										<br />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="section-container">
					<div className="page-basic-container">
						<div className="page-footer"></div>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default EventItem;
