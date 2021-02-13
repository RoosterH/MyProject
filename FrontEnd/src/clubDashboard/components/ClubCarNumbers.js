import React, { useState, useContext, useEffect } from 'react';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { Field, Form, Formik } from 'formik';
import FileUploader from '../../shared/components/FormElements/FileUploader';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import MaterialTableCarNumberList from './MaterialTableCarNumberList.js';

import '../../shared/css/Auth.css';
import './ClubMemberList.css';
import CSVExample from '../../shared/utils/png/carNumbersCSVExample.png';

const ClubCarNumber = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	const [csvFileValid, setCsvFileValid] = useState(true);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [showLoading, setShowLoading] = useState(true);
	const [clubCarNumbers, setClubCarNumbers] = useState();
	const [startNumber, setStartNumber] = useState();
	const [endNumber, setEndNumber] = useState();
	const getCarNumberList = async () => {
		try {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/clubs/carNumbers/${clubAuthContext.clubId}`,
				'GET',
				null,
				{
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setClubCarNumbers(responseData.carNumbers);
			setStartNumber(responseData.startNumber);
			setEndNumber(responseData.endNumber);
		} catch (err) {}
	};
	// retrieve clubMemberLst from backend, if nothing existing meaning this is a new club
	// display import file field for new club
	useEffect(() => {
		getCarNumberList();
	}, []);

	const csvFileSubmitHandler = async values => {
		try {
			// FormData() is a browser API. We can append text or binary data to FormData
			const formData = new FormData();
			formData.append('carNumbers', values.csvFile);

			// the request needs to match backend clubsRoutes /signup route
			// With fromData, headers cannot be {Content-Type: application/json}
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/clubs/uploadCarNumbers/${clubAuthContext.clubId}`,
				'POST',
				formData,
				{
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setClubCarNumbers(responseData.memberList);
		} catch (err) {
			console.log('ClubAuth error = ', err);
		}
	};

	// Formik section
	const initialValues = {
		csvFile: undefined
	};

	const validateCsvFile = value => {
		let error;
		if (value && value.size > 1500000) {
			error =
				'File size should not exceed 1.5MB. Are you uploading a csv file?';
			setCsvFileValid(false);
		} else {
			setCsvFileValid(true);
		}
		return error;
	};

	const fileUploadForm = values => (
		<div className="fileuploadform-frame">
			<div className="auth-div">
				<p className="upload-file-header">
					<i className="fas fa-flag-checkered" />
					&nbsp;Upload Car Number list file with the following fields.
					Field names are case sensitive. (csv format only)
					<p className="upload-file-header-red">
						Do NOT leave empty rows at the end of the file.
					</p>
					<img
						src={CSVExample}
						alt="FirstName, LastName, Car Number"
					/>
				</p>

				<hr className="auth-form--hr" />

				<Formik
					initialValues={initialValues}
					onSubmit={csvFileSubmitHandler}>
					{({
						errors,
						isValid,
						touched,
						setFieldValue,
						handleBlur
					}) => (
						<Form className="auth-from-container">
							<Field
								id="csvFile"
								name="csvFile"
								title="Please Upload File"
								fileFormat="csv"
								accept=".csv"
								component={FileUploader}
								validate={validateCsvFile}
								setFieldValue={setFieldValue}
								errorMessage={errors.csvFile ? errors.csvFile : ''}
								onBlur={event => {
									handleBlur(event);
								}}
								labelStyle="auth-form-label"
								inputStyle="auth-form-input"
								previewStyle=""
								errorStyle="auth-form-error"
							/>

							<Button size="small" disabled={!isValid} type="submit">
								Upload
							</Button>
						</Form>
					)}
				</Formik>
			</div>
		</div>
	);

	const [materialData, setMaterialData] = useState();
	useEffect(() => {
		setMaterialData(clubCarNumbers);
		setShowLoading(false);
	}, [clubCarNumbers, setMaterialData]);

	const [memberToBeUpdatedNew, setMemberToBeUpdatedNew] = useState();
	const [memberToBeUpdatedOld, setMemberToBeUpdatedOld] = useState();
	// getting confirmation from MTable to update a member
	const confirmUpdateMember = (newData, oldData) => {
		if (newData) {
			setMemberToBeUpdatedNew(newData);
			setMemberToBeUpdatedOld(oldData);
		}
	};

	useEffect(() => {
		const updateMemberHandler = async () => {
			let userId = memberToBeUpdatedNew.userId;
			let lastName = memberToBeUpdatedNew.lastName;
			let firstName = memberToBeUpdatedNew.firstName;
			let carNumberNew = memberToBeUpdatedNew.carNumber;
			let carNumberOld = memberToBeUpdatedOld.carNumber;

			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/carNumber/${clubAuthContext.clubId}`,
					'PATCH',
					JSON.stringify({
						userId: userId,
						lastName: lastName,
						firstName: firstName,
						carNumberOld: carNumberOld,
						carNumberNew: carNumberNew
					}),
					{
						'Content-Type': 'application/json',
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
			} catch (err) {
				// something wrong, roll back the changes
				console.log('refresh here');
			}
		};
		if (memberToBeUpdatedNew) {
			updateMemberHandler();
		}
	}, [memberToBeUpdatedNew, memberToBeUpdatedOld]);

	const clearErrorHandler = () => {
		clearError();
		getCarNumberList();
	};
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearErrorHandler} />
			{(isLoading || showLoading) && <LoadingSpinner asOverlay />}
			{clubCarNumbers &&
				clubCarNumbers.length === 0 &&
				fileUploadForm()}
			{materialData && materialData.length > 0 && (
				<MaterialTableCarNumberList
					startNumber={startNumber}
					endNumber={endNumber}
					showLoading={showLoading}
					clubName={clubAuthContext.clubName}
					memberList={materialData}
					confirmUpdateMember={confirmUpdateMember}
				/>
			)}
		</React.Fragment>
	);
};

export default ClubCarNumber;
