import React, {
	useCallback,
	useContext,
	useState,
	useEffect,
	useRef
} from 'react';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { UserAuthContext } from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import MaterialTable from './MaterialTable';

import './ClubManager.css';
import '../../shared/components/FormElements/Button.css';
import { set } from 'date-fns';

const EntryListForUsers = props => {
	let displayName = props.location.state.displayName;
	let eventName = props.location.state.eventName;
	let eventId = props.location.state.eventId;

	const [showLoading, setShowLoading] = useState(true);
	const userAuthContext = useContext(UserAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	// check the page has been initialized, if not, we want to hightlight multi-day event day button to day 1
	const [init, setInit] = useState(false);

	const [days, setDays] = useState(0);
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

	const [daySelection, setDaySelection] = useState(1);
	const [entryListArray, setEntryListArray] = useState([]);
	const [waitlistArray, setWaitlistArray] = useState([]);
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
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/events/entryreportforusers/${eventId}`,
					'POST',
					JSON.stringify({ displayName: displayName }),
					{
						'Content-type': 'application/json',
						Authorization: 'Bearer ' + userAuthContext.userToken
					}
				);

				setDays(responseData.entryData.length);

				//***********  construct lookups ************//
				// responseData.raceClassOptions is ["SS", "AS", "BS", ...]
				raceClasses = responseData.raceClassOptions;
				let obj = {};
				obj = convert2Lookup(raceClasses);
				setRaceClassLookup(obj);

				//*************** compose entry list from all the entries ************/
				runGroups = responseData.runGroupOptions;
				workerAssignments = responseData.workerAssignments;
				let entryDataArray = [];
				let days = responseData.entryData.length;
				for (let i = 0; i < days; ++i) {
					obj = {};
					obj = convert2Lookup(runGroups[i]);
					setRunGroupLookup(obj);

					obj = {};
					obj = convert2Lookup(workerAssignments[i]);
					setWorkerAssignmentLookup(obj);

					let entryData = [];
					let entries = responseData.entryData[i];
					for (var j = 0; j < entries.length; ++j) {
						let entry;
						if (displayName) {
							entry = {
								lastName: entries[j].userLastName,
								firstName: entries[j].userFirstName[0] + '.',
								carNumber: entries[j].carNumber,
								// for lookup field, we need to provide key in lookup array, we use index as key
								raceClass: getMapKey(
									entries[j].raceClass,
									raceClasses
								),
								car: entries[j].car,
								runGroup: getMapKey(
									entries[j].runGroup[i],
									runGroups[i]
								),
								workerAssignment: getMapKey(
									entries[j].workerAssignment[i],
									workerAssignments[i]
								)
							};
						} else {
							entry = {
								userName: entries[j].userName,
								carNumber: entries[j].carNumber,
								raceClass: getMapKey(
									entries[j].raceClass,
									raceClasses
								),
								car: entries[j].car,
								runGroup: getMapKey(
									entries[j].runGroup[i],
									runGroups[i]
								),
								workerAssignment: getMapKey(
									entries[j].workerAssignment[i],
									workerAssignments[i]
								)
							};
						}
						entryData.push(entry);
					}
					entryDataArray.push(entryData);
				}
				setEntryListArray(entryDataArray);

				//************ compose waitlist ***************//
				let waitlistDataArray = [];
				days = responseData.waitlistData.length;
				for (let i = 0; i < days; ++i) {
					let entries = responseData.entryData[i];
					let waitlistData = [];
					let waitlist = responseData.waitlistData[i];
					for (var j = 0; j < waitlist.length; ++j) {
						let entry;
						if (displayName) {
							entry = {
								lastName: waitlist[j].userLastName,
								firstName: waitlist[j].userFirstName[0] + '.',
								carNumber: waitlist[j].carNumber,
								raceClass: getMapKey(
									waitlist[j].raceClass,
									raceClasses
								),
								car: waitlist[j].car,
								runGroup: getMapKey(
									waitlist[j].runGroup[i],
									runGroups[i]
								),
								workerAssignment: getMapKey(
									waitlist[j].workerAssignment[i],
									workerAssignments[i]
								)
							};
						} else {
							entry = {
								userName: waitlist[j].userName,
								carNumber: waitlist[j].carNumber,
								raceClass: getMapKey(
									waitlist[j].raceClass,
									raceClasses
								),
								car: waitlist[j].car,
								runGroup: getMapKey(
									waitlist[j].runGroup[i],
									runGroups[i]
								),
								workerAssignment: getMapKey(
									waitlist[j].workerAssignment[i],
									workerAssignments[i]
								)
							};
						}
						waitlistData.push(entry);
					}
					waitlistDataArray.push(waitlistData);
				}
				setWaitlistArray(waitlistDataArray);
				setShowLoading(false);
			} catch (err) {}
		};
		fetchEntries();
	}, [sendRequest, setEntryListArray, setWaitlistArray]);

	const daySelectionCallback = index => {
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
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{/* Showing day button for multi-day event */}
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
			{daySelection &&
				entryListArray.length > 0 &&
				waitlistArray.length > 0 && (
					<MaterialTable
						entryList={entryListArray[daySelection - 1]}
						waitlist={waitlistArray[daySelection - 1]}
						displayName={displayName}
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

export default EntryListForUsers;
