import React, { useState, useContext } from 'react';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import Image from '../../shared/components/UIElements/Image';
import Map from '../../shared/components/UIElements/Map';
import Modal from '../../shared/components/UIElements/Modal';
import { ClubAuthContext } from '../../shared/context/auth-context';
import './EventItem.css';
import ClubAuth from '../../clubs/pages/ClubsAuth';

const EventItem = props => {
	// useContext is listening to "ClubAuthContext"
	const clubAuth = useContext(ClubAuthContext);

	const [showModal, setShowModal] = useState(false);
	const openModalHandler = () => setShowModal(true);
	const closeModalHandler = () => {
		closeMapContainer();
		setShowModal(false);
	};

	const [showMap, setShowMap] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);

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

	const confirmDeleteHandler = () => {
		setShowConfirmModal(false);
		console.log('Deleting ...');
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
	var startDate = new Date(props.event.startDate);
	var startDay = startDate.toLocaleDateString('en-US', {
		weekday: 'short'
	});
	var endDate = new Date(props.event.endDate);
	var endDay = endDate.toLocaleDateString('en-US', {
		weekday: 'short'
	});

	const coordinate = props.event.coordinate.split(',');
	const coordinateJSON = JSON.parse(
		JSON.stringify({
			lat: parseFloat(coordinate[0]),
			lng: parseFloat(coordinate[1])
		})
	);

	const eventImageElement =
		props.event.eventImage !== '' ? (
			<div className="event-item__image">
				<img src={props.event.eventImage} alt={props.title} />
			</div>
		) : (
			<div></div>
		);

	return (
		// React.Frgment connect multiple components
		<React.Fragment>
			{/* Modal to show google map and course map */}
			<Modal
				show={showModal}
				onCancel={() => closeModalHandler()}
				header={props.event.title}
				contentClass="event-item__modal-content"
				footerClass="event-item__modal-actions"
				footer={<Button onClick={() => closeModalHandler()}>CLOSE</Button>}
			>
				{/* render props.children */}
				<div className="map-container">
					{showCourse && (
						<img
							src={props.event.courseMap}
							alt={props.event.alt}
							className="map-container"
						></img>
					)}
					{showMap && <Map center={coordinateJSON} zoom={10} />}
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
				}
			>
				<p className="modal__content">
					Do you really want to delete {props.event.title}? It cannot be
					recovered after deletion.
				</p>
			</Modal>

			<Card className="event-item__content">
				<div>
					<h2>{props.event.title}</h2>
				</div>
				{eventImageElement}
				<div className="event-item__info">
					<h3>
						{props.event.startDate},{startDay} — {props.event.endDate},{endDay}
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
						title={props.event.title}
						alt={props.event.title + 'course map'}
						src={props.event.courseMap}
						onClick={() => openCourseHandler()}
					></Image>
				</div>
				<div className="event-item__actions">
					{clubAuth.isClubLoggedIn && (
						<Button to={`/events/${props.event.id}/form`}>ENTRY FORM</Button>
					)}
					{clubAuth.isClubLoggedIn && (
						<Button to={`/events/update/${props.event.id}`}>EDIT</Button>
					)}
					{clubAuth.isClubLoggedIn && (
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
