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
	const [owner, setOWner] = useState(false);
	useEffect(() => {
		if (userAuthContext.userId === props.car.userId) {
			setOWner(true);
		}
	}, [userAuthContext.userId, props.car.userId]);

	const [active, setActive] = useState(props.car.active);
	const [activeButtonName, setActiveButtonName] = useState(
		'ACTIVATE'
	);
	const [activeButtonClassName, setActiveButtonClassName] = useState(
		'small-green'
	);
	useEffect(() => {
		if (active) {
			setActiveButtonName('ACTIVATED');
			setActiveButtonClassName('small-green');
		} else {
			setActiveButtonName('RETIRED');
			setActiveButtonClassName('small-grey');
		}
	}, [active]);

	// modal section
	const [showModal, setShowModal] = useState(false);
	const openModalHandler = () => setShowModal(true);
	const closeModalHandler = () => {
		setShowModal(false);
	};

	const activateHandler = async () => {
		try {
			await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/cars/activate/${props.car.id}`,
				'PATCH',
				JSON.stringify({ active: !active }),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);
			setActive(!active);
		} catch (err) {}
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
			<p>Tire Pressure : {props.car.frontPressure}psi</p>
			<p>Total Toe: {props.car.frontToe}in</p>
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
			<p>Tire Pressure : {props.car.rearPressure}psi</p>
			<p>Total Toe: {props.car.rearToe}in</p>
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
			{isLoading && <LoadingSpinner asOverlay />}
			{/* User image and car model*/}
			<div className="carItem">
				<div className="event-pages eventtype-page">
					<section id="header" className="section-header">
						<div className="header-container">
							<div className="logo-container ">
								{owner && userAuthContext.userImage && (
									<img
										src={
											process.env.REACT_APP_ASSET_URL +
											`/${userAuthContext.userImage}`
										}
										alt={props.car.model}
									/>
								)}
								{(!owner || !userAuthContext.userImage) && (
									<div className="gingerman">
										<i className="fad fa-gingerbread-man fa-4x" />
									</div>
								)}
							</div>
							<div className="clubname-container">
								{`${props.car.userName}\'s`} &nbsp;
								{props.car.model}
							</div>
						</div>
					</section>
				</div>
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
								{owner && (
									<Button
										// inverse={}
										to={`/users/cars/update/${props.car.id}`}
										size="small-orange">
										MODIFY
									</Button>
								)}
							</div>
							<div className="deletebutton-container">
								{owner && (
									<Button
										// inverse={}
										onClick={activateHandler}
										size={activeButtonClassName}>
										{activeButtonName}
									</Button>
								)}
							</div>
						</div>
					</div>
					<div className="note-container">
						<h3>Note: </h3>
						<textarea
							rows="8"
							cols="45"
							className="note-container_textarea"
							defaultValue={props.car.note}
						/>
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
