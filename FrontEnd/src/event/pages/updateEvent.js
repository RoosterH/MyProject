import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { EVENTS } from './Event';
import Image from '../../shared/components/UIElements/Image';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import { useForm } from '../../shared/hooks/form-hook';
import {
	VALIDATOR_REQUIRE,
	VALIDATOR_MINLENGTH,
	VALIDATOR_FILE
} from '../../shared/util/validators';
import './EventForm.css';
import '../../event/components/EventItem.css';

const formatDate = props => {
	var date = props.split('/');
	return date[2] + '-' + date[0] + '-' + date[1];
};

const UpdateEvent = () => {
	const [showModal, setShowModal] = useState(false);
	const openModalHandler = () => setShowModal(true);
	const closeModalHandler = () => {
		closeMapContainer();
		setShowModal(false);
	};

	const [showCourse, setShowCourse] = useState(false);
	const openCourseHandler = () => {
		openModalHandler();
		setShowCourse(true);
	};
	const closeCourseHandler = () => setShowCourse(false);

	const closeMapContainer = () => {
		showCourse && closeCourseHandler();
	};

	const eventId = useParams().id;

	const event = EVENTS.find(element => element.id === eventId);

	const [formState, inputHandler] = useForm(
		{
			name: {
				value: event.name,
				isValid: true
			},
			title: {
				value: event.title,
				isValid: true
			},
			imageUrl: {
				value: event.imageUrl,
				isValid: true
			},
			startDate: {
				value: event.startDate,
				isValid: true
			},
			endDate: {
				value: event.endDate,
				isValid: true
			},
			venue: {
				value: event.venue,
				isValid: true
			},
			address: {
				value: event.address,
				isValid: true
			},
			coordinate: {
				value: event.coordinate,
				isValid: true
			},
			description: {
				value: event.description,
				isValid: true
			},
			courseMap: {
				value: event.courseMap,
				isValid: true
			}
		},
		true
	);

	const eventUpdateSubmitHandler = event => {
		event.preventDefault();
		console.log(formState.inputs);
	};
	if (!event) {
		return (
			<div className="center">
				<h2>Event not found!</h2>
			</div>
		);
	}

	const startDate = formatDate(formState.inputs.startDate.value);
	const endDate = formatDate(formState.inputs.endDate.value);
	const courseMap = event.courseMap;
	const courseMapElement =
		courseMap !== undefined ? (
			<div className="event-form__coursemap">
				Current Course Map: {courseMap}
				<div>
					<Image
						title={event.title}
						alt={event.title + 'course map'}
						src={event.courseMap}
						onClick={() => openCourseHandler()}
					></Image>
				</div>
			</div>
		) : (
			<div></div>
		);

	return (
		<React.Fragment>
			<Modal
				show={showModal}
				onCancel={() => closeModalHandler()}
				header={event.title}
				contentClass="event-item__modal-content"
				footerClass="event-item__modal-actions"
				footer={<Button onClick={() => closeModalHandler()}>CLOSE</Button>}
			>
				{/* render props.children */}
				<div className="map-container">
					{showCourse && (
						<img
							src={event.courseMap}
							alt={event.alt}
							className="map-container"
						></img>
					)}
					/>}
				</div>
			</Modal>

			<form className="event-form" onSubmit={eventUpdateSubmitHandler}>
				<Input
					id="name"
					element="input"
					type="text"
					label="Name"
					validators={[VALIDATOR_REQUIRE()]}
					errorText="Please enter a valid name"
					onInput={inputHandler}
					initialValue={formState.inputs.name.value}
					initialValid={formState.inputs.name.isValid}
				/>
				<Input
					id="title"
					element="input"
					type="text"
					label="Title"
					validators={[VALIDATOR_REQUIRE()]}
					errorText="Please enter a valid title"
					onInput={inputHandler}
					initialValue={formState.inputs.title.value}
					initialValid={formState.inputs.title.isValid}
				/>
				<Input
					id="imageUrl"
					element="input"
					type="text"
					label="imageUrl"
					validators={[VALIDATOR_REQUIRE()]}
					errorText="Please enter a valid url"
					onInput={inputHandler}
					initialValue={formState.inputs.imageUrl.value}
					initialValid={formState.inputs.imageUrl.isValid}
				/>
				<Input
					id="startDate"
					element="input"
					type="date"
					label="StartDate"
					validators={[VALIDATOR_REQUIRE()]}
					errorText="Please enter a valid date"
					onInput={inputHandler}
					initialValue={startDate}
					initialValid={formState.inputs.startDate.isValid}
				/>
				<Input
					id="endDate"
					element="input"
					type="date"
					label="EndDate"
					validators={[VALIDATOR_REQUIRE()]}
					errorText="Please enter a valid date"
					onInput={inputHandler}
					initialValue={endDate}
					initialValid={formState.inputs.endDate.isValid}
				/>
				<Input
					id="venue"
					element="input"
					type="text"
					label="Venue"
					validators={[VALIDATOR_REQUIRE()]}
					errorText="Please enter a valid venue"
					onInput={inputHandler}
					initialValue={formState.inputs.venue.value}
					initialValid={formState.inputs.venue.isValid}
				/>
				<Input
					id="address"
					element="input"
					type="text"
					label="Address"
					validators={[VALIDATOR_REQUIRE()]}
					errorText="Please enter a valid address"
					onInput={inputHandler}
					initialValue={formState.inputs.address.value}
					initialValid={formState.inputs.address.isValid}
				/>
				<Input
					id="coordinate"
					element="input"
					type="text"
					label="Coordinate format(log, ltg): 37.4015069, -121.1059222"
					validators={[VALIDATOR_REQUIRE()]}
					errorText="Please enter a valid coordinate"
					onInput={inputHandler}
					initialValue={formState.inputs.coordinate.value}
					initialValid={formState.inputs.coordinate.isValid}
				/>
				<Input
					id="description"
					element="textarea"
					label="Description"
					validators={[VALIDATOR_MINLENGTH(5)]}
					errorText="Please enter a valid description (min. 5 characters)"
					onInput={inputHandler}
					initialValue={formState.inputs.description.value}
					initialValid={formState.inputs.description.isValid}
				/>
				<Input
					id="courseMap"
					element="input"
					type="file"
					label="Course Map"
					validators={[VALIDATOR_FILE()]}
					errorText="Image format jpg or png"
					onInput={inputHandler}
					initialValid={formState.inputs.courseMap.isValid}
				/>
				{courseMapElement}

				<Button type="submit" disabled={!formState.isValid}>
					Update Event
				</Button>
				<Button to={`/events/${event.id}`}>Cancel</Button>
			</form>
		</React.Fragment>
	);
};

export default UpdateEvent;
