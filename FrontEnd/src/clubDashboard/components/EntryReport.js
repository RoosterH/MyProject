import React, { useCallback, useEffect, useState } from 'react';
import MaterialTable from './MaterialTable';

import '../../shared/components/FormElements/Button.css';

const EntryReport = props => {
	const [days, setDays] = useState(
		props.entryReportData.entryData
			? props.entryReportData.entryData.length
			: 0
	);
	const [eventEntryList, setEventEntryList] = useState(
		props.entryReportData.entryData
			? props.entryReportData.entryData
			: undefined
	);
	const [eventWaitlist, setEventWaitlist] = useState(
		props.entryReportData.waitlistData
			? props.entryReportData.waitlistData
			: undefined
	);

	// entries are the user entries
	const [eventName, setEventName] = useState(
		props.entryReportData.eventName !== ''
			? props.entryReportData.eventName
			: ''
	);
	// raceClassOptions is ["SS", "AS", "BS", ...]
	const [raceClasses, setRaceClasses] = useState(
		props.entryReportData.raceClassOptions
			? props.entryReportData.raceClassOptions
			: undefined
	);
	const [runGroups, setRunGroups] = useState(
		props.entryReportData.runGroupOptions
			? props.entryReportData.runGroupOptions
			: undefined
	);
	const [workerAssignments, setWorkerAssignments] = useState(
		props.entryReportData.workerAssignments
			? props.entryReportData.workerAssignments
			: undefined
	);

	const [showLoading, setShowLoading] = useState(true);

	// days = how many days for this event

	// create an array from day 1 to loop through when we are rendering day buttons
	const [dayArray, setDayArray] = useState([]);
	useEffect(() => {
		let tmp = [];
		if (days > 1) {
			for (var i = 0; i < days; ++i) {
				tmp.push(i + 1);
			}
		}
		setDayArray(tmp);
	}, [setDayArray, days]);
	// check the page has been initialized, if not, we want to hightlight multi-day event day button to day 1

	const [init, setInit] = useState(false);
	const [daySelection, setDaySelection] = useState(1);
	// entryListArray and waitListArray elements are the data passing to Material-Table
	const [entryListArray, setEntryListArray] = useState([]);
	const [waitlistArray, setWaitlistArray] = useState([]);
	const [raceClassLookup, setRaceClassLookup] = useState();

	const [runGroupLookup, setRunGroupLookup] = useState();

	const [
		workerAssignmentLookup,
		setWorkerAssignmentLookup
	] = useState();

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
		let obj = {};
		obj = convert2Lookup(raceClasses);
		setRaceClassLookup(obj);

		//*************** compose entry list from all the entries ************/
		let entryDataArray = [];
		for (let i = 0; i < days; ++i) {
			obj = {};
			obj = convert2Lookup(runGroups[i]);
			setRunGroupLookup(obj);

			obj = [];
			obj = convert2Lookup(workerAssignments[i]);
			setWorkerAssignmentLookup(obj);

			let entryData = [];
			let entries = eventEntryList[i];
			for (var j = 0; j < entries.length; ++j) {
				let entry = {
					lastName: entries[j].userLastName,
					firstName: entries[j].userFirstName,
					// for lookup field, we need to provide key in lookup array, we use index as key
					raceClass: getMapKey(entries[j].raceClass, raceClasses),
					carNumber: entries[j].carNumber,
					car: entries[j].car,
					runGroup: getMapKey(entries[j].runGroup[i], runGroups[i]),
					workerAssignment: getMapKey(
						entries[j].workerAssignment[i],
						workerAssignments[i]
					)
				};
				entryData.push(entry);
			}
			entryDataArray.push(entryData);
		}
		setEntryListArray(entryDataArray);

		//************ compose waitlist ***************//
		let waitlistDataArray = [];
		for (let i = 0; i < days; ++i) {
			let waitlistData = [];
			let waitlist = eventWaitlist[i];
			for (let j = 0; j < waitlist.length; ++j) {
				let entry;
				entry = {
					lastName: waitlist[j].userLastName,
					firstName: waitlist[j].userFirstName,
					carNumber: waitlist[j].carNumber,
					raceClass: getMapKey(waitlist[j].raceClass, raceClasses),
					car: waitlist[j].car,
					runGroup: getMapKey(waitlist[j].runGroup[i], runGroups[i]),
					workerAssignment: getMapKey(
						waitlist[j].workerAssignment[i],
						workerAssignments[i]
					)
				};
				waitlistData.push(entry);
			}
			waitlistDataArray.push(waitlistData);
		}
		setWaitlistArray(waitlistDataArray);

		setShowLoading(false);
	}, []);

	// callback for Day Buttons
	const daySelectionCallback = index => {
		// index starts from 1, because we use day 1, day 2, ...
		setDaySelection(index);
	};

	// create ref for day 1 button. For multi-day events, we want to set focus on day 1 button initially
	// We didn’t choose useRef in this example because an object ref doesn’t notify us about changes to
	// the current ref value. Using a callback ref ensures that even if a child component displays the
	// button later, we still get notified about it in the parent component and can update the color.
	const day1ButtonRef = useCallback(button => {
		if (!init && button) {
			button.focus();
			setInit(true);
		}
	});

	return (
		<React.Fragment>
			{days > 1 &&
				dayArray.map(day => {
					if (day === 1) {
						// create ref for day 1 button
						return (
							<button
								ref={day1ButtonRef}
								key={'entrylistforUsers' + day}
								className="button--small-white"
								onClick={e => daySelectionCallback(day)}>
								Day {day}
							</button>
						);
					} else {
						return (
							<button
								key={'entrylistforUsers' + day}
								className="button--small-white"
								onClick={e => daySelectionCallback(day)}>
								Day {day}
							</button>
						);
					}
				})}
			{/* render material table according to event day */}
			{daySelection > 0 &&
				entryListArray.length > 0 &&
				waitlistArray.length > 0 && (
					<MaterialTable
						entryList={entryListArray[daySelection - 1]}
						waitlist={waitlistArray[daySelection - 1]}
						displayName={true}
						eventName={
							entryListArray.length > 1
								? eventName + ' Day ' + daySelection
								: eventName
						}
						showLoading={showLoading}
						raceClassLookup={raceClassLookup}
						runGroupLookup={runGroupLookup}
						workerAssignmentLookup={workerAssignmentLookup}
					/>
				)}
		</React.Fragment>
	);
};

export default EntryReport;
