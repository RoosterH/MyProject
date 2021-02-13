import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useClubLoginValidation } from '../../shared/hooks/clubLoginValidation-hook';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { Field, Form, Formik } from 'formik';
import FileUploader from '../../shared/components/FormElements/FileUploader';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import MaterialTableAvailableCarNumberList from './MaterialTableAvailableCarNumberList.js';

import '../../shared/css/Auth.css';
import './ClubMemberList.css';
import CSVExample from '../../shared/utils/png/carNumbersCSVExample.png';

const ClubAvailableCarNumbers = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	const [csvFileValid, setCsvFileValid] = useState(true);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const clubId = clubAuthContext.clubId;
	// authentication check check whether club has logged in
	useClubLoginValidation(`/clubs/availCarNumbers/${clubId}`);

	// If we are re-directing to this page, we want to clear up clubRedirectURL
	let location = useLocation();
	let path;
	useEffect(() => {
		path = location.pathname;
		let clubRedirectURL = clubAuthContext.clubRedirectURL;
		if (path === clubRedirectURL) {
			// re-init redirectURL after re-direction route
			clubAuthContext.setClubRedirectURL(null);
		}
	}, [location]);

	const [showLoading, setShowLoading] = useState(true);
	const [clubTakenCarNumbers, setClubTakenCarNumbers] = useState();
	const [startNumber, setStartNumber] = useState();
	const [endNumber, setEndNumber] = useState();

	const getClubTakenCarNumberList = async () => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/clubs/takenCarNumbers/${clubAuthContext.clubId}`,
				'GET',
				null,
				{
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setClubTakenCarNumbers(responseData.takenCarNumbers);
			setStartNumber(responseData.startNumber);
			setEndNumber(responseData.endNumber);
		} catch (err) {}
	};
	// retrieve clubMemberLst from backend, if nothing existing meaning this is a new club
	// display import file field for new club
	useEffect(() => {
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
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearErrorHandler} />
			{(isLoading || showLoading) && <LoadingSpinner asOverlay />}
			{materialData && materialData.length > 0 && (
				<div className="available-nunmber-table">
					<MaterialTableAvailableCarNumberList
						showLoading={showLoading}
						clubName={clubAuthContext.clubName}
						numberList={materialData}
					/>
				</div>
			)}
		</React.Fragment>
	);
};

export default ClubAvailableCarNumbers;
