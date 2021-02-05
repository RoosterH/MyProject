import React, { useState, useContext, useEffect } from 'react';
import moment from 'moment';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import MaterialTableEmailArchive from './MaterialTableCommsEmailArchive.js';

import './ClubMemberList.css';

const CommsEmailArchive = () => {
	const clubAuthContext = useContext(ClubAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [showLoading, setShowLoading] = useState(true);

	const [emailArchive, setEmailArchive] = useState(null);
	// retrieve emailArchive from backend
	useEffect(() => {
		const getClubEmailArchive = async () => {
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/clubs/commsEmailArchive/${clubAuthContext.clubId}`,
				'GET',
				null,
				{
					// adding JWT to header for authentication, JWT contains clubId
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
			setEmailArchive(responseData.emailArchive);
		};
		getClubEmailArchive();
	}, []);

	const [materialData, setMaterialData] = useState();
	useEffect(() => {
		if (emailArchive) {
			for (let i = 0; i < emailArchive.length; ++i) {
				// construct material data
				let data = {};
				data.timeStamp = moment(emailArchive[i].timeStamp).format(
					'MMMM Do YYYY, h:mm:ss a'
				);
				data.subject = emailArchive[i].subject;
				data.eventName = emailArchive[i].eventName;
				data.recipientNum = emailArchive[i].recipientNum;
			}
			setMaterialData(emailArchive);
			setShowLoading(false);
		}
	}, [emailArchive, setMaterialData]);

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{(isLoading || showLoading) && <LoadingSpinner asOverlay />}
			{materialData && (
				<MaterialTableEmailArchive
					showLoading={showLoading}
					emailArchive={materialData}
				/>
			)}
		</React.Fragment>
	);
};

export default CommsEmailArchive;
