import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useUserLoginValidation } from '../../shared/hooks/userLoginValidation-hook';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { Field, Form, Formik } from 'formik';
import FileUploader from '../../shared/components/FormElements/FileUploader';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Modal from '../../shared/components/UIElements/Modal';

import { UserAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import MaterialTableUserRegisterCarNumber from './MaterialTableUserRegisterCarNumber.js';

import '../../shared/css/Auth.css';
import './UserRegisterCarNumber.css';

const UserRegisterCarNumber = props => {
	let history = useHistory();
	let parentURL = props.location.state.parentURL;

	// path="/users/registerCarNumber/:clubId"
	const clubId = props.match.params.clubId;
	const userAuthContext = useContext(UserAuthContext);
	const [csvFileValid, setCsvFileValid] = useState(true);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// authentication check check whether club has logged in
	useUserLoginValidation(`/users/regisgterCarNumbers/${clubId}`);

	// If we are re-directing to this page, we want to clear up clubRedirectURL
	let location = useLocation();
	let path;
	useEffect(() => {
		path = location.pathname;
		let userRedirectURL = userAuthContext.userRedirectURL;
		if (path === userRedirectURL) {
			// re-init redirectURL after re-direction route
			userAuthContext.setUserRedirectURL(null);
		}
	}, [location]);

	const [showLoading, setShowLoading] = useState(true);
	const [clubName, setClubName] = useState();
	const [clubTakenCarNumbers, setClubTakenCarNumbers] = useState();
	const [startNumber, setStartNumber] = useState();
	const [endNumber, setEndNumber] = useState();

	// retrieve clubMemberLst from backend, if nothing existing meaning this is a new club
	// display import file field for new club
	useEffect(() => {
		const getClubTakenCarNumberList = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/users/clubTakenCarNumbers/${clubId}`,
					'GET',
					null,
					{
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + userAuthContext.userToken
					}
				);
				setClubName(responseData.clubName);
				setClubTakenCarNumbers(responseData.takenCarNumbers);
				setStartNumber(responseData.startNumber);
				setEndNumber(responseData.endNumber);
			} catch (err) {}
		};
		getClubTakenCarNumberList();
	}, []);

	const [materialData, setMaterialData] = useState();
	useEffect(() => {
		let availableNumbers = [];
		for (let i = startNumber; i <= endNumber; ++i) {
			if (clubTakenCarNumbers.indexOf(i) === -1) {
				let availableNumber = {};
				availableNumber.number = i;
				availableNumbers.push(availableNumber);
			}
		}
		setMaterialData(availableNumbers);
		setShowLoading(false);
	}, [clubTakenCarNumbers, startNumber, endNumber, setMaterialData]);

	const clearErrorHandler = () => {
		clearError();
	};

	// pickedNumber is the number passed back from MTable
	const [pickedNumber, setPickedNumber] = useState();
	// showModal is true after sening request to register car number at backend
	const [showModal, setShowModal] = useState(false);
	const numberHandler = number => {
		setPickedNumber(number);
	};

	useEffect(() => {
		const updateCarNumberHandler = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/users/registerClubCarNumber/${clubId}`,
					'POST',
					JSON.stringify({
						carNumber: pickedNumber
					}),
					{
						'Content-Type': 'application/json',
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + userAuthContext.userToken
					}
				);
				setShowModal(true);
			} catch (err) {}
		};
		if (pickedNumber !== undefined) {
			updateCarNumberHandler();
		}
	}, [pickedNumber, sendRequest]);

	const closeModal = () => {
		setShowModal(false);
		history.push(parentURL);
	};
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearErrorHandler} />
			{(isLoading || showLoading) && <LoadingSpinner asOverlay />}
			{
				<Modal
					className="modal-delete"
					show={showModal}
					contentClass="event-item__modal-delete"
					onCancel={closeModal}
					header="Race Number"
					footerClass="event-item__modal-actions"
					footer={
						<React.Fragment>
							<Button inverse onClick={closeModal}>
								OK
							</Button>
						</React.Fragment>
					}>
					<p className="modal__content">
						Your race number is {pickedNumber}.
					</p>
				</Modal>
			}
			{materialData && materialData.length > 0 && (
				<div className="available-nunmber-table">
					<MaterialTableUserRegisterCarNumber
						showLoading={showLoading}
						clubName={clubName}
						numberList={materialData}
						numberHandler={numberHandler}
					/>
				</div>
			)}
		</React.Fragment>
	);
};

export default UserRegisterCarNumber;
