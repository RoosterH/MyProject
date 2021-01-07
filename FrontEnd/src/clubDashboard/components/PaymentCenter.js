import React, {
	useCallback,
	useContext,
	useEffect,
	useState
} from 'react';
import MaterialTablePaymentCenter from './MaterialTablePaymentCenter';
import '../../shared/components/FormElements/Button.css';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

const NOT_ATTENDING = 'Not Attending';
const PAID = 'Paid';
const UNPAID = 'Unpaid';
const AUTHENTICATION = 'Require Authentication';
const DECLINED = 'Declined';

const PaymentCenter = props => {
	const clubAuthContext = useContext(ClubAuthContext);
	const eventId = props.paymentCenterData.eventId;
	// days = how many days for this event
	const [days, setDays] = useState(
		props.paymentCenterData.entryData
			? props.paymentCenterData.entryData.length
			: 0
	);
	const [eventEntryList, setEventEntryList] = useState(
		props.paymentCenterData.entryData
	);

	// entries are the user entries
	const [eventName, setEventName] = useState(
		props.paymentCenterData.eventName !== ''
			? props.paymentCenterData.eventName
			: ''
	);

	const [lunchOptions, setLunchOptions] = useState(
		props.paymentCenterData.lunchOptions
			? props.paymentCenterData.lunchOptions
			: undefined
	);

	// flag of whether Chare All been clicked
	const [chargeAllStatus, setChargeAllStatus] = useState(false);

	// for delete entry
	const [delEntry, setDelEntry] = useState();
	const [delSuccess, setDelSuccess] = useState(false);

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
	const [lunchOptionLookup, setLunchOptionLookup] = useState();

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

	//*************** compose entry list from all the entries ************/
	useEffect(() => {
		//***********  construct lookups ************//
		let obj = {};
		obj = convert2Lookup(lunchOptions);
		setLunchOptionLookup(obj);

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
					stripeFee: entries[j].stripeFee,
					paymentStatus: entries[j].paymentStatus,
					lunchOption:
						lunchOptions !== undefined
							? getMapKey(entries[j].lunchOption, lunchOptions)
							: ''
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
	}, [lunchOptions, days, eventEntryList]);

	// return values from child MaterialTablePaymentCenter component
	const [email, setEmail] = useState('');
	const chargeByEmail = email => {
		setEmail(email);
	};
	const [paymentStatus, setPaymentStatus] = useState('');
	const getPaymentStatus = paymentStatus => {
		setPaymentStatus(paymentStatus);
	};
	// Error message for bad paymentStatus
	const [paymentStatusError, setPaymentStatusError] = useState();

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

	// renders when CHARGE button been clicked on MaterialTable
	useEffect(() => {
		const updateEntryListArray = async () => {
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

			// send charge request to backend at the same time if charge succeeds update paymentStatus
			let responseData, responseStatus, responseMessage;
			try {
				[
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/entries/charge/${entryId}`,
					'POST',
					null,
					{
						'Content-Type': 'application/json',
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
			} catch (err) {}

			// update entry paymentStatus
			if (responseData && responseData.paymentStatus) {
				if (responseData.paymentStatus === PAID) {
					// update entryListArray of each day
					for (let i = 0; i < days; ++i) {
						let index = entryListArray[i].findIndex(
							element => element.email === email
						);
						if (index >= 0) {
							entryListArray[i][index].paymentStatus = PAID;
						}
					}
				} else if (responseData.paymentStatus === DECLINED) {
					// update entryListArray of each day
					for (let i = 0; i < days; ++i) {
						let index = entryListArray[i].findIndex(
							element => element.email === email
						);
						if (index >= 0) {
							entryListArray[i][index].paymentStatus = DECLINED;
						}
					}
				} else if (responseData.paymentStatus === AUTHENTICATION) {
					// update entryListArray of each day
					for (let i = 0; i < days; ++i) {
						let index = entryListArray[i].findIndex(
							element => element.email === email
						);
						if (index >= 0) {
							entryListArray[i][index].paymentStatus = AUTHENTICATION;
						}
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
		if (
			email !== '' &&
			email !== undefined &&
			paymentStatus === UNPAID
		) {
			updateEntryListArray();
		} else if (
			email !== '' &&
			email !== undefined &&
			paymentStatus === DECLINED
		) {
			setPaymentStatusError(
				'Please contact customer to login and provide a new credit card.'
			);
			setEmail('');
		} else if (
			email !== '' &&
			email !== undefined &&
			paymentStatus === 'Require Authentication'
		) {
			setPaymentStatusError(
				'Please contact customer to login and authenticate the charge.'
			);
			setEmail('');
		}
	}, [
		daySelection,
		email,
		paymentStatus,
		eventEntryList,
		sendRequest,
		setEntryListArray
	]);

	const entryToDelete = entry => {
		setDelEntry(entry);
	};

	useEffect(() => {
		const deleteEntry = async () => {
			let responseData, responseStatus, responseMessage;
			console.log('delEntry = ', delEntry);
			try {
				[
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/entries/deleteEntryByClub/${delEntry.id}`,
					'DELETE',
					null,
					{
						'Content-Type': 'application/json',
						// adding JWT to header for authentication
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
			} catch (err) {}
			setDelSuccess(true);
		};

		if (!!delEntry) {
			deleteEntry();
		}
	}, [delEntry, sendRequest]);

	const getError = () => {
		if (error) {
			return error;
		}
		if (paymentStatusError) {
			return paymentStatusError;
		}
	};

	const errorClearHandler = () => {
		clearError();
		setPaymentStatusError();
		setShowLoading(false);
	};

	const updateEntryFee = async rowData => {
		// rowData has id(entryId) and refundFee, we only need these 2 info to update to backend
		try {
			let entryId = rowData.id;
			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/entries/updateEntryFee/${entryId}`,
				'POST',
				JSON.stringify({
					entryFee: rowData.entryFee
				}),
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
		} catch (err) {}
	};

	const [confirmMsg, setConfirmMsg] = useState();
	const confirmChargeAll = val => {
		if (val) {
			if (days == 1) {
				setConfirmMsg(
					'Please confirm you want to perform CHARGE ALL. This may take a few minutes to complete all the transactions.'
				);
			} else if (days > 1) {
				setConfirmMsg(
					'Please confirm you want to perform CHARGE ALL for all entried in ' +
						days +
						' days. This may take a few minutes to complete all the transactions.'
				);
			}
		}
	};

	const onCancelHandler = () => {
		setConfirmMsg('');
	};
	const onConfirmHandler = async () => {
		setConfirmMsg('');
		setShowLoading(true);
		if (
			entryListArray.length === 0 ||
			entryListArray[0].length === 0
		) {
			setPaymentStatusError('Nothing to charge.');
			setShowLoading(false);
			return;
		}

		let responseData, responseStatus, responseMessage;
		// send request to backend to charge all the entries
		try {
			[
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL +
					`/events/chargeAll/${eventId}`,
				'POST',
				null,
				{
					'Content-Type': 'application/json',
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + clubAuthContext.clubToken
				}
			);
		} catch (err) {}
		if (responseData.errorStatus) {
			setPaymentStatusError(
				'Some error occurs during Charge All. Please use table to check payment status.'
			);
		}
		setShowLoading(false);
		setEventEntryList(responseData.entryData);
		setChargeAllStatus(true);
	};

	return (
		<React.Fragment>
			<ErrorModal
				error={error || paymentStatusError}
				onClear={errorClearHandler}
			/>
			<PromptModal
				onCancel={onCancelHandler}
				onConfirm={onConfirmHandler}
				contentClass="event-item__modal-content"
				footerClass="event-item__modal-actions"
				error={confirmMsg}></PromptModal>

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
				<MaterialTablePaymentCenter
					entryList={entryListArray[daySelection - 1]}
					eventName={
						entryListArray.length > 1
							? eventName + ' Day ' + daySelection
							: eventName
					}
					showLoading={showLoading}
					chargeByEmail={chargeByEmail}
					getPaymentStatus={getPaymentStatus}
					lunchOptionLookup={lunchOptionLookup}
					updateEntryFee={updateEntryFee}
					chargeAllStatus={chargeAllStatus}
					confirmChargeAll={confirmChargeAll}
					entryToDelete={entryToDelete}
					delSuccess={delSuccess}
				/>
			)}
		</React.Fragment>
	);
};

export default PaymentCenter;
