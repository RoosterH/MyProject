import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useParams, useHistory } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Image from '../../shared/components/UIElements/Image';
import Input from '../../shared/components/FormElements/Input';
import Modal from '../../shared/components/UIElements/Modal';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import {
	VALIDATOR_FILE,
	VALIDATOR_REQUIRE,
	VALIDATOR_MINLENGTH,
	VALIDATOR_STARTDATE
} from '../../shared/util/validators';
import './EventForm.css';
import '../../event/components/EventItem.css';

const UpdateEvent = () => {
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	// initial state undefined
	const [loadedEvent, setLoadedEvent] = useState();

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

	// get eventId from url
	const eventId = useParams().id;
	const history = useHistory();

	// Form section
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

	useEffect(() => {
		const fetchEvent = async () => {
			try {
				const responseData = await sendRequest(
					`http://localhost:5000/api/events/${eventId}`
				);
				setLoadedEvent(responseData.event);

				// setFormData is to set data in memory.  In the case, there are fields that
				// are not allowed to be udpated, we will use memeory data to update.
				// <Input initialValue={ }> is for GUI
				setFormData(
					{
						name: {
							value: responseData.event.name,
							isValid: true
						},
						image: {
							value: responseData.event.image,
							isValid: true
						},
						startDate: {
							value: responseData.event.startDate,
							isValid: true
						},
						endDate: {
							value: responseData.event.endDate,
							isValid: true
						},
						venue: {
							value: responseData.event.venue,
							isValid: true
						},
						address: {
							value: responseData.event.address,
							isValid: true
						},
						description: {
							value: responseData.event.description,
							isValid: true
						},
						courseMap: {
							value: responseData.event.courseMap,
							isValid: true
						}
					},
					true
				);
			} catch (err) {}
		};
		fetchEvent();
	}, [sendRequest, eventId, setFormData]);

	const eventUpdateSubmitHandler = async event => {
		event.preventDefault();
		try {
			await sendRequest(
				`http://localhost:5000/api/events/${eventId}`,
				'PATCH',
				{
					'Content-Type': 'application/json'
				},
				JSON.stringify({
					name: formState.inputs.name.value,
					image: formState.inputs.image.value,
					startDate: moment(formState.inputs.startDate.value),
					endDate: moment(formState.inputs.endDate.value),
					venue: formState.inputs.venue.value,
					address: formState.inputs.address.value,
					description: formState.inputs.description.value,
					courseMap: formState.inputs.courseMap.value
				})
			);
			history.push('/events/' + eventId);
		} catch (err) {}
	};

	if (isLoading) {
		return (
			<div className="center">
				<LoadingSpinner />
			</div>
		);
	}
	if (!loadedEvent && !error) {
		return (
			<div className="center">
				<Card>
					<h2>Event not found!</h2>
				</Card>
			</div>
		);
	}

	// construct course map element to show it on modal

	const courseMap = loadedEvent.courseMap;
	const courseMapElement =
		courseMap !== undefined ? (
			<div className="event-form__coursemap">
				Current Course Map: {courseMap}
				<div>
					<Image
						title={loadedEvent.name}
						alt={loadedEvent.name + 'course map'}
						src={loadedEvent.courseMap}
						onClick={() => openCourseHandler()}></Image>
				</div>
			</div>
		) : (
			<div></div>
		);

	// React uses YYYY-MM-DD for date
	var startDate = moment(loadedEvent.startDate).format('YYYY-MM-DD');
	var endDate = moment(loadedEvent.endDate).format('YYYY-MM-DD');

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{!isLoading && loadedEvent && (
				<Modal
					show={showModal}
					onCancel={() => closeModalHandler()}
					header={loadedEvent.name}
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
								src={loadedEvent.courseMap}
								alt={loadedEvent.alt}
								className="map-container"></img>
						)}
					</div>
				</Modal>
			)}

			{!isLoading && loadedEvent && (
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
						initialValue={loadedEvent.name}
						initialValid={true}
					/>
					<Input
						id="image"
						element="input"
						type="text"
						label="Event Image (optional in jpg or png)"
						validators={[VALIDATOR_REQUIRE()]}
						errorText="Image format jpg or png"
						onInput={inputHandler}
						initialValue={loadedEvent.image}
						initialValid={true}
					/>
					<Input
						id="startDate"
						element="input"
						type="date"
						min={moment().add(1, 'days').format('YYYY-MM-DD')}
						label="StartDate"
						validators={[VALIDATOR_STARTDATE()]}
						errorText="Please enter a valid date"
						onInput={inputHandler}
						initialValue={startDate}
						initialValid={true}
					/>
					<Input
						id="endDate"
						element="input"
						type="date"
						min={moment(loadedEvent.startDate).format('YYYY-MM-DD')}
						label="EndDate"
						validators={[VALIDATOR_REQUIRE()]}
						errorText="Please enter a valid date"
						onInput={inputHandler}
						initialValue={endDate}
						initialValid={true}
					/>
					<Input
						id="venue"
						element="input"
						type="text"
						label="Venue"
						validators={[VALIDATOR_REQUIRE()]}
						errorText="Please enter a valid venue"
						onInput={inputHandler}
						initialValue={loadedEvent.venue}
						initialValid={true}
					/>
					<Input
						id="address"
						element="input"
						type="text"
						label="Address"
						validators={[VALIDATOR_REQUIRE()]}
						errorText="Please enter a valid address"
						onInput={inputHandler}
						initialValue={loadedEvent.address}
						initialValid={true}
					/>
					<Input
						id="description"
						element="textarea"
						label="Description"
						validators={[VALIDATOR_MINLENGTH(5)]}
						errorText="Please enter a valid description (min. 5 characters)"
						onInput={inputHandler}
						initialValue={loadedEvent.description}
						initialValid={true}
					/>
					<Input
						id="courseMap"
						element="input"
						type="file"
						label="Course Map (optional in jpg or png)"
						validators={[VALIDATOR_FILE()]}
						errorText="Image format jpg or png"
						onInput={inputHandler}
						initialValid={true}
					/>

					{courseMapElement}

					<Button type="submit" disabled={!formState.isValid}>
						Update Event
					</Button>
					<Button to={`/events/${loadedEvent.id}`}>Cancel</Button>
				</form>
			)}
		</React.Fragment>
	);
};

export default UpdateEvent;
