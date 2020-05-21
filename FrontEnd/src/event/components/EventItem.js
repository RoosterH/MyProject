import React, { useState } from 'react';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import Image from '../../shared/components/UIElements/Image';
import Map from '../../shared/components/UIElements/Map';
import Modal from '../../shared/components/UIElements/Modal';
import './EventItem.css';

const EventItem = props => {
	const [showMap, setShowMap] = useState(false);

	const openMapHandler = props => {
		setShowMap(true);
	};

	const closeMapHandler = () => setShowMap(false);

	return (
		// React.Frgment connect multiple components
		<React.Fragment>
			{/* Render Modal */}
			<Modal
				show={showMap}
				onCancel={closeMapHandler}
				header={props.event.title}
				contentClass="event-item__modal-content"
				footerClass="event-item__modal-actions"
				footer={<Button onClick={closeMapHandler}>CLOSE</Button>}>
				{/* render props.children */}
				<div className="map-container">
					<img src={props.event.courseMap} className="map-container"></img>
					{/*<Map center={props.event.coordinate} zoom={10} />*/}
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
						{props.event.startDate} -- {props.event.endDate}
					</h3>
					<h3>{props.event.venue}</h3>
					<h4>{props.event.address}</h4>
					<Button inverse onClick={openMapHandler}>
						Google Map
					</Button>
					<p>{props.event.description}</p>
				</div>
				<div className="event-item__coursemap">
					<Image
						title={props.event.title}
						alt={props.event.title + 'course map'}
						src={props.event.courseMap}
						onClick={openMapHandler}></Image>
				</div>
				<div className="event-item__actions">
					<Button to={`/events/${props.event.id}/form`}>ENTRY FORM</Button>
					<Button to={`/events/${props.event.id}`}>EDIT</Button>
					<Button danger>DELETE</Button>
				</div>
			</Card>
		</React.Fragment>
	);
};

export default EventItem;
