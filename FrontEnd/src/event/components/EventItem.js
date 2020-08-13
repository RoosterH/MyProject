import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

// DO NOT REMOVE IT, this is a plugin of moment() for moment().countdown
// eslint-disable-next-line
import countdown from 'moment-countdown';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Image from '../../shared/components/UIElements/Image';
import Map from '../../shared/components/UIElements/Map';
import Modal from '../../shared/components/UIElements/Modal';

import { ClubAuthContext } from '../../shared/context/auth-context';
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
	const clubAuth = useContext(ClubAuthContext);

	// modal section
	const [showModal, setShowModal] = useState(false);
	const openModalHandler = () => setShowModal(true);
	const closeModalHandler = () => {
		closeMapContainer();
		setShowModal(false);
	};

	// modals for courseMap and delete confirmation
	const [showMap, setShowMap] = useState(false);
	const [showDELModal, setShowDELModal] = useState(false);
	const [showPublishModal, setShowSubmitModal] = useState(false);

	// event handlers
	const openMapHandler = () => {
		openModalHandler();
		setShowMap(true);
	};
	const closeMapHandler = () => setShowMap(false);
	const openDELHandler = () => {
		setShowDELModal(true);
	};
	const closeDELHandler = () => {
		setShowDELModal(false);
	};
	const openPublishHandler = () => {
		setShowSubmitModal(true);
	};
	const closePublishHandler = () => {
		setShowSubmitModal(false);
	};

	const history = useHistory();
	const confirmDeleteHandler = async () => {
		setShowDELModal(false);
		try {
			await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/events/${props.event.id}`,
				'DELETE',
				null,
				{
					// No need for content-type since body is null,
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + clubAuth.clubToken
				}
			);
			history.push(`/events/club/${clubAuth.clubId}`);
		} catch (err) {}
	};

	const confirmPublishHandler = async () => {
		setShowSubmitModal(false);
		try {
			await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/clubs/publish/${props.event.id}`,
				'PATCH',
				JSON.stringify({ published: true }),
				{
					// No need for content-type since body is null,
					// adding JWT to header for authentication
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + clubAuth.clubToken
				}
			);
			history.push(`/events/club/${clubAuth.clubId}`);
		} catch (err) {}
	};

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

	const RegistrationMSG = () => {
		if (moment(props.event.regStartDate) > moment()) {
			// registration not yet started
			return (
				<h4 className="alert alert-primary" role="alert">
					Registration starts in {regDuration}
				</h4>
			);
		} else {
			if (moment(props.event.regEndDate) - moment() > 604800000) {
				// registration closed in more than 7 days
				return (
					<h4 className="alert alert-success" role="alert">
						Registration ends in {regDuration}
					</h4>
				);
			} else if (
				moment(props.event.regEndDate) - moment() >
				259200000
			) {
				// registration closed in more than 3 days
				return (
					<h4 className="alert alert-warning" role="alert">
						Registration ends in {regDuration}
					</h4>
				);
			} else if (moment(props.event.regEndDate) - moment() > 0) {
				// registration closed in less than 3 days
				return (
					<h4 className="alert alert-danger" role="alert">
						Registration ends in {regDuration}
					</h4>
				);
			} else {
				// registration closed
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
			<Modal
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
			</Modal>
			<Modal
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
			</Modal>
			{/* This section is for club logo/club name/event type */}
			{!clubAuth.clubId && (
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
			)}
			{/* this section is for event image */}
			{/* Regitration container */}
			{!clubAuth.clubId && (
				<div className="section-container">
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

					<div className="registration-container">
						<div className="col-xs-12">
							<div className="clearfix">
								<RegistrationMSG />
								{/* <div class="section">
								<a
									href="javascript:void(0);"
									class="btn btn-default btn-xs share-btn">
									<span class="share-btn-icon"></span>
								</a>
								<div class="sharethis hidden">
									<div
										class="sharethis-inline-share-buttons sharethis-buttons"
										data-title="Fit4Dance NYC | Dance Fitness Party - All Ages | ActivityHero"
										data-url="https://www.activityhero.com/biz/fit4dance-nyc/dance-fitness-party-all-ages?location_id=126306&amp;schedule_id=537478&amp;utm_source=share-this&amp;utm_campaign=2019-12-18&amp;utm_medium=share_schedule"></div>
								</div>
							</div> */}
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
							{!clubAuth.clubId && (
								<Button
									to={`/events/form/${props.event.id}`}
									size="small-orange">
									REGISTER EVENT
								</Button>
							)}
						</div>
					</div>
				</div>
			)}

			{!clubAuth.clubId && (
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
												// className="btn collapsible minus-sign toggle-btn"
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
				</div>
			)}

			{!clubAuth.clubId && (
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
												// className="btn collapsible minus-sign toggle-btn"
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
			)}

			{!clubAuth.clubId && (
				<div className="section-container">
					<div className="page-basic-container">
						<div className="page-footer"></div>
					</div>
				</div>
			)}

			{/* for Clubs */}
			{clubAuth.clubId === props.event.clubId && (
				<Card className="event-item__content">
					{isLoading && <LoadingSpinner asOverlay />}
					<div>
						<h2 className="alert alert-primary" role="alert">
							{props.event.name}
						</h2>
					</div>
					{eventImageElement}
					<div className="event-item__info">
						<RegistrationMSG />
						<h3>
							{startDate} — {endDate}
						</h3>
						<h3>{props.event.venue}</h3>
						<h4>{props.event.address}</h4>
						<Button
							size="small-googlemap"
							onClick={() => openMapHandler()}>
							Google Map
						</Button>
						<div className="event-item__description">
							<p>{props.event.description}</p>
						</div>
						<div className="event-item__description">
							<h3 className="event-item__content__h3heavy">
								Special Instructions:
							</h3>
							<p className="event-item__description">
								{props.event.instruction}
							</p>
						</div>
					</div>
					<div className="event-item__coursemap">
						{props.event.courseMap && (
							<React.Fragment>
								<h3>Course Map </h3>
								<Image
									title={props.event.name}
									alt={props.event.name + 'course map'}
									src={
										process.env.REACT_APP_ASSET_URL +
										`/${props.event.courseMap}`
									}
									onClick={() => openCourseHandler()}
									onHoover
								/>
							</React.Fragment>
						)}
					</div>
					<div className="event-item__actions">
						{clubAuth.clubId === props.event.clubId && (
							<Button
								to={`/events/formbuilder/${props.event.id}`}
								size="small">
								ENTRY FORM
							</Button>
						)}
						{clubAuth.clubId === props.event.clubId &&
							formStartDate > validFormModDate && (
								<Button
									to={`/events/update/${props.event.id}`}
									size="small">
									EDIT
								</Button>
							)}
						{clubAuth.clubId === props.event.clubId &&
							!props.event.published &&
							formStartDate > validFormModDate &&
							props.event.entryFormData && (
								<Button
									disabele={props.event.published}
									onClick={openPublishHandler}
									size="small">
									PUBLISH
								</Button>
							)}
						{clubAuth.clubId === props.event.clubId &&
							!props.event.published &&
							formStartDate > validFormModDate && (
								<Button danger onClick={openDELHandler} size="small">
									DELETE
								</Button>
							)}
					</div>
				</Card>
			)}
		</React.Fragment>
	);
};

export default EventItem;
