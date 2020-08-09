import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import countdown from 'moment-countdown'; // moment plugin for moment().countdown

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
					{!clubAuth.clubId === props.event.clubId && (
						<Button
							to={`/events/form/${props.event.id}`}
							size="small">
							REGISTER EVENT
						</Button>
					)}
				</div>
			</Card>
		</React.Fragment>
	);
};

export default EventItem;
