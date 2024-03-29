import React, {
	useCallback,
	useContext,
	useEffect,
	useState
} from 'react';
import MaterialTableDataCenter from './MaterialTableDataCenter';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { ClubAuthContext } from '../../shared/context/auth-context';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import '../../shared/components/FormElements/Button.css';

const NOT_ATTENDING = 'Not Attending';
const PAID = 'Paid';
const REFUNDED = 'Refunded';
const STRIPE = 'stripe';

const DataCenter = props => {
	const clubAuthContext = useContext(ClubAuthContext);
	let eventEntryList = props.dataCenterData.entryData;

	const [days, setDays] = useState(
		props.dataCenterData.entryData
			? props.dataCenterData.entryData.length
			: 0
	);

	// entries are the user entries
	const [eventName, setEventName] = useState(
		props.dataCenterData.eventName !== ''
			? props.dataCenterData.eventName
			: ''
	);

	const [lunchOptions, setLunchOptions] = useState(
		props.dataCenterData.lunchOptions
			? props.dataCenterData.lunchOptions
			: undefined
	);
	const [lunchOrders, setLunchOrders] = useState([]);
	const [showLoading, setShowLoading] = useState(true);

	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// entryListArray elements are the data passing to Material-Table
	const [eventData, setEventData] = useState([]);
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
		// options[i] is "Turkey Sandwich $10"
		// convert it to json format lookup format- { 0: 'Turkey Sandwich $10', 1: 'Veggie Sandwich $10' },
		let lookupMap = {};
		for (var i = 0; i < options.length; ++i) {
			lookupMap[i] = options[i];
		}
		return lookupMap;
	};
	const [eventDataArray, setEventDataArray] = useState([]);
	// construct lunch choices array
	let lunchOrderNumArray = [];
	//*************** compose event data from all the entries ************/
	useEffect(() => {
		//***********  construct lookups ************//
		let obj = {};
		obj = convert2Lookup(lunchOptions);
		setLunchOptionLookup(obj);

		// For event provides lunches, create the array
		if (!!lunchOptions) {
			for (let i = 0; i < lunchOptions.length; ++i) {
				lunchOrderNumArray.push(0);
			}
		}
		let totalEntries = 0,
			totalAmount = 0,
			stripeFee = 0,
			refundFee = 0,
			unpaid = 0;

		// array that stores entries that have been calculated fees
		// For all the fees, it's based per person, put the entry in calculatedEntries after
		// the calculation.
		let calculatedEntries = [];
		for (let i = 0; i < days; ++i) {
			let entries = eventEntryList[i];
			for (let j = 0; j < entries.length; ++j) {
				// runGroup[i] represents run group for day i
				if (entries[j].runGroup[i] === NOT_ATTENDING) {
					continue;
				}
				// totalEntries counts entries for each day, for same person that enters multiple
				// days we want to count as multiple entries
				++totalEntries;

				// check if this entry fees and other fees have been calcuated, we don't want to
				// re-calculate same entry for fees
				let index = calculatedEntries.indexOf(entries[j].id);
				if (index !== -1) {
					continue;
				}
				totalAmount += parseFloat(entries[j].entryFee);
				if (entries[j].paymentMethod === STRIPE) {
					stripeFee += parseFloat(entries[j].stripeFee);
				}
				if (entries[j].paymentStatus === REFUNDED) {
					refundFee += parseFloat(entries[j].refundFee);
				} else if (entries[j].paymentStatus !== PAID) {
					unpaid += parseFloat(entries[j].entryFee);
				}
				if (!!lunchOptions) {
					// entries[j].lunchOption = 'Tuna Sandwich $10'
					lunchOrderNumArray[
						lunchOptions.indexOf(entries[j].lunchOption)
					]++;
				}
				calculatedEntries.push(entries[j].id);
			}
		}
		// construct eventData to be shown in the table
		let data = {
			totalEntries: totalEntries.toString(),
			totalAmount: '$' + totalAmount.toString(),
			stripeFee: '$' + stripeFee.toFixed(2).toString(),
			refundFee: '$' + refundFee.toFixed(2).toString(),
			unpaid: '$' + unpaid.toString(),
			net:
				'$' +
				(totalAmount - stripeFee - refundFee - unpaid)
					.toFixed(2)
					.toString()
		};

		let eventData = [];
		eventData.push(data);
		setEventDataArray(eventData);

		// number of orders for each lunch choice
		let lunchOrderArray = [];
		let orders = {};
		if (!!lunchOptions) {
			for (let i = 0; i < lunchOptions.length; ++i) {
				orders[lunchOptions[i]] = lunchOrderNumArray[i];
			}
		}
		lunchOrderArray.push(orders);
		setLunchOrders(lunchOrderArray);

		setShowLoading(false);
		return () => {
			// will run on every unmount.
			// console.log('component is unmounting');
		};
	}, []);

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{(isLoading || showLoading) && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{/* render material table according to event day */}
			<MaterialTableDataCenter
				eventData={eventDataArray}
				eventName={eventName}
				showLoading={showLoading}
				lunchOptions={lunchOptions}
				lunchOrders={lunchOrders}
			/>
		</React.Fragment>
	);
};

export default DataCenter;
