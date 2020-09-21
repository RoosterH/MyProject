import React, { useEffect, useState } from 'react';
import MaterialTable from 'material-table';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

const EntryReport = props => {
	// entries are the user entries
	let entries = props.entryReportData.entryData;
	let eventName = props.entryReportData.eventName;
	const [showLoading, setShowLoading] = useState(true);

	// entryList and waitList are the data passing to Material-Table
	const [entryList, setEntryList] = useState();
	const [waitlist, setWaitlist] = useState();

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
		//***********  construct lookups ************//
		// responseData.raceClassOptions is ["SS", "AS", "BS", ...]
		raceClasses = props.entryReportData.raceClassOptions;
		let obj = {};
		obj = convert2Lookup(raceClasses);
		setRaceClassLookup(obj);

		runGroups = props.entryReportData.runGroupOptions;
		obj = {};
		obj = convert2Lookup(runGroups);
		setRunGroupLookup(obj);

		workerAssignments = props.entryReportData.workerAssignments;
		obj = [];
		obj = convert2Lookup(workerAssignments);
		setWorkerAssignmentLookup(obj);

		//*************** compose entry list from all the entries ************/
		let entryData = [];

		for (var i = 0; i < entries.length; ++i) {
			let entry = {
				lastName: entries[i].userLastName,
				firstName: entries[i].userFirstName,
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

			entryData.push(entry);
		}
		setEntryList(entryData);

		//************ compose waitlist ***************//
		let waitlistDataArray = [];
		let waitlistData = props.entryReportData.waitlistData;
		for (var i = 0; i < waitlistData.length; ++i) {
			let entry;
			entry = {
				lastName: waitlistData[i].userLastName,
				firstName: waitlistData[i].userFirstName[0] + '.',
				carNumber: waitlistData[i].carNumber,
				raceClass: getMapKey(waitlistData[i].raceClass, raceClasses),
				car: waitlist[i].car,
				runGroup: getMapKey(entries[i].runGroup, runGroupLookup),
				workerAssignment: getMapKey(
					entries[i].workerAssignment,
					workerAssignmentLookup
				)
			};

			waitlistDataArray.push(entry);
		}
		setWaitlist(waitlistDataArray);
		setShowLoading(false);
	}, []);
	return (
		<React.Fragment>
			<div className="entrylist-table">
				<MaterialTable
					title={`${eventName} Entry List`}
					isLoading={showLoading}
					components={{
						OverlayLoading: props => (
							<div className="center">
								<LoadingSpinner />
							</div>
						)
					}}
					style={{
						border: '2px solid gray',
						maxWidth: '1450px',
						overflow: 'scroll',
						marginTop: '10px',
						marginLeft: '20px'
					}}
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

				<MaterialTable
					title={`${eventName} Waitlist`}
					style={{
						border: '2px solid gray',
						maxWidth: '1450px',
						overflow: 'scroll',
						marginTop: '10px',
						marginLeft: '20px'
					}}
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
			</div>
		</React.Fragment>
	);
};

export default EntryReport;
