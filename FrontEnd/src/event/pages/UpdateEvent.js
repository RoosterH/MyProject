import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import { useParams, useHistory } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import { ClubAuthContext } from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import Input from '../../shared/components/FormElements/Input';
import Modal from '../../shared/components/UIElements/Modal';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import {
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

	const clubAuth = useContext(ClubAuthContext);

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

	const [showImage, setShowImage] = useState(false);
	const openImageHandler = () => {
		openModalHandler();
		setShowImage(true);
	};
	const closeImageHandler = () => setShowImage(false);

	const closeMapContainer = () => {
		showCourse && closeCourseHandler();
		showImage && closeImageHandler();
	};

	const history = useHistory();

	// get eventId from url
	let eventId = useParams().id;

	if (!eventId || eventId === 'error') {
		// possibly page refresh, look for localStorage
		const storageData = JSON.parse(localStorage.getItem('eventData'));
		if (storageData && storageData.eventId) {
			eventId = storageData.eventId;
		}
	} else {
		localStorage.setItem(
			'eventData',
			JSON.stringify({
				eventId: eventId
			})
		);
	}

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

	// GET event from server
	useEffect(() => {
		const fetchEvent = async () => {
			try {
				const responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL + `/events/${eventId}`
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
		localStorage.removeItem('eventData');
		try {
			const formData = new FormData();
			formData.append('name', formState.inputs.name.value);
			formData.append('startDate', formState.inputs.startDate.value);
			formData.append('endDate', formState.inputs.endDate.value);
			formData.append('venue', formState.inputs.venue.value);
			formData.append('address', formState.inputs.address.value);
			formData.append(
				'description',
				formState.inputs.description.value
			);
			formData.append('image', formState.inputs.image.value);
			formData.append('courseMap', formState.inputs.courseMap.value);
			await sendRequest(
				process.env.REACT_APP_BACKEND_URL + `/events/${eventId}`,
				'PATCH',
				formData,
				{
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuth.clubToken
				}
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

	// React uses YYYY-MM-DD for date
	if (loadedEvent) {
		var startDate = moment(loadedEvent.startDate).format(
			'YYYY-MM-DD'
		);
		var endDate = moment(loadedEvent.endDate).format('YYYY-MM-DD');
	}

	const removeEventData = async () => {
		await localStorage.removeItem('eventData');
		history.push(`/events/${loadedEvent.id}`);
	};

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{!isLoading && loadedEvent && (
				<Modal
					show={showModal}
					onCancel={() => closeModalHandler()}
					header={
						showCourse
							? loadedEvent.name + ' course map'
							: loadedEvent.name
					}
					contentClass="event-item__modal__content"
					footerClass="event-item__modal-actions"
					headerClass="event-item__modal__header"
					footer={
						<Button onClick={() => closeModalHandler()}>CLOSE</Button>
					}>
					{/* render props.children */}
					{showCourse && (
						<div className="map-container">
							<img
								src={
									process.env.REACT_APP_ASSET_URL +
									`/${loadedEvent.courseMap}`
								}
								alt={loadedEvent.alt}
								className="map-container"></img>
						</div>
					)}
					{showImage && (
						<div className="map-container">
							<img
								src={
									process.env.REACT_APP_ASSET_URL +
									`/${loadedEvent.image}`
								}
								alt={loadedEvent.alt}
								className="map-container"></img>
						</div>
					)}
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
					<ImageUpload
						id="image"
						label="Event image"
						previewUrl={
							process.env.REACT_APP_ASSET_URL +
							`/${loadedEvent.image}`
						}
						buttonText="Click to select a new image"
						onInput={inputHandler}
						errorText="To replace, please select a new event image."
						onClick={openImageHandler}
					/>
					<div>
						<h4>Event Type: {loadedEvent.type}</h4>
					</div>
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
						min={moment().add(1, 'days').format('YYYY-MM-DD')}
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
						validators={[VALIDATOR_MINLENGTH(10)]}
						errorText="Please enter a valid address"
						onInput={inputHandler}
						initialValue={loadedEvent.address}
						initialValid={true}
					/>
					<Input
						id="description"
						element="textarea"
						label="Description"
						validators={[VALIDATOR_MINLENGTH(10)]}
						errorText="Please enter a valid description (min. 10 characters)"
						onInput={inputHandler}
						initialValue={loadedEvent.description}
						initialValid={true}
					/>
					<ImageUpload
						id="courseMap"
						label="Course Map - Optional"
						previewUrl={
							loadedEvent.courseMap
								? process.env.REACT_APP_ASSET_URL +
								  `/${loadedEvent.courseMap}`
								: ''
						}
						buttonText="Click to slect a new course map"
						onInput={inputHandler}
						errorText="To replace, please select a new course map."
						onClick={openCourseHandler}
					/>
					<Button
						type="submit"
						disabled={!formState.isValid}
						children="Update Event"></Button>
					<Button
						// to={`/events/${loadedEvent.id}`}
						onClick={removeEventData}
						children="Cancel"></Button>
				</form>
			)}
		</React.Fragment>
	);
};

export default UpdateEvent;
