import React, {
	useCallback,
	useEffect,
	useState,
	useContext
} from 'react';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import MaterialTableEntryReport from './MaterialTableEntryReport';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import '../../shared/components/FormElements/Button.css';

const NOT_ATTENDING = 'Not Attending';

const EntryReport = props => {
	const clubAuthContext = useContext(ClubAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const [addEntryError, setAddEntryError] = useState(false);
	const errorClearHandler = () => {
		clearError();
		setAddEntryError();
		setShowLoading(false);
	};

	// days = how many days for this event
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
	const [lunchOptions, setLunchOptions] = useState(
		props.entryReportData.lunchOptions
			? props.entryReportData.lunchOptions
			: undefined
	);
	const [showLoading, setShowLoading] = useState(true);

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

	// ***  lookups are the choices for that option, we need to use it for filtering *** //
	const [raceClassLookup, setRaceClassLookup] = useState();
	const [runGroupLookup, setRunGroupLookup] = useState();
	const [
		workerAssignmentLookup,
		setWorkerAssignmentLookup
	] = useState();
	const [lunchOptionLookup, setLunchOptionLookup] = useState([]);

	// return index of matched value
	const getMapKey = (val, myMap) => {
		// in case workerAssignment not defined
		if (myMap === undefined) {
			myMap = [];
		}
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
		// in case raceClass not defined
		if (options === undefined) {
			options = [];
		}
		//lookup format- lookup: { 34: 'İstanbul', 63: 'Şanlıurfa' },
		let lookupMap = {};
		for (var i = 0; i < options.length; ++i) {
			lookupMap[i] = options[i];
		}
		return lookupMap;
	};

	const composeEntryDataArray = eventEntryList => {
		//***********  construct lookups ************//
		let obj = {};
		obj = convert2Lookup(raceClasses);
		setRaceClassLookup(obj);
		obj = {};
		obj = convert2Lookup(lunchOptions);
		setLunchOptionLookup(obj);

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
				if (entries[j].runGroup[i] === NOT_ATTENDING) {
					continue;
				}
				let entry = {
					lastName: entries[j].userLastName,
					firstName: entries[j].userFirstName,
					// for lookup field, we need to provide key in lookup array, we use index as key
					raceClass:
						raceClasses !== undefined
							? getMapKey(entries[j].raceClass, raceClasses)
							: '',
					lunchOption:
						lunchOptions !== undefined
							? getMapKey(entries[j].lunchOption, lunchOptions)
							: '',
					carNumber: entries[j].carNumber,
					car: entries[j].car,
					runGroup:
						runGroups !== undefined
							? getMapKey(entries[j].runGroup[i], runGroups[i])
							: '',
					workerAssignment:
						workerAssignments[i] !== undefined
							? getMapKey(
									entries[j].workerAssignment[i],
									workerAssignments[i]
							  )
							: ''
				};
				entryData.push(entry);
			}
			entryDataArray.push(entryData);
		}
		setEntryListArray(entryDataArray);
	};

	const composeWaitlistArray = eventWaitlist => {
		//************ compose waitlist ***************//
		let waitlistDataArray = [];
		for (let i = 0; i < days; ++i) {
			let waitlistData = [];
			let waitlist = eventWaitlist[i];
			for (let j = 0; j < waitlist.length; ++j) {
				let entry;
				entry = {
					id: waitlist[j].id,
					lastName: waitlist[j].userLastName,
					firstName: waitlist[j].userFirstName,
					carNumber: waitlist[j].carNumber,
					raceClass:
						raceClasses !== undefined
							? getMapKey(waitlist[j].raceClass, raceClasses)
							: '',
					car: waitlist[j].car,
					runGroup:
						runGroups[i] !== undefined
							? getMapKey(waitlist[j].runGroup[i], runGroups[i])
							: '',
					workerAssignment:
						workerAssignments[i] !== undefined
							? getMapKey(
									waitlist[j].workerAssignment[i],
									workerAssignments[i]
							  )
							: '',
					lunchOption:
						lunchOptions !== undefined
							? getMapKey(waitlist[j].lunchOption, lunchOptions)
							: ''
				};
				waitlistData.push(entry);
			}
			waitlistDataArray.push(waitlistData);
		}
		setWaitlistArray(waitlistDataArray);
	};

	useEffect(() => {
		//*************** compose entry list from all the entries ************/
		composeEntryDataArray(eventEntryList);

		//compose waitlist
		composeWaitlistArray(eventWaitlist);

		setShowLoading(false);
	}, []);

	// PromoptModal will show up once confirmMsg been set, used to confirm ChargeAll and DeleteEntry
	const [confirmMsg, setConfirmMsg] = useState('');
	const [addEntry, setAddEntry] = useState(false);
	const [entryToBeAdded, setEntryToBeAdded] = useState();

	// getting confirmation from MTable about showing up modal
	const confirmAddUser = (val, entryId) => {
		if (val) {
			setAddEntry(true);
			setEntryToBeAdded(entryId);
			setConfirmMsg('Please confirm to ADD the entry to entry list.');
		}
	};

	const onCancelHandler = () => {
		setConfirmMsg('');
		if (addEntry) {
			setAddEntry(false);
			setEntryToBeAdded();
		}
	};

	const onConfirmHandler = async () => {
		setConfirmMsg('');
		if (addEntry) {
			setAddEntry(false);
			if (!entryToBeAdded) {
				setAddEntryError('Please select an entry to add.');
				return;
			}
			// send request to backend to add an entry
			let responseData, responseStatus, responseMessage;
			// send request to backend to charge all the entries
			try {
				[
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/entries/addEntryByClub/${entryToBeAdded}`,
					'POST',
					JSON.stringify({ daySelected: daySelection - 1 }),
					{
						'Content-Type': 'application/json',
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
			} catch (err) {}
			composeEntryDataArray(responseData.entryData);
			composeWaitlistArray(responseData.waitlistData);
		}
	};

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
			<ErrorModal
				error={error || addEntryError}
				onClear={errorClearHandler}
			/>
			<PromptModal
				onCancel={onCancelHandler}
				onConfirm={onConfirmHandler}
				contentClass="event-item__modal-content"
				footerClass="event-item__modal-actions"
				error={confirmMsg}
			/>
			{(isLoading || showLoading) && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
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
					<MaterialTableEntryReport
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
						lunchOptionLookup={lunchOptionLookup}
						confirmAddUser={confirmAddUser}
					/>
				)}
		</React.Fragment>
	);
};

export default EntryReport;
