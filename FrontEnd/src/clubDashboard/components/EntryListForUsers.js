import React, { useContext, useState, useEffect } from 'react';
import MaterialTable from 'material-table';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { UserAuthContext } from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import './ClubManager.css';
const EntryListForUsers = props => {
	let displayName = props.location.state.displayName;
	let eventName = props.location.state.eventName;
	let eventId = props.location.state.eventId;

	const userAuthContext = useContext(UserAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const [entryList, setEntryList] = useState([]);
	const [waitlist, setWaitlist] = useState([]);

	const [raceClassLookup, setRaceClassLookup] = useState([]);
	const [runGroupLookup, setRunGroupLookup] = useState([]);
	const [
		workerAssignmentLookup,
		setWorkerAssignmentLookup
	] = useState([]);

	const getMapKey = (val, myMap) => {
		let answer;
		Object.keys(myMap).map(key => {
			if (myMap[key] === val) {
				answer = key;
			}
		});
		return answer;
	};

	useEffect(() => {
		const fetchEntries = async () => {
			try {
				let responseData = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/events/entryreportforusers/${eventId}`,
					'POST',
					JSON.stringify({ displayName: displayName }),
					{
						'Content-type': 'application/json',
						Authorization: 'Bearer ' + userAuthContext.userToken
					}
				);

				console.log('responseData = ', responseData);
				let options = [];
				let raceClassOptions = responseData.raceClassOptions;
				for (var i = 0; i < raceClassOptions.length; ++i) {
					let keyName = String(i);
					options[keyName] = raceClassOptions[i];
				}
				console.log('raceClassOptions option = ', options);
				setRaceClassLookup(options);

				options = [];
				let runGroupOptions = responseData.runGroupOptions;
				for (var i = 0; i < runGroupOptions.length; ++i) {
					let keyName = String(i);
					options[keyName] = runGroupOptions[i];
				}
				console.log('runGroupOptions option = ', options);
				setRunGroupLookup(options);

				options = [];
				let workerAssignmentOptions = responseData.workerAssignments;
				for (var i = 0; i < workerAssignmentOptions.length; ++i) {
					let keyName = String(i);
					options[keyName] = workerAssignmentOptions[i];
				}
				console.log('assignment option = ', options);
				setWorkerAssignmentLookup(options);

				// compose entry list from all the entries
				let entryData = [];
				let entries = responseData.entryData;
				for (var i = 0; i < entries.length; ++i) {
					let entry;
					if (displayName) {
						entry = {
							lastName: entries[i].userLastName,
							firstName: entries[i].userFirstName[0] + '.',
							raceClass: getMapKey(
								entries[i].raceClass,
								raceClassLookup
							),
							carNumber: entries[i].carNumber,
							car: entries[i].car,
							runGroup: getMapKey(
								entries[i].runGroup,
								runGroupLookup
							),
							workerAssignment: getMapKey(
								entries[i].workerAssignment,
								workerAssignmentLookup
							)
						};
					} else {
						entry = {
							userName: entries[i].userName,
							carNumber: entries[i].carNumber,
							raceClass: getMapKey(
								entries[i].raceClass,
								raceClassLookup
							),
							car: entries[i].car,
							runGroup: getMapKey(
								entries[i].runGroup,
								runGroupLookup
							),
							workerAssignment: getMapKey(
								entries[i].workerAssignment,
								workerAssignmentLookup
							)
						};
					}
					entryData.push(entry);
				}
				setEntryList(entryData);

				// compose waitlist
				let waitlistData = [];
				let waitlist = responseData.waitlistData;
				for (var i = 0; i < waitlist.length; ++i) {
					let entry;
					console.log(
						'waitlist[i].runGroup = ',
						waitlist[i].runGroup
					);
					console.log(
						'runGroupLookup[waitlist[i].runGroup], = ',
						runGroupLookup[waitlist[i].runGroup]
					);
					if (displayName) {
						entry = {
							lastName: waitlist[i].userLastName,
							firstName: waitlist[i].userFirstName[0] + '.',
							carNumber: waitlist[i].carNumber,
							raceClass: getMapKey(
								waitlist[i].raceClass,
								raceClassLookup
							),
							car: waitlist[i].car,
							runGroup: getMapKey(
								entries[i].runGroup,
								runGroupLookup
							),
							workerAssignment: getMapKey(
								entries[i].workerAssignment,
								workerAssignmentLookup
							)
						};
					} else {
						entry = {
							userName: waitlist[i].userName,
							carNumber: waitlist[i].carNumber,
							raceClass: getMapKey(
								waitlist[i].raceClass,
								raceClassLookup
							),
							car: waitlist[i].car,
							runGroup: getMapKey(
								entries[i].runGroup,
								runGroupLookup
							),
							workerAssignment: getMapKey(
								entries[i].workerAssignment,
								workerAssignmentLookup
							)
						};
					}
					waitlistData.push(entry);
				}
				setWaitlist(waitlistData);
			} catch (err) {}
		};
		fetchEntries();
	}, [sendRequest, setEntryList]);

	console.log('runGroup[1] = ', runGroupLookup[1]);

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			<div className="entrylist-table">
				{displayName && (
					<MaterialTable
						title={`${eventName} Entry List`}
						columns={[
							{ title: 'Last Name', field: 'lastName' },
							{
								title: 'First Name',
								field: 'firstName',
								filtering: false
							},
							{
								title: 'Car Number',
								field: 'carNumber',
								filtering: false
							},
							{ title: 'Car', field: 'car', filtering: false },
							{
								title: 'Race Class',
								field: 'raceClass',
								lookup: raceClassLookup
							},
							{
								title: 'Run Group',
								field: 'runGroup',
								lookup: runGroupLookup
							},

							{
								title: 'Worker Group',
								field: 'workerAssignment',
								lookup: workerAssignmentLookup
							}
						]}
						data={entryList}
						options={{
							filtering: true,
							exportButton: true
						}}
					/>
				)}
				{displayName && waitlist !== [] && (
					<MaterialTable
						title={`${eventName} Waitlist`}
						columns={[
							{ title: 'Last Name', field: 'lastName' },
							{
								title: 'First Name',
								field: 'firstName',
								filtering: false
							},
							{
								title: 'Car Number',
								field: 'carNumber',
								filtering: false
							},
							{ title: 'Car', field: 'car' },
							{
								title: 'Race Class',
								field: 'raceClass',
								lookup: raceClassLookup,
								filtering: false
							},
							{
								title: 'Run Group',
								field: 'runGroup',
								lookup: runGroupLookup,
								filtering: false
							},

							{
								title: 'Worker Group',
								field: 'workerGroup',
								lookup: workerAssignmentLookup,
								filtering: false
							}
						]}
						data={waitlist}
						options={{
							filtering: false,
							sorting: false,
							exportButton: true
						}}
					/>
				)}
				{!displayName && (
					<MaterialTable
						title={`${eventName} Entry List`}
						columns={[
							{ title: 'User Name', field: 'userName' },
							{
								title: 'Car Number',
								field: 'carNumber',
								filtering: false
							},
							{ title: 'Car', field: 'car', filtering: false },
							{
								title: 'Race Class',
								field: 'raceClass',
								lookup: raceClassLookup
							},
							{
								title: 'Run Group',
								field: 'runGroup',
								lookup: runGroupLookup
							},

							{
								title: 'Worker Group',
								field: 'workerGroup',
								lookup: workerAssignmentLookup
							}
						]}
						data={entryList}
						options={{
							filtering: true,
							exportButton: true
						}}
					/>
				)}
				{!displayName && waitlist !== [] && (
					<MaterialTable
						title={`${eventName} Waitlist`}
						columns={[
							{ title: 'User Name', field: 'userName' },
							{
								title: 'Car Number',
								field: 'carNumber'
							},
							{ title: 'Car', field: 'car' },
							{
								title: 'Race Class',
								field: 'raceClass',
								lookup: raceClassLookup
							},
							{
								title: 'Run Group',
								field: 'runGroup',
								lookup: runGroupLookup
							},
							{
								title: 'Worker Group',
								field: 'workerGroup',
								lookup: workerAssignmentLookup
							}
						]}
						data={waitlist}
						options={{
							sorting: false,
							exportButton: true
						}}
					/>
				)}
			</div>
		</React.Fragment>
	);
};

export default EntryListForUsers;
