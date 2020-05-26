import React, { useState } from 'react';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import Image from '../../shared/components/UIElements/Image';
import Map from '../../shared/components/UIElements/Map';
import Modal from '../../shared/components/UIElements/Modal';

import './EventItem.css';

const EventItem = props => {
	const [showModal, setShowModal] = useState(false);
	const openModalHandler = () => setShowModal(true);
	const closeModalHandler = () => {
		closeMapContainer();
		setShowModal(false);
	};

	const [showMap, setShowMap] = useState(false);
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
	return (
		// React.Frgment connect multiple components
		<React.Fragment>
			{/* Render Modal */}
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

			<Card className="event-item__content">
				<div>
					<h2>{props.event.title}</h2>
				</div>
				<div className="event-item__image">
					<img src={props.event.imageUrl} alt={props.title} />
				</div>
				<div className="event-item__info">
					<h3>
						{props.event.startDate},{startDay} — {props.event.endDate},{endDay}
					</h3>
					<h3>{props.event.venue}</h3>
					<h4>{props.event.address}</h4>
					<Button inverse onClick={() => openMapHandler()}>
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
					<Button to={`/events/${props.event.id}/form`}>ENTRY FORM</Button>
					<Button to={`/events/update/${props.event.id}`}>EDIT</Button>
					<Button danger>DELETE</Button>
				</div>
			</Card>
		</React.Fragment>
	);
};

export default EventItem;
