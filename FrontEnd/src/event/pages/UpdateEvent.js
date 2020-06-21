import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import Image from '../../shared/components/UIElements/Image';
import Input from '../../shared/components/FormElements/Input';
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
	// Modal section
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

	// Form section
	const [isLoading, setIsLoading] = useState(true);
	const eventId = useParams().id;
	const [formState, inputHandler, setFormData] = useForm(
		{
			name: {
				value: '',
				isValid: false
			},
			image: {
				value: '',
				isValid: false
			},
			startDate: {
				value: '',
				isValid: false
			},
			endDate: {
				value: '',
				isValid: false
			},
			venue: {
				value: '',
				isValid: false
			},
			address: {
				value: '',
				isValid: false
			},
			coordinate: {
				value: '',
				isValid: false
			},
			description: {
				value: '',
				isValid: false
			},
			courseMap: {
				value: '',
				isValid: false
			}
		},
		false
	);
	const EVENTS = [];
	const identifiedEvent = EVENTS.find(
		element => element.id === eventId
	);

	useEffect(() => {
		if (identifiedEvent) {
			setFormData(
				{
					name: {
						value: identifiedEvent.name,
						isValid: true
					},
					image: {
						value: identifiedEvent.image,
						isValid: true
					},
					startDate: {
						value: identifiedEvent.startDate,
						isValid: true
					},
					endDate: {
						value: identifiedEvent.endDate,
						isValid: true
					},
					venue: {
						value: identifiedEvent.venue,
						isValid: true
					},
					address: {
						value: identifiedEvent.address,
						isValid: true
					},
					coordinate: {
						value: identifiedEvent.coordinate,
						isValid: true
					},
					description: {
						value: identifiedEvent.description,
						isValid: true
					},
					courseMap: {
						value: identifiedEvent.courseMap,
						isValid: true
					}
				},
				true
			);
		}
		setIsLoading(false);
	}, [setFormData, identifiedEvent]);

	const eventUpdateSubmitHandler = identifiedEvent => {
		identifiedEvent.preventDefault();
		console.log(formState.inputs);
	};

	if (!identifiedEvent) {
		return (
			<div className="center">
				<Card>
					<h2>Event not found!</h2>
				</Card>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="center">
				<h2>Page is loading...</h2>
			</div>
		);
	}
	// changing date format from dd-mm-year to mm-dd-year
	let today = new Date().toISOString().substr(0, 10);
	var startDate = formatDate(formState.inputs.startDate.value);
	const endDate = formatDate(formState.inputs.endDate.value);

	// construct course map element to show it on modal
	const courseMap = identifiedEvent.courseMap;
	const courseMapElement =
		courseMap !== undefined ? (
			<div className="event-form__coursemap">
				Current Course Map: {courseMap}
				<div>
					<Image
						title={identifiedEvent.name}
						alt={identifiedEvent.name + 'course map'}
						src={identifiedEvent.courseMap}
						onClick={() => openCourseHandler()}></Image>
				</div>
			</div>
		) : (
			<div></div>
		);

	return (
		<React.Fragment>
			{formState.inputs.name.value && (
				<Modal
					show={showModal}
					onCancel={() => closeModalHandler()}
					header={identifiedEvent.name}
					contentClass="event-item__modal__content"
					footerClass="event-item__modal-actions"
					headerClass="event-item__modal__header"
					footer={
						<Button onClick={() => closeModalHandler()}>CLOSE</Button>
					}>
					{/* render props.children */}
					<div className="map-container">
						{showCourse && (
							<img
								src={identifiedEvent.courseMap}
								alt={identifiedEvent.alt}
								className="map-container"></img>
						)}
					</div>
				</Modal>
			)}

			{formState.inputs.name.value && (
				<form
					className="event-form"
					onSubmit={eventUpdateSubmitHandler}>
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
						id="image"
						element="input"
						type="text"
						label="Event Image (optional in jpg or png)"
						validators={[VALIDATOR_REQUIRE()]}
						errorText="Image format jpg or png"
						onInput={inputHandler}
						initialValue={formState.inputs.image.value}
						initialValid={formState.inputs.image.isValid}
					/>
					<Input
						id="startDate"
						element="input"
						type="date"
						min={today}
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
						min={formState.inputs.startDate.value}
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
						label="Course Map (optional in jpg or png)"
						validators={[VALIDATOR_FILE()]}
						errorText="Image format jpg or png"
						onInput={inputHandler}
						initialValid={formState.inputs.courseMap.isValid}
					/>

					{courseMapElement}

					<Button type="submit" disabled={!formState.isValid}>
						Update Event
					</Button>
					<Button to={`/events/${identifiedEvent.id}`}>Cancel</Button>
				</form>
			)}
		</React.Fragment>
	);
};

export default UpdateEvent;
