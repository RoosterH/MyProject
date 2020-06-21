import React, { useState, useContext } from 'react';
import moment from 'moment';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import Image from '../../shared/components/UIElements/Image';
import Map from '../../shared/components/UIElements/Map';
import Modal from '../../shared/components/UIElements/Modal';
import { ClubAuthContext } from '../../shared/context/auth-context';
import './EventItem.css';

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
	let startDate = moment(props.event.startDate).format(
		'MM/DD/YYYY, ddd'
	);
	let endDate = moment(props.event.endDate).format('MM/DD/YYYY, ddd');

	const eventImageElement =
		props.event.image !== '' ? (
			<div className="event-item__image">
				<img src={props.event.image} alt={props.title} />
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
				footer={
					<Button onClick={() => closeModalHandler()}>CLOSE</Button>
				}>
				{/* render props.children */}
				<div className="map-container">
					{showCourse && (
						<img
							src={props.event.courseMap}
							alt={props.event.alt}
							className="map-container"></img>
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
					Do you really want to delete {props.event.title}? It cannot
					be recovered after deletion.
				</p>
			</Modal>

			<Card className="event-item__content">
				<div>
					<h2>{props.event.title}</h2>
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
						title={props.event.title}
						alt={props.event.title + 'course map'}
						src={props.event.courseMap}
						onClick={() => openCourseHandler()}></Image>
				</div>
				<div className="event-item__actions">
					{clubAuth.isClubLoggedIn && (
						<Button to={`/events/${props.event.id}/form`}>
							ENTRY FORM
						</Button>
					)}
					{clubAuth.isClubLoggedIn && (
						<Button to={`/events/update/${props.event.id}`}>
							EDIT
						</Button>
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
