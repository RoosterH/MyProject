import React, {
	useCallback,
	useEffect,
	useState,
	useContext
} from 'react';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import MaterialTableRunGroupManager from './MaterialTableRunGroupManager';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import '../../shared/components/FormElements/Button.css';

const NOT_ATTENDING = 'Not Attending';

const RunGroupManager = props => {
	const eventId = props.eventId;
	const clubAuthContext = useContext(ClubAuthContext);
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();
	const [showLoading, setShowLoading] = useState(true);
	const errorClearHandler = () => {
		clearError();
		setShowLoading(false);
	};

	// days = how many days for this event
	const [days, setDays] = useState(
		props.runGroupManagerData.runGroupOptions
			? props.runGroupManagerData.runGroupOptions.length
			: 0
	);
	const [runGroupOptions, setRunGroupOptions] = useState(
		props.runGroupManagerData.runGroupOptions
			? props.runGroupManagerData.runGroupOptions
			: undefined
	);

	// entries are the user entries
	const [eventName, setEventName] = useState(
		props.runGroupManagerData.eventName !== ''
			? props.runGroupManagerData.eventName
			: ''
	);
	const [runGroups, setRunGroups] = useState(
		props.runGroupManagerData.runGroupOptions
			? props.runGroupManagerData.runGroupOptions
			: undefined
	);
	const [runGroupNumEntries, setRunGroupNumEntries] = useState(
		props.runGroupManagerData.runGroupNumEntries
			? props.runGroupManagerData.runGroupNumEntries
			: undefined
	);
	const [
		runGroupRegistrationStatus,
		setRunGroupRegistrationStatus
	] = useState(
		props.runGroupManagerData.runGroupRegistrationStatus
			? props.runGroupManagerData.runGroupRegistrationStatus
			: undefined
	);

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
	// runGroups elements are the data passing to Material-Table
	const [runGroupArray, setRunGroupArray] = useState([]);

	const composeRunGroupArray = () => {
		//*************** compose entry list from all the entries ************/
		let runGroupDataArray = [];
		for (let i = 0; i < days; ++i) {
			let runGroupData = [];
			for (var j = 0; j < runGroups[i].length; ++j) {
				if (runGroups[i][j] === NOT_ATTENDING) {
					continue;
				}
				let runGroupItem = {
					groupNum: j,
					runGroup: runGroups[i][j],
					runGroupNumEntries: runGroupNumEntries[i][j],
					runGroupRegistrationStatus: runGroupRegistrationStatus[i][j]
						? 'Open'
						: 'Closed'
				};
				runGroupData.push(runGroupItem);
			}
			runGroupDataArray.push(runGroupData);
		}
		console.log('runGroupDataArray = ', runGroupDataArray);
		setRunGroupArray(runGroupDataArray);
	};

	useEffect(() => {
		//*************** compose entry list from all the entries ************/
		composeRunGroupArray();
		setShowLoading(false);
	}, []);

	const [groupToBeChanged, setGroupToBeChanged] = useState(-1);
	const changeGroupRegistration = group => {
		setGroupToBeChanged(group);
	};
	useEffect(() => {
		const changeGroupHandler = async () => {
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
						`/events/runGroupManager/${eventId}`,
					'PATCH',
					JSON.stringify({
						day: daySelection - 1,
						group: groupToBeChanged
					}),
					{
						'Content-Type': 'application/json',
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
			} catch (err) {}
			console.log(
				'responseData.runGroupRegistrationStatus = ',
				responseData.runGroupRegistrationStatus
			);
			setGroupToBeChanged(-1);
			setRunGroupRegistrationStatus(
				responseData.runGroupRegistrationStatus
			);
		};
		if (groupToBeChanged !== -1) {
			changeGroupHandler();
		}
	}, [groupToBeChanged, daySelection]);

	useEffect(() => {
		composeRunGroupArray();
	}, [runGroupRegistrationStatus]);
	// callback for Day Buttons
	const daySelectionCallback = index => {
		// index starts from 1, because we use day 1, day 2, ...
		setDaySelection(index);
	};

	const [dayButtonClass, setDayButtonClass] = useState(
		'button--small-white'
	);
	// create ref for day 1 button. For multi-day events, we want to set focus on day 1 button initially
	// We didn’t choose useRef in this example because an object ref doesn’t notify us about changes to
	// the current ref value. Using a callback ref ensures that even if a child component displays the
	// button later, we still get notified about it in the parent component and can update the color.
	const day1ButtonRef = useCallback(button => {
		if (!init && button) {
			button.focus();
			setInit(true);
			// setDayButtonClass('button--small-green');
		}
	});
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={errorClearHandler} />
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
								// className="button--small-white"
								className={dayButtonClass}
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
			{daySelection > 0 && runGroupArray.length > 0 && (
				<MaterialTableRunGroupManager
					runGroup={runGroupArray[daySelection - 1]}
					eventName={
						runGroupArray.length > 1
							? eventName + ' Day ' + daySelection
							: eventName
					}
					showLoading={showLoading}
					changeGroupRegistration={changeGroupRegistration}
				/>
			)}
		</React.Fragment>
	);
};

export default RunGroupManager;
