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

	const [raceClassLookup, setRaceClassLookup] = useState();
	let raceClasses = [];

	const [runGroupLookup, setRunGroupLookup] = useState();
	let runGroups = [];

	const [
		workerAssignmentLookup,
		setWorkerAssignmentLookup
	] = useState();
	let workerAssignments = [];

	// return index of matched value
	const getMapKey = (val, myMap) => {
		let answer;
		for (var i = 0; i < myMap.length; ++i) {
			if (myMap[i] === val) {
				answer = i;
				break;
			}
		}
		return answer;
	};

	// returns a map
	const convert2Lookup = options => {
		//lookup format- lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' },
		let lookupMap = {};
		for (var i = 0; i < options.length; ++i) {
			lookupMap[i] = options[i];
		}
		return lookupMap;
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

				//***********  construct lookups ************//
				// responseData.raceClassOptions is ["SS", "AS", "BS", ...]
				raceClasses = responseData.raceClassOptions;
				let obj = {};
				obj = convert2Lookup(raceClasses);
				setRaceClassLookup(obj);

				runGroups = responseData.runGroupOptions;
				obj = {};
				obj = convert2Lookup(runGroups);
				setRunGroupLookup(obj);

				workerAssignments = responseData.workerAssignments;
				obj = [];
				obj = convert2Lookup(workerAssignments);
				setWorkerAssignmentLookup(obj);

				//*************** compose entry list from all the entries ************/
				let entryData = [];
				let entries = responseData.entryData;
				for (var i = 0; i < entries.length; ++i) {
					let entry;
					if (displayName) {
						entry = {
							lastName: entries[i].userLastName,
							firstName: entries[i].userFirstName[0] + '.',
							// for lookup field, we need to provide key in lookup array, we use index as key
							raceClass: getMapKey(entries[i].raceClass, raceClasses),
							carNumber: entries[i].carNumber,
							car: entries[i].car,
							runGroup: getMapKey(entries[i].runGroup, runGroups),
							workerAssignment: getMapKey(
								entries[i].workerAssignment,
								workerAssignments
							)
						};
					} else {
						entry = {
							userName: entries[i].userName,
							carNumber: entries[i].carNumber,
							raceClass: getMapKey(entries[i].raceClass, raceClasses),
							car: entries[i].car,
							runGroup: getMapKey(entries[i].runGroup, runGroups),
							workerAssignment: getMapKey(
								entries[i].workerAssignment,
								workerAssignments
							)
						};
					}
					entryData.push(entry);
				}
				setEntryList(entryData);

				//************ compose waitlist ***************//
				let waitlistData = [];
				let waitlist = responseData.waitlistData;
				for (var i = 0; i < waitlist.length; ++i) {
					let entry;
					if (displayName) {
						entry = {
							lastName: waitlist[i].userLastName,
							firstName: waitlist[i].userFirstName[0] + '.',
							carNumber: waitlist[i].carNumber,
							raceClass: getMapKey(
								waitlist[i].raceClass,
								raceClasses
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
								raceClasses
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
