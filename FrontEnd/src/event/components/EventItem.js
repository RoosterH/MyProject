import React, { useState, useContext, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';

// DO NOT REMOVE IT, this is a plugin of moment() for moment().countdown
// eslint-disable-next-line
import countdown from 'moment-countdown';

import Button from '../../shared/components/FormElements/Button';

import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Image from '../../shared/components/UIElements/Image';
import Map from '../../shared/components/UIElements/Map';
import Modal from '../../shared/components/UIElements/Modal';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';

import { UserAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './EventItem.css';

const EventItem = props => {
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// useContext is listening to "ClubAuthContext"
	// const clubAuthContext = useContext(ClubAuthContext);
	const userAuthContext = useContext(UserAuthContext);

	// modal section
	const [showModal, setShowModal] = useState(false);
	const openModalHandler = () => setShowModal(true);
	const closeModalHandler = () => {
		closeMapContainer();
		setShowModal(false);
	};

	// modals for courseMap and delete confirmation
	const [showMap, setShowMap] = useState(false);

	// const [showDELModal, setShowDELModal] = useState(false);
	// const [showPublishModal, setShowSubmitModal] = useState(false);

	// event handlers
	const openMapHandler = () => {
		openModalHandler();
		setShowMap(true);
	};
	const closeMapHandler = () => setShowMap(false);
	// const openDELHandler = () => {
	// 	setShowDELModal(true);
	// };
	// const closeDELHandler = () => {
	// 	setShowDELModal(false);
	// };
	// const openPublishHandler = () => {
	// 	setShowSubmitModal(true);
	// };
	// const closePublishHandler = () => {
	// 	setShowSubmitModal(false);
	// };

	const history = useHistory();

	// const confirmDeleteHandler = async () => {
	// 	setShowDELModal(false);
	// 	try {
	// 		await sendRequest(
	// 			process.env.REACT_APP_BACKEND_URL +
	// 				`/events/${props.event.id}`,
	// 			'DELETE',
	// 			null,
	// 			{
	// 				// No need for content-type since body is null,
	// 				// adding JWT to header for authentication
	// 				Authorization: 'Bearer ' + clubAuthContext.clubToken
	// 			}
	// 		);
	// 		history.push(`/events/club/${clubAuthContext.clubId}`);
	// 	} catch (err) {}
	// };

	// const confirmPublishHandler = async () => {
	// 	setShowSubmitModal(false);
	// 	try {
	// 		await sendRequest(
	// 			process.env.REACT_APP_BACKEND_URL +
	// 				`/clubs/publish/${props.event.id}`,
	// 			'PATCH',
	// 			JSON.stringify({ published: true }),
	// 			{
	// 				// No need for content-type since body is null,
	// 				// adding JWT to header for authentication
	// 				'Content-Type': 'application/json',
	// 				Authorization: 'Bearer ' + clubAuthContext.clubToken
	// 			}
	// 		);
	// 		history.push(`/events/club/${clubAuthContext.clubId}`);
	// 	} catch (err) {}
	// };

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
	let formStartDate = moment(props.event.startDate).format(
		'YYYY-MM-DD'
	);
	let validFormModDate = moment().add(1, 'days').format('YYYY-MM-DD');
	const eventImageElement =
		props.event.image !== '' ? (
			<div className="event-item__image">
				<img
					src={
						process.env.REACT_APP_ASSET_URL + `/${props.event.image}`
					}
					alt={props.name}
				/>
			</div>
		) : (
			<div></div>
		);

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
	}, [now, regStartDate, regEndDate]);

	const RegistrationMSG = () => {
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
				// registration closed regTimeline === '4'
				return (
					<h4 className="alert alert-dark" role="alert">
						Registration is now closed
					</h4>
				);
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

	return (
		// React.Frgment connect multiple components
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
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
									process.env.REACT_APP_ASSET_URL +
									`/${props.event.courseMap}`
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
			{/* Modal to show delet confirmation message */}
			{/* <Modal
				className="modal-delete"
				show={showDELModal}
				contentClass="event-item__modal-delete"
				onCancel={closeDELHandler}
				header="Warning!"
				footerClass="event-item__modal-actions"
				footer={
					<React.Fragment>
						<Button inverse onClick={closeDELHandler}>
							CANCEL
						</Button>
						<Button danger onClick={confirmDeleteHandler}>
							DELETE
						</Button>
					</React.Fragment>
				}>
				<p className="modal__content">
					Do you really want to delete {props.event.name}? It cannot
					be recovered after deletion.
				</p>
			</Modal> */}
			{/* <Modal
				className="modal-delete"
				show={showPublishModal}
				contentClass="event-item__modal-delete"
				onCancel={closePublishHandler}
				header="Warning!"
				footerClass="event-item__modal-actions"
				footer={
					<React.Fragment>
						<Button inverse onClick={closePublishHandler}>
							No
						</Button>
						<Button danger onClick={confirmPublishHandler}>
							YES
						</Button>
					</React.Fragment>
				}>
				<p className="modal__content">
					Are you ready to submit {props.event.name}? Please confirm.
				</p>
			</Modal> */}
			{/* This section is for Users and  Clubs that do not own the event */}
			{/* render logo/club name/event type  */}
			{isLoading && <LoadingSpinner asOverlay />}
			{/* {(!clubAuthContext.clubId ||
				clubAuthContext.clubId !== props.event.clubId) && ( */}
			<div className="event-pages eventtype-page">
				<section id="header" title="">
					<div className="section-container">
						<div className="logo-container ">
							<img
								src={
									process.env.REACT_APP_ASSET_URL +
									`/${props.event.clubImage}`
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
			</div>
			{/* )} */}
			{/* this section is for event image */}
			{/* Regitration container */}
			{/* {(!clubAuthContext.clubId ||
				clubAuthContext.clubId !== props.event.clubId) && ( */}
			<div className="section-container">
				{/* event image on the left */}
				<div className="page-basic-container">
					<div className="eventimage-container">
						<img
							src={
								process.env.REACT_APP_ASSET_URL +
								`/${props.event.image}`
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
								src={require('../../shared/utils/png/GMapSmall.png')}
								onClick={() => openMapHandler()}
								onHoover
							/>
							<h4>{props.event.address}</h4>
						</div>
					</div>
					<div className="col-xs-12">
						{/* {!clubAuthContext.clubId && ( */}
						<Button
							inverse={!openRegistration}
							to={`/events/form/${props.event.id}`}
							size="small-orange">
							{buttonName}
						</Button>
						{/* )} */}
					</div>
				</div>
			</div>
			{/* )} */}

			{/* {(!clubAuthContext.clubId ||
				clubAuthContext.clubId !== props.event.clubId) && ( */}
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
									<p>
										{props.event.description}
										<br></br>
									</p>
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
										process.env.REACT_APP_ASSET_URL +
										`/${props.event.courseMap}`
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
			{/* )} */}

			{/* {(!clubAuthContext.clubId ||
				clubAuthContext.clubId !== props.event.clubId) && ( */}
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
									<p>
										{props.event.instruction}
										<br></br>
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* )} */}

			{/* {(!clubAuthContext.clubId ||
				clubAuthContext.clubId !== props.event.clubId) && ( */}
			<div className="section-container">
				<div className="page-basic-container">
					<div className="page-footer"></div>
				</div>
			</div>
			{/* )} */}
		</React.Fragment>
	);
};

export default EventItem;
