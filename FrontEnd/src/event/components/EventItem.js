import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

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
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	// event handlers
	const openMapHandler = () => {
		openModalHandler();
		setShowMap(true);
	};
	const closeMapHandler = () => setShowMap(false);
	const showDeleteWarningHandler = () => {
		setShowConfirmModal(true);
	};
	const cancelDeleteHandler = () => {
		setShowConfirmModal(false);
	};

	const history = useHistory();
	const confirmDeleteHandler = async () => {
		setShowConfirmModal(false);
		try {
			await sendRequest(
				`http://localhost:5000/api/events/${props.event.id}`,
				'DELETE'
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
				<img src={props.event.image} alt={props.name} />
			</div>
		) : (
			<div></div>
		);

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
								src={props.event.courseMap}
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
				show={showConfirmModal}
				contentClass="event-item__modal-delete"
				onCancel={cancelDeleteHandler}
				header="Warning!"
				footerClass="event-item__modal-actions"
				footer={
					<React.Fragment>
						<Button inverse onClick={cancelDeleteHandler}>
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
			<Card className="event-item__content">
				{isLoading && <LoadingSpinner asOverlay />}
				<div>
					<h2>{props.event.name}</h2>
				</div>
				{eventImageElement}
				<div className="event-item__info">
					<h3>
						{startDate} — {endDate}
					</h3>
					<h3>{props.event.venue}</h3>
					<h4>{props.event.address}</h4>
					<Button size="small" onClick={() => openMapHandler()}>
						Google Map
					</Button>
					<p>{props.event.description}</p>
				</div>
				<div className="event-item__coursemap">
					<Image
						title={props.event.name}
						alt={props.event.name + 'course map'}
						src={props.event.courseMap}
						onClick={() => openCourseHandler()}></Image>
				</div>
				<div className="event-item__actions">
					{clubAuth.clubId === props.event.clubId && (
						<Button to={`/events/${props.event.id}/form`}>
							ENTRY FORM
						</Button>
					)}
					{clubAuth.clubId === props.event.clubId &&
						formStartDate > validFormModDate && (
							<Button to={`/events/update/${props.event.id}`}>
								EDIT
							</Button>
						)}
					{clubAuth.clubId === props.event.clubId &&
						formStartDate > validFormModDate && (
							<Button danger onClick={showDeleteWarningHandler}>
								DELETE
							</Button>
						)}
				</div>
			</Card>
		</React.Fragment>
	);
};

export default EventItem;
