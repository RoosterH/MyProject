import React, { useState, useContext, useEffect } from 'react';

import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { Field, Form, Formik } from 'formik';
import FileUploader from '../../shared/components/FormElements/FileUploader';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import MaterialTableMemberList from './MaterialTableMemberList.js';

import '../../shared/css/Auth.css';
import './ClubMemberList.css';
import CSVExample from '../../shared/utils/png/memberListCSVExample.png';

const ClubMemberList = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	const [csvFileValid, setCsvFileValid] = useState(true);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [showLoading, setShowLoading] = useState(true);

	const [clubMemberList, setClubMemberList] = useState(null);
	const [hasMemberSystem, setHasMemberSystem] = useState(false);
	// retrieve clubMemberLst from backend, if nothing existing meaning this is a new club
	// display import file field for new club
	useEffect(() => {
		let responseData, responseStatus, responseMessage;
		const getClubMemberList = async () => {
			[
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/clubs/memberList/${clubAuthContext.clubId}`,
				'GET',
				null,
				{
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setHasMemberSystem(responseData.memberSystem);
			setClubMemberList(responseData.memberList);
		};
		getClubMemberList();
	}, []);

	const csvFileSubmitHandler = async values => {
		try {
			// FormData() is a browser API. We can append text or binary data to FormData
			const formData = new FormData();
			formData.append('memberList', values.csvFile);

			// the request needs to match backend clubsRoutes /signup route
			// With fromData, headers cannot be {Content-Type: application/json}
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/clubs/uploadMemberList/${clubAuthContext.clubId}`,
				'POST',
				formData,
				{
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setHasMemberSystem(responseData.memberSystem);
			setClubMemberList(responseData.memberList);
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
				<p className="auth-form-header">
					<i className="fas fa-flag-checkered" />
					&nbsp;Upload member list file with the following fields.
					Field names are case sensitive. MemberNumber/Expires are
					optional. (csv format only)
					<img
						src={CSVExample}
						alt="FirstName, LastName, Email, MemberNumber, Expires"
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
		setMaterialData(clubMemberList);
		setShowLoading(false);
	}, [clubMemberList, setMaterialData]);

	// check if data comes with memberNumber
	const [hasMemberNumber, setHasMemberNumber] = useState(false);
	useEffect(() => {
		if (materialData && materialData.length > 0) {
			if (materialData[0].memberNumber) {
				setHasMemberNumber(true);
			}
		}
	}, [materialData, setHasMemberNumber]);

	const [memberToBeAdded, setMemberToBeAdded] = useState();
	// getting confirmation from MTable to add a member
	const confirmAddMember = (val, rowData) => {
		if (val) {
			setMemberToBeAdded(rowData);
		}
	};

	useEffect(() => {
		const addMemberHandler = async () => {
			let lastName = memberToBeAdded.lastName;
			let firstName = memberToBeAdded.firstName;
			let email = memberToBeAdded.email;
			let memberNumber = memberToBeAdded.memberNumber;
			let memberExp = memberToBeAdded.memberExp;
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/member/${clubAuthContext.clubId}`,
					'POST',
					JSON.stringify({
						lastName: lastName,
						firstName: firstName,
						email: email,
						memberNumber: memberNumber,
						memberExp: memberExp
					}),
					{
						'Content-Type': 'application/json',
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
			} catch (err) {}
		};
		if (memberToBeAdded) {
			addMemberHandler();
		}
	}, [memberToBeAdded]);

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
			let lastNameNew = memberToBeUpdatedNew.lastName;
			let firstNameNew = memberToBeUpdatedNew.firstName;
			let emailNew = memberToBeUpdatedNew.email;
			let memberNumberNew = memberToBeUpdatedNew.memberNumber;
			let memberExpNew = memberToBeUpdatedNew.memberExp;

			let lastNameOld = memberToBeUpdatedOld.lastName;
			let firstNameOld = memberToBeUpdatedOld.firstName;
			let emailOld = memberToBeUpdatedOld.email;
			let memberNumberOld = memberToBeUpdatedOld.memberNumber;
			let memberExpOld = memberToBeUpdatedOld.memberExp;

			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/member/${clubAuthContext.clubId}`,
					'PATCH',
					JSON.stringify({
						userId: userId,
						lastNameNew: lastNameNew,
						firstNameNew: firstNameNew,
						emailNew: emailNew,
						memberNumberNew: memberNumberNew,
						memberExpNew: memberExpNew,
						lastNameOld: lastNameOld,
						firstNameOld: firstNameOld,
						emailOld: emailOld,
						memberNumberOld: memberNumberOld,
						memberExpOld: memberExpOld
					}),
					{
						'Content-Type': 'application/json',
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
			} catch (err) {}
		};
		if (memberToBeUpdatedNew) {
			updateMemberHandler();
		}
	}, [memberToBeUpdatedNew, memberToBeUpdatedOld]);

	const [memberToBeDeleted, setMemberToBeDeleted] = useState();
	// getting confirmation from MTable to delete a member
	const confirmDeleteMember = oldData => {
		if (oldData) {
			setMemberToBeDeleted(oldData);
		}
	};

	useEffect(() => {
		const deleteMemberHandler = async () => {
			let lastName = memberToBeDeleted.lastName;
			let firstName = memberToBeDeleted.firstName;
			let email = memberToBeDeleted.email;
			let memberNumber = memberToBeDeleted.memberNumber;
			let memberExp = memberToBeDeleted.memberExp;

			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/member/${clubAuthContext.clubId}`,
					'DELETE',
					JSON.stringify({
						lastName: lastName,
						firstName: firstName,
						email: email,
						memberNumber: memberNumber,
						memberExp: memberExp
					}),
					{
						'Content-Type': 'application/json',
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
			} catch (err) {}
		};
		if (memberToBeDeleted) {
			deleteMemberHandler();
		}
	}, [memberToBeDeleted]);
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{(isLoading || showLoading) && <LoadingSpinner asOverlay />}
			{clubMemberList &&
				clubMemberList.length === 0 &&
				fileUploadForm()}
			{materialData && materialData.length > 0 && (
				<MaterialTableMemberList
					showLoading={showLoading}
					clubName={clubAuthContext.clubName}
					memberList={materialData}
					hasMemberSystem={hasMemberSystem}
					hasMemberNumber={hasMemberNumber}
					confirmAddMember={confirmAddMember}
					confirmUpdateMember={confirmUpdateMember}
					confirmDeleteMember={confirmDeleteMember}
				/>
			)}
		</React.Fragment>
	);
};

export default ClubMemberList;
