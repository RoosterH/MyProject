import React, {
	useCallback,
	useContext,
	useEffect,
	useState
} from 'react';
import MaterialTableRefundCenter from './MaterialTableRefundCenter';
import { loadStripe } from '@stripe/stripe-js';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import '../../shared/components/FormElements/Button.css';

const NOT_ATTENDING = 'Not Attending';
const PAID = 'Paid';
const UNPAID = 'Unpaid';
const AUTHENTICATION = 'Require Authentication';
const DECLINED = 'Declined';
const REFUNDED = 'Refunded';

const RefundCenter = props => {
	const clubAuthContext = useContext(ClubAuthContext);
	// days = how many days for this event
	const [days, setDays] = useState(
		props.refundCenterData.entryData
			? props.refundCenterData.entryData.length
			: 0
	);
	let eventEntryList = props.refundCenterData.entryData;

	// entries are the user entries
	const [eventName, setEventName] = useState(
		props.refundCenterData.eventName !== ''
			? props.refundCenterData.eventName
			: ''
	);
	const [showLoading, setShowLoading] = useState(true);

	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// create an array from day 1 to loop through when we are rendering day buttons
	const [dayArray, setDayArray] = useState([]);
	useEffect(() => {
		let tmp = [];
		// days = how many days for this event
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
	// entryListArray elements are the data passing to Material-Table
	const [entryListArray, setEntryListArray] = useState([]);

	//*************** compose entry list from all the entries ************/
	useEffect(() => {
		let entryDataArray = [];
		for (let i = 0; i < days; ++i) {
			let entryData = [];
			let entries = eventEntryList[i];
			for (let j = 0; j < entries.length; ++j) {
				if (entries[j].runGroup[i] === NOT_ATTENDING) {
					continue;
				}
				let entry = {
					id: entries[j].id, // we are not showing id on table
					lastName: entries[j].userLastName,
					firstName: entries[j].userFirstName,
					email: entries[j].email,
					carNumber: entries[j].carNumber,
					paymentMethod: entries[j].paymentMethod,
					entryFee: entries[j].entryFee,
					refundFee: entries[j].refundFee,
					paymentStatus: entries[j].paymentStatus
				};
				entryData.push(entry);
			}
			entryDataArray.push(entryData);
		}
		setEntryListArray(entryDataArray);
		setShowLoading(false);
		return () => {
			// will run on every unmount.
			// console.log('component is unmounting');
		};
	}, []);

	// return values from child MaterialTableRefundCenter component
	const [email, setEmail] = useState('');
	const [refundFee, setRefundFee] = useState('');
	const getEmailRefundFee = (email, refundFee) => {
		setEmail(email);
		setRefundFee(refundFee);
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
	}, []);

	const [refundStatusError, setRefundStatusError] = useState();
	// renders when there is a button click on MaterialTable
	useEffect(() => {
		const refundHandler = async () => {
			setShowLoading(true);
			let entryId;
			// dayIndex is the current daySelection, we want to modify entryListArray because we will
			// be sending it to MaterialTable
			// entryListArray only contains entries that are not NOT_ATTENDING
			let dayIndex = daySelection - 1;
			for (let i = 0; i < entryListArray[dayIndex].length; ++i) {
				if (entryListArray[dayIndex][i].email === email) {
					entryId = entryListArray[dayIndex][i].id;
					break;
				}
			}
			if (!entryId) {
				return;
			}

			// send refund request to backend at the same time if refund succeeds update paymentStatus to Refunded
			let responseData, responseStatus, responseMessage;
			try {
				[
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/entries/refund/${entryId}`,
					'POST',
					JSON.stringify({
						refundFee: refundFee
					}),
					{
						'Content-Type': 'application/json',
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
			} catch (err) {}

			// update entry paymentStatus
			if (responseData.refundStatus === true) {
				// update entryListArray of each day
				for (let i = 0; i < days; ++i) {
					let index = entryListArray[i].findIndex(
						element => element.email === email
					);
					if (index >= 0) {
						entryListArray[i][index].paymentStatus = REFUNDED;
					}
				}
			}

			setEntryListArray(entryListArray);
			// reset email to avoid accidental request to backend
			setEmail('');
			setShowLoading(false);
		};

		// handle actions per paymentStatus
		// if UNPAID, send charge request to backend
		if (email !== '' && email !== undefined) {
			refundHandler();
		}
	}, [
		daySelection,
		email,
		refundFee,
		eventEntryList,
		sendRequest,
		setEntryListArray
	]);

	return (
		<React.Fragment>
			<ErrorModal
				error={error || refundStatusError}
				onClear={clearError}
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
			{daySelection > 0 && entryListArray.length > 0 && (
				<MaterialTableRefundCenter
					entryList={entryListArray[daySelection - 1]}
					eventName={
						entryListArray.length > 1
							? eventName + ' Day ' + daySelection
							: eventName
					}
					showLoading={showLoading}
					getEmailRefundFee={getEmailRefundFee}
				/>
			)}
		</React.Fragment>
	);
};

export default RefundCenter;
