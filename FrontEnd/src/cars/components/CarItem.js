import React, { useState, useContext, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';

import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Image from '../../shared/components/UIElements/Image';
import Modal from '../../shared/components/UIElements/Modal';

import { UserAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import '../../shared/css/CarItem.css';

const CarItem = props => {
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// useContext is listening to "UserAuthContext"
	const userAuthContext = useContext(UserAuthContext);

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
				process.env.REACT_APP_BACKEND_URL + `/cars/${props.car.id}`,
				'DELETE',
				null,
				{
					// No need for content-type since body is null,
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);
			history.push(`/users/garage/${userAuthContext.userId}`);
		} catch (err) {}
	};

	const confirmPublishHandler = async () => {
		setShowSubmitModal(false);
		try {
			await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/cars/publish/${props.car.id}`,
				'PATCH',
				JSON.stringify({ published: true }),
				{
					// No need for content-type since body is null,
					// adding JWT to header for authentication
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);
			history.push(`/users/garage/${userAuthContext.userId}`);
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

	const carImageElement =
		props.car.image !== '' ? (
			<div className="event-item__image">
				<img
					src={
						process.env.REACT_APP_ASSET_URL + `/${props.car.image}`
					}
					alt={props.car.name}
				/>
			</div>
		) : (
			<div></div>
		);

	const [showDescription, setShowDescription] = useState(
		'btn collapsible minus-sign toggle-btn'
	);
	const toggleDescriptionButton = () => {
		if (showDescription === 'btn collapsible minus-sign toggle-btn') {
			setShowDescription('btn collapsible plus-sign toggle-btn');
		} else {
			setShowDescription('btn collapsible minus-sign toggle-btn');
		}
	};

	const [showInstruction, setShowInstruction] = useState(
		'btn collapsible minus-sign toggle-btn'
	);
	const toggleInstructionButton = () => {
		if (showInstruction === 'btn collapsible minus-sign toggle-btn') {
			setShowInstruction('btn collapsible plus-sign toggle-btn');
		} else {
			setShowInstruction('btn collapsible minus-sign toggle-btn');
		}
	};

	const leftFront = () => (
		<div>
			<p>Toe : {props.car.LFToe} in</p>
			<p>Camber : {props.car.LFCamber}&#x00B0;</p>
			<p>Caster : {props.car.LFCaster}&#x00B0;</p>
			<p>Sway Bar: {props.car.FBar}</p>
		</div>
	);

	const centerFront = () => (
		<div>
			<p>Tire Pressure : {props.car.FrontPressure}psi</p>
			<p>Total Toe: {props.car.FrontToe}in</p>
			<p>Rebound: {props.car.FRebound}</p>
			<p>Compression: {props.car.FCompression}</p>
		</div>
	);

	const rightFront = () => (
		<div>
			<p>Toe : {props.car.RFToe} in</p>
			<p>Camber : {props.car.RFCamber}&#x00B0;</p>
			<p>Caster : {props.car.RFCaster}&#x00B0;</p>
		</div>
	);

	const leftRear = () => (
		<div>
			<p>Toe : {props.car.LRToe} in</p>
			<p>Camber : {props.car.LRCamber}&#x00B0;</p>
			<p>Sway Bar: {props.car.RBar}</p>
		</div>
	);

	const centerRear = () => (
		<div>
			<p>Tire Pressure : {props.car.RearPressure}psi</p>
			<p>Total Toe: {props.car.RearToe}in</p>
			<p>Rebound: {props.car.RRebound}</p>
			<p>Compression: {props.car.RCompression}</p>
		</div>
	);

	const rightRear = () => (
		<div>
			<p>Toe : {props.car.RRToe} in</p>
			<p>Camber : {props.car.RRCamber}&#x00B0;</p>
		</div>
	);
	return (
		// React.Frgment connect multiple components
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
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
					Do you really want to delete {props.car.model}? It cannot be
					recovered after deletion.
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
					Are you ready to submit {props.car.model}? Please confirm.
				</p>
			</Modal>
			{isLoading && <LoadingSpinner asOverlay />}
			{/* User image and car model*/}
			<div className="carItem">
				<div className="event-pages eventtype-page">
					<section id="header" title="">
						<div className="section-container">
							<div className="logo-container ">
								{userAuthContext.userImage && (
									<img
										src={
											process.env.REACT_APP_ASSET_URL +
											`/${userAuthContext.userImage}`
										}
										alt={props.car.model}
									/>
								)}
								{!userAuthContext.userImage && (
									<div className="gingerman">
										<i className="fad fa-gingerbread-man fa-4x" />
									</div>
								)}
							</div>
							<div className="clubname-container">
								{`${userAuthContext.userName}\'s`} &nbsp;
								{props.car.model}
							</div>
						</div>
					</section>
				</div>
				<br />
				{/* Car info container */}
				<div className="section-container">
					<div className="carinfo-container">
						<div className="col-xs-12">
							<div className="clearfix">
								<h3>{props.car.year}</h3>
								<h3>
									{props.car.make}&nbsp;{props.car.model}&nbsp;
									{props.car.trimLevel}
								</h3>
								<h4>
									{props.car.tireBrand}&nbsp;{props.car.tireName}
								</h4>
								<h4>
									Front:&nbsp;{props.car.tireFrontWidth}/
									{props.car.tireFrontRatio}-
									{props.car.tireFrontDiameter}
								</h4>
								<h4>
									Rear:&nbsp;{props.car.tireRearWidth}/
									{props.car.tireRearRatio}-
									{props.car.tireRearDiameter}
								</h4>
							</div>
							<div className="eventimage-basic-container">
								<div className="eventimage-container">
									<img
										src={
											process.env.REACT_APP_ASSET_URL +
											`/${props.car.image}`
										}
										alt={props.car.model}
										className="eventimage-container-img"
									/>
								</div>
							</div>
							<div className="modifybutton-container">
								<Button
									// inverse={}
									to={`/events/form/${props.car.id}`}
									size="small-orange">
									MODIFY
								</Button>
							</div>
							<div className="deletebutton-container">
								<Button
									// inverse={}
									to={`/events/form/${props.car.id}`}
									size="small-orange">
									DELETE&nbsp;
								</Button>
							</div>
						</div>
					</div>
					<div className="note-container">
						<h3>Note: </h3>
						<p>{props.car.note}</p>
					</div>
				</div>
				{/* <div className="section-container theme"> */}
				<div className="theme">
					<table className="table table-color">
						<tbody>
							{/* <tr>
							<th>Heading A</th>
							<th>Heading B</th>
							<th>Heading C</th>
						</tr> */}
							<tr className="table-tr">
								<td className="table-corner-td">&nbsp;</td>
								<td className="table-center-toptd">
									{centerFront()}
								</td>
								<td className="table-corner-td">&nbsp;</td>
							</tr>
							<tr>
								<td className="table-side-td">{leftFront()}</td>
								<td className="table-center-td">&nbsp;</td>
								<td className="table-side-td">{rightFront()}</td>
							</tr>
							<tr>
								<td className="table-side-td">{leftRear()}</td>
								<td className="table-center-td">&nbsp;</td>
								<td className="table-side-td">{rightRear()}</td>
							</tr>
							<tr>
								<td className="table-corner-td">&nbsp;</td>
								<td className="table-center-td">{centerRear()}</td>
								<td className="table-corner-td">&nbsp;</td>
							</tr>
						</tbody>
					</table>
					<div className="page-basic-container">
						<div className="page-footer"></div>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default CarItem;
