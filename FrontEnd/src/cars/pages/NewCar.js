import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import moment from 'moment';
import NavigationPrompt from 'react-router-navigation-prompt';

// import { EditorState } from 'draft-js';
// import { RichEditorExample } from '../components/RichEditor';
// import 'draft-js/dist/Draft.css';

import { useUserLoginValidation } from '../../shared/hooks/userLoginValidation-hook';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import ImageUploader from '../../shared/components/FormElements/ImageUploader';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PromptModal from '../../shared/components/UIElements/PromptModal';

import { useHttpClient } from '../../shared/hooks/http-hook';
import { UserAuthContext } from '../../shared/context/auth-context';
import { FormContext } from '../../shared/context/form-context';

import '../../shared/css/EventForm.css';

const NewCar = setFieldValue => {
	const [initialized, setInitialized] = useState(false);
	const userAuthContext = useContext(UserAuthContext);
	const formContext = useContext(FormContext);
	let userName = userAuthContext.userName;
	useEffect(() => {
		let mounted = true;
		if (mounted) {
			formContext.setIsInsideForm(true);
		}
		return () => {
			mounted = false;
		};
	}, [formContext]);

	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	// authentication check
	useUserLoginValidation('/users/cars/new');
	// If we are re-directing to this page, we want to clear up clubRedirectURL
	let location = useLocation();
	React.useEffect(() => {
		let path = location.pathname;
		let userRedirectURL = userAuthContext.userRedirectURL;
		if (path === userRedirectURL) {
			// re-init redirectURL after re-direction route
			userAuthContext.setUserRedirectURL(null);
		}
	}, [location, userAuthContext]);

	const [year, setYear] = useState('');
	const [make, setMake] = useState('');
	const [model, setModel] = useState('');
	const [trimLevel, setTrimLevel] = useState('');
	const [share, setShare] = useState(false);
	const [tireBrand, setTireBrand] = useState('');
	const [tireName, setTireName] = useState('');
	const [tireFrontWidth, setTireFrontWidth] = useState('');
	const [tireFrontDiameter, setTireFrontDiameter] = useState('');
	const [tireFrontRatio, setTireFrontRatio] = useState('');
	const [tireRearWidth, setTireRearWidth] = useState('');
	const [tireRearDiameter, setTireRearDiameter] = useState('');
	const [tireRearRatio, setTireRearRatio] = useState('');
	const [frontPressure, setFrontPressure] = useState('');
	const [rearPressure, setRearPressure] = useState('');
	const [LFCamber, setLFCamber] = useState('');
	const [RFCamber, setRFCamber] = useState('');
	const [LRCamber, setLRCamber] = useState('');
	const [RRCamber, setRRCamber] = useState('');
	const [LFCaster, setLFCaster] = useState('');
	const [RFCaster, setRFCaster] = useState('');
	const [LFToe, setLFToe] = useState('');
	const [RFToe, setRFToe] = useState('');
	const [frontToe, setfrontToe] = useState('');
	const [LRToe, setLRToe] = useState('');
	const [RRToe, setRRToe] = useState('');
	const [rearToe, setRearToe] = useState('');
	const [FBar, setFBar] = useState('');
	const [RBar, setRBar] = useState('');
	const [FRebound, setFRebound] = useState('');
	const [RRebound, setRRebound] = useState('');
	const [FCompression, setFCompression] = useState('');
	const [RCompression, setRCompression] = useState('');
	const [note, setNote] = useState('');

	// todo: retrieve file from Reader: const [image, setImage] = useState();
	// todo: const [courseMap, setCourseMap] = useState('');
	let image = undefined;

	// initialize local storage
	// Get the existing data
	var carFormData = localStorage.getItem('carFormData');

	// If no existing data, create an array; otherwise retrieve it
	carFormData = carFormData ? JSON.parse(carFormData) : {};

	const [OKLeavePage, setOKLeavePage] = useState(true);
	// local storage gets the higest priority
	// get from localStorage
	if (
		!initialized &&
		carFormData &&
		moment(carFormData.expirationDate) > moment()
	) {
		setInitialized(true);
		// Form data
		if (carFormData.year) {
			setYear(carFormData.year);
		}
		if (carFormData.make) {
			setMake(carFormData.make);
		}
		if (carFormData.model) {
			setModel(carFormData.model);
		}
		if (carFormData.trimLevel) {
			setTrimLevel(carFormData.trimLevel);
		}
		if (carFormData.share) {
			setShare(carFormData.share);
		}
		if (carFormData.tireBrand) {
			setTireBrand(carFormData.tireBrand);
		}
		if (carFormData.tireName) {
			setTireName(carFormData.tireName);
		}
		if (carFormData.tireFrontWidth) {
			setTireFrontWidth(carFormData.tireFrontWidth);
		}
		if (carFormData.tireFrontDiameter) {
			setTireFrontDiameter(carFormData.tireFrontDiameter);
		}
		if (carFormData.tireFrontRatio) {
			setTireFrontRatio(carFormData.tireFrontRatio);
		}
		if (carFormData.tireRearWidth) {
			setTireRearWidth(carFormData.tireRearWidth);
		}
		if (carFormData.tireRearDiameter) {
			setTireRearDiameter(carFormData.tireRearDiameter);
		}
		if (carFormData.tireRearRatio) {
			setTireRearRatio(carFormData.tireRearRatio);
		}
		if (carFormData.frontPressure) {
			setFrontPressure(carFormData.frontPressure);
		}
		if (carFormData.rearPressure) {
			setRearPressure(carFormData.rearPressure);
		}
		if (carFormData.LFCamber) {
			setLFCamber(carFormData.LFCamber);
		}
		if (carFormData.RFCamber) {
			setRFCamber(carFormData.RFCamber);
		}
		if (carFormData.LRCamber) {
			setLRCamber(carFormData.LRCamber);
		}
		if (carFormData.RRCamber) {
			setRRCamber(carFormData.RRCamber);
		}
		if (carFormData.LFCaster) {
			setLFCaster(carFormData.LFCaster);
		}
		if (carFormData.RFCaster) {
			setRFCaster(carFormData.RFCaster);
		}
		if (carFormData.LFToe) {
			setLFToe(carFormData.LFToe);
		}
		if (carFormData.RFToe) {
			setRFToe(carFormData.RFToe);
		}
		if (carFormData.frontToe) {
			setfrontToe(carFormData.frontToe);
		}
		if (carFormData.LRToe) {
			setLRToe(carFormData.LRToe);
		}
		if (carFormData.RRToe) {
			setRRToe(carFormData.RRToe);
		}
		if (carFormData.rearToe) {
			setRearToe(carFormData.rearToe);
		}
		if (carFormData.FBar) {
			setFBar(carFormData.FBar);
		}
		if (carFormData.RBar) {
			setRBar(carFormData.RBar);
		}
		if (carFormData.FRebound) {
			setFRebound(carFormData.FRebound);
		}
		if (carFormData.RRebound) {
			setRRebound(carFormData.RRebound);
		}
		if (carFormData.FCompression) {
			setFCompression(carFormData.FCompression);
		}
		if (carFormData.RCompression) {
			setRCompression(carFormData.RCompression);
		}
		if (carFormData.note) {
			setNote(carFormData.note);
		}
		if (carFormData.image) {
			//setImage(carFormData.image);
			// setImageOK(false);
		}
	} else if (!initialized) {
		setInitialized(true);
		// initialize localStorage
		carFormData['expirationDate'] = moment(
			moment().add(1, 'days'),
			moment.ISO_8601
		);
		carFormData['year'] = '';
		carFormData['make'] = '';
		carFormData['model'] = '';
		carFormData['trimLevel'] = '';
		carFormData['share'] = '';
		carFormData['tireBrand'] = '';
		carFormData['tireName'] = '';
		carFormData['tireFrontWidth'] = '';
		carFormData['tireFrontDiameter'] = '';
		carFormData['tireFrontRatio'] = '';
		carFormData['tireRearWidth'] = '';
		carFormData['tireRearDiameter'] = '';
		carFormData['tireRearRatio'] = '';
		carFormData['frontPressure'] = '';
		carFormData['rearPressure'] = '';
		carFormData['LFCamber'] = '';
		carFormData['RFCamber'] = '';
		carFormData['LRCamber'] = '';
		carFormData['RRCamber'] = '';
		carFormData['LFCaster'] = '';
		carFormData['RFCaster'] = '';
		carFormData['LFToe'] = '';
		carFormData['RFToe'] = '';
		carFormData['frontToe'] = '';
		carFormData['LRToe'] = '';
		carFormData['RRToe'] = '';
		carFormData['rearToe'] = '';
		carFormData['FBar'] = '';
		carFormData['RBar'] = '';
		carFormData['FRebound'] = '';
		carFormData['RRebound'] = '';
		carFormData['FCompression'] = '';
		carFormData['RCompression'] = '';
		carFormData['note'] = '';
		carFormData['image'] = undefined;
		localStorage.setItem('carFormData', JSON.stringify(carFormData));
	}

	const removeCarFormData = () => {
		localStorage.removeItem('carFormData');
	};

	const initialValues = {
		// editorState: new EditorState.createEmpty(),
		year: year,
		make: make,
		model: model,
		trimLevel: trimLevel,
		share: share,
		tireBrand: tireBrand,
		tireName: tireName,
		tireFrontWidth: tireFrontWidth,
		tireFrontRatio: tireFrontRatio,
		tireFrontDiameter: tireFrontDiameter,
		tireRearWidth: tireRearWidth,
		tireRearRatio: tireRearRatio,
		tireRearDiameter: tireRearDiameter,
		frontPressure: frontPressure,
		rearPressure: rearPressure,
		LFCamber: LFCamber,
		RFCamber: RFCamber,
		LRCamber: LRCamber,
		RRCamber: RRCamber,
		LFCaster: LFCaster,
		RFCaster: RFCaster,
		LFToe: LFToe,
		RFToe: RFToe,
		frontToe: frontToe,
		LRToe: LRToe,
		RRToe: RRToe,
		rearToe: rearToe,
		FBar: FBar,
		RBar: RBar,
		FRebound: FRebound,
		RRebound: RRebound,
		FCompression: FCompression,
		RCompression: RCompression,
		note: note,
		image: image
	};

	const updateCarFormData = (key, value) => {
		const storageData = JSON.parse(
			localStorage.getItem('carFormData')
		);
		storageData[key] = value;
		localStorage.setItem('carFormData', JSON.stringify(storageData));
	};

	const history = useHistory();
	const submitHandler = async (values, actions) => {
		try {
			const formData = new FormData();
			formData.append('year', values.year);
			formData.append('make', values.make);
			formData.append('model', values.model);
			formData.append('trimLevel', values.trimLevel);
			formData.append('share', values.share);
			formData.append('tireBrand', values.tireBrand);
			formData.append('tireName', values.tireName);
			formData.append('tireFrontWidth', values.tireFrontWidth);
			formData.append('tireFrontRatio', values.tireFrontRatio);
			formData.append('tireFrontDiameter', values.tireFrontDiameter);
			formData.append('tireRearWidth', values.tireRearWidth);
			formData.append('tireRearRatio', values.tireRearRatio);
			formData.append('tireRearDiameter', values.tireRearDiameter);
			formData.append('frontPressure', values.frontPressure);
			formData.append('rearPressure', values.rearPressure);

			formData.append('LFCamber', values.LFCamber);
			formData.append('RFCamber', values.RFCamber);
			formData.append('LRCamber', values.LRCamber);
			formData.append('RRCamber', values.RRCamber);
			formData.append('LFCaster', values.LFCaster);
			formData.append('RFCaster', values.RFCaster);
			formData.append('LFToe', values.LFToe);
			formData.append('RFToe', values.RFToe);
			formData.append('frontToe', values.frontToe);
			formData.append('LRToe', values.LRToe);
			formData.append('RRToe', values.RRToe);
			formData.append('rearToe', values.rearToe);
			formData.append('FBar', values.FBar);
			formData.append('RBar', values.RBar);

			formData.append('FRebound', values.FRebound);
			formData.append('RRebound', values.RRebound);
			formData.append('FCompression', values.FCompression);
			formData.append('RCompression', values.RCompression);
			formData.append('note', values.note);
			formData.append('carImage', values.image);

			const [
				responseData,
				responseStatus,
				responseMessage
			] = await sendRequest(
				process.env.REACT_APP_BACKEND_URL + '/cars',
				'POST',
				formData,
				{
					// adding JWT to header for authentication
					Authorization: 'Bearer ' + userAuthContext.userToken
				}
			);
			setOKLeavePage(true);
			// Redirect the club to a diffrent page
			history.push(`/users/garagewrapper/${userAuthContext.userId}`);
		} catch (err) {}
	};

	/***** Form Validation Section  *****/
	// 1. Field level: Field validate={validateName}. This validates when Field is onBlur
	// 3. Submit: use Formik isValid to enable the button.  Formik submission will validate everything.
	const [validateYear, setValidateYear] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Year is required.';
		}
		return error;
	});

	const [validateMake, setValidateMake] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Make is required.';
		}
		return error;
	});

	const [validateModel, setValidateModel] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Model is required.';
		}
		return error;
	});

	const [validateTireBrand, setValidateTireBrand] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Tire Brand is required.';
			}
			return error;
		}
	);

	const [validateTireName, setValidateTireName] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Tire Name is required.';
			}
			return error;
		}
	);

	const [
		validateTireFrontWidth,
		setValidateTireFrontWidth
	] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Front Tire Width is required.';
		}
		return error;
	});
	const [
		validateTireFrontRatio,
		setValidateTireFrontRatio
	] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Front Tire Ratio is required.';
		}
		return error;
	});
	const [
		validateTireFrontDiameter,
		setValidateTireFrontDiameter
	] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Front Tire Diameter is required.';
		}
		return error;
	});
	const [validateTireRearWidth, setValidateTireRearWidth] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Rear Tire Width is required.';
			}
			return error;
		}
	);
	const [validateTireRearRatio, setValidateTireRearRatio] = useState(
		() => value => {
			let error;
			if (!value) {
				error = 'Rear Tire Ratio is required.';
			}
			return error;
		}
	);
	const [
		validateTireRearDiameter,
		setValidateTireRearDiameter
	] = useState(() => value => {
		let error;
		if (!value) {
			error = 'Rear Tire Diameter is required.';
		}
		return error;
	});

	const validateImageSize = value => {
		let error;
		if (value && value.size > 1500000) {
			error = 'File size needs to be smaller than 1.5MB';
		}
		return error;
	};
	/***** End of Form Validation *****/

	const carForm = values => (
		<div className="event-form">
			<div className="event-form-header">
				<h4>
					{userName}
					's new car
				</h4>
				<hr className="event-form__hr" />
			</div>
			<Formik
				enableReinitialize={true}
				initialValues={initialValues}
				onSubmit={(values, actions) => {
					submitHandler(values);
					if (!actions.isSubmitting) {
						setValidateYear(() => value => {
							let error;
							if (!value) {
								error = 'Year is required.';
							}
							return error;
						});
						setValidateMake(() => value => {
							let error;
							if (!value) {
								error = 'Make is required.';
							}
							return error;
						});
						setValidateModel(() => value => {
							let error;
							if (!value) {
								error = 'Model is required.';
							}
							return error;
						});
						setValidateTireBrand(() => value => {
							let error;
							if (!value) {
								error = 'Tire Brand is required.';
							}
							return error;
						});
						setValidateTireName(() => value => {
							let error;
							if (!value) {
								error = 'Tire Name is required.';
							}
							return error;
						});
						setValidateTireFrontWidth(() => value => {
							let error;
							if (!value) {
								error = 'Front Tire Width is required.';
							}
							return error;
						});
						setValidateTireFrontRatio(() => value => {
							let error;
							if (!value) {
								error = 'Front Tire Ratio is required.';
							}
							return error;
						});
						setValidateTireFrontDiameter(() => value => {
							let error;
							if (!value) {
								error = 'Front Tire Diameter is required.';
							}
							return error;
						});
						setValidateTireRearWidth(() => value => {
							let error;
							if (!value) {
								error = 'Rear Tire Width is required.';
							}
							return error;
						});
						setValidateTireRearRatio(() => value => {
							let error;
							if (!value) {
								error = 'Rear Tire Ratio is required.';
							}
							return error;
						});
						setValidateTireRearDiameter(() => value => {
							let error;
							if (!value) {
								error = 'Rear Tire Diameter is required.';
							}
							return error;
						});
					}
				}}>
				{({
					values,
					errors,
					isSubmitting,
					isValid,
					setFieldValue,
					touched,
					handleBlur
				}) => (
					<Form className="event-form-container">
						<label
							htmlFor="year"
							className="event-form__label_inline_quarter">
							<i className="far fa-car-side" />
							&nbsp; Year &nbsp;
							<i
								className="far fa-gas-pump"
								style={{ color: 'Tomato' }}
							/>
						</label>
						<label
							htmlFor="make"
							className="event-form__label_inline_quarter">
							Make &nbsp;
							<i
								className="far fa-gas-pump"
								style={{ color: 'Tomato' }}
							/>
						</label>
						<label
							htmlFor="model"
							className="event-form__label_inline_quarter">
							Model &nbsp;
							<i
								className="far fa-gas-pump"
								style={{ color: 'Tomato' }}
							/>
						</label>
						<label
							htmlFor="trimLevel"
							className="event-form__label_inline_quarter">
							Trim
						</label>
						<Field
							id="year"
							name="year"
							type="text"
							className="event-form__field_quarter"
							validate={validateYear}
							onBlur={event => {
								// without handBlure(event) touched.year will not work
								handleBlur(event);
								updateCarFormData('year', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						<Field
							id="make"
							name="make"
							type="text"
							className="event-form__field_quarter"
							validate={validateMake}
							onBlur={event => {
								// without handBlure(event) touched.make will not work
								handleBlur(event);
								updateCarFormData('make', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						<Field
							id="model"
							name="model"
							type="text"
							className="event-form__field_quarter"
							validate={validateModel}
							onBlur={event => {
								// without handBlure(event) touched.model will not work
								handleBlur(event);
								updateCarFormData('model', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						<Field
							id="trimLevel"
							name="trimLevel"
							type="text"
							className="event-form__field_quarter"
							onBlur={event => {
								// without handBlure(event) touched.trimLevel will not work
								handleBlur(event);
								updateCarFormData('trimLevel', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{(touched.year ||
							touched.make ||
							touched.model ||
							touched.trimLevel) &&
							(errors.year ||
								errors.make ||
								errors.model ||
								errors.trimLevel) && (
								<React.Fragment>
									<div className="event-form__field-error_quarter">
										{errors.year}
									</div>
									<div className="event-form__field-error_quarter">
										{errors.make}
									</div>
									<div className="event-form__field-error_quarter">
										{errors.model}
									</div>
									<div className="event-form__field-error_quarter">
										{errors.trimLevel}
									</div>
								</React.Fragment>
							)}
						<label
							htmlFor="tireBrand"
							className="event-form__label_inline_half">
							<i className="fad fa-tire" />
							&nbsp; Tire Brand &nbsp;
							<i
								className="far fa-gas-pump"
								style={{ color: 'Tomato' }}
							/>
						</label>
						<label
							htmlFor="tireName"
							className="event-form__label_inline_half">
							Tire Name &nbsp;
							<i
								className="far fa-gas-pump"
								style={{ color: 'Tomato' }}
							/>
						</label>
						<Field
							id="tireBrand"
							name="tireBrand"
							type="text"
							className="event-form__field_half"
							validate={validateTireBrand}
							onBlur={event => {
								// without handBlure(event) touched.tireBrand will not work
								handleBlur(event);
								updateCarFormData('tireBrand', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						<Field
							id="tireName"
							name="tireName"
							type="text"
							className="event-form__field_half"
							validate={validateTireName}
							onBlur={event => {
								// without handBlure(event) touched.name will not work
								handleBlur(event);
								updateCarFormData('tireName', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{(touched.tireBrand || touched.tireName) &&
							(errors.tireBrand || errors.tireName) && (
								<React.Fragment>
									<div className="event-form__field-error_half">
										{errors.tireBrand}
									</div>
									<div className="event-form__field-error_half">
										{errors.tireName}
									</div>
								</React.Fragment>
							)}
						<label
							htmlFor="tireFrontWidth"
							className="event-form__label_inline_third">
							<i className="far fa-ruler-horizontal" />
							&nbsp; Front Tire Width &nbsp;
							<i
								className="far fa-gas-pump"
								style={{ color: 'Tomato' }}
							/>
						</label>
						<label
							htmlFor="tireFrontRatio"
							className="event-form__label_inline_third">
							Front Tire Ratio &nbsp;
							<i
								className="far fa-gas-pump"
								style={{ color: 'Tomato' }}
							/>
						</label>
						<label
							htmlFor="tireFrontDiameter"
							className="event-form__label_inline_third">
							Front Tire Diameter &nbsp;
							<i
								className="far fa-gas-pump"
								style={{ color: 'Tomato' }}
							/>
						</label>
						<Field
							id="tireFrontWidth"
							name="tireFrontWidth"
							type="text"
							className="event-form__field_third"
							validate={validateTireFrontWidth}
							onBlur={event => {
								// without handBlure(event) touched.tireFrontWidth will not work
								handleBlur(event);
								updateCarFormData(
									'tireFrontWidth',
									event.target.value
								);
								setOKLeavePage(false);
							}}
						/>
						<Field
							id="tireFrontRatio"
							name="tireFrontRatio"
							type="text"
							className="event-form__field_third"
							validate={validateTireFrontRatio}
							onBlur={event => {
								// without handBlure(event) touched.tireFrontRatio will not work
								handleBlur(event);
								updateCarFormData(
									'tireFrontRatio',
									event.target.value
								);
								setOKLeavePage(false);
							}}
						/>
						<Field
							id="tireFrontDiameter"
							name="tireFrontDiameter"
							type="text"
							className="event-form__field_third"
							validate={validateTireFrontDiameter}
							onBlur={event => {
								// without handBlure(event) touched.tireFrontDiameter will not work
								handleBlur(event);
								updateCarFormData(
									'tireFrontDiameter',
									event.target.value
								);
								setOKLeavePage(false);
							}}
						/>
						{(touched.tireFrontWidth ||
							touched.tireFrontRatio ||
							touched.tireFrontDiameter) &&
							(errors.tireFrontWidth ||
								errors.tireFrontRatio ||
								errors.tireFrontDiameter) && (
								<React.Fragment>
									<div className="event-form__field-error_third">
										{errors.tireFrontWidth}
									</div>
									<div className="event-form__field-error_third">
										{errors.tireFrontRatio}
									</div>
									<div className="event-form__field-error_third">
										{errors.tireFrontDiameter}
									</div>
								</React.Fragment>
							)}
						<label
							htmlFor="tireRearWidth"
							className="event-form__label_inline_third">
							<i className="far fa-ruler-horizontal" />
							&nbsp; Rear Tire Width &nbsp;
							<i
								className="far fa-gas-pump"
								style={{ color: 'Tomato' }}
							/>
						</label>
						<label
							htmlFor="tireRearRatio"
							className="event-form__label_inline_third">
							Rear Tire Ratio &nbsp;
							<i
								className="far fa-gas-pump"
								style={{ color: 'Tomato' }}
							/>
						</label>
						<label
							htmlFor="tireRearDiameter"
							className="event-form__label_inline_third">
							Rear Tire Diameter &nbsp;
							<i
								className="far fa-gas-pump"
								style={{ color: 'Tomato' }}
							/>
						</label>
						<Field
							id="tireRearWidth"
							name="tireRearWidth"
							type="text"
							className="event-form__field_third"
							validate={validateTireRearWidth}
							onBlur={event => {
								// without handBlure(event) touched.tireRearWidth will not work
								handleBlur(event);
								updateCarFormData(
									'tireRearWidth',
									event.target.value
								);
								setOKLeavePage(false);
							}}
						/>
						<Field
							id="tireRearRatio"
							name="tireRearRatio"
							type="text"
							className="event-form__field_third"
							validate={validateTireRearRatio}
							onBlur={event => {
								// without handBlure(event) touched.tireRearRatio will not work
								handleBlur(event);
								updateCarFormData(
									'tireRearRatio',
									event.target.value
								);
								setOKLeavePage(false);
							}}
						/>
						<Field
							id="tireRearDiameter"
							name="tireRearDiameter"
							type="text"
							className="event-form__field_third"
							validate={validateTireRearDiameter}
							onBlur={event => {
								// without handBlure(event) touched.tireRearDiameter will not work
								handleBlur(event);
								updateCarFormData(
									'tireRearDiameter',
									event.target.value
								);
								setOKLeavePage(false);
							}}
						/>
						{(touched.tireRearWidth ||
							touched.tireRearRatio ||
							touched.tireRearDiameter) &&
							(errors.tireRearWidth ||
								errors.tireRearRatio ||
								errors.tireRearDiameter) && (
								<React.Fragment>
									<div className="event-form__field-error_third">
										{errors.tireRearWidth}
									</div>
									<div className="event-form__field-error_third">
										{errors.tireRearRatio}
									</div>
									<div className="event-form__field-error_third">
										{errors.tireRearDiameter}
									</div>
								</React.Fragment>
							)}
						{/* This first checkbox will result in a boolean value being stored. Note that the `value` prop
					            				on the <Field/> is omitted */}
						<label className="event-form__checkbox">
							<Field type="checkbox" name="share" />
							{/* {`${values.share}`} */} &nbsp; Check if you want to
							make the following information visible to public
						</label>
						<label
							htmlFor="frontPressure"
							className="event-form__label_inline_half">
							<i className="fal fa-tire-pressure-warning" />
							&nbsp; Front Tire Pressure psi
						</label>
						<label
							htmlFor="rearPressure"
							className="event-form__label_inline_half">
							Rear Tire Pressure psi
						</label>
						<Field
							id="frontPressure"
							name="frontPressure"
							type="text"
							className="event-form__field_half"
							onBlur={event => {
								// without handBlure(event) touched.frontPressure will not work
								handleBlur(event);
								updateCarFormData(
									'frontPressure',
									event.target.value
								);
								setOKLeavePage(false);
							}}
						/>
						{touched.frontPressure && errors.frontPressure && (
							<div className="event-form__field-error">
								{errors.frontPressure}
							</div>
						)}
						<Field
							id="rearPressure"
							name="rearPressure"
							type="text"
							className="event-form__field_half"
							onBlur={event => {
								// without handBlure(event) touched.rearPressure will not work
								handleBlur(event);
								updateCarFormData('rearPressure', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.rearPressure && errors.rearPressure && (
							<div className="event-form__field-error">
								{errors.rearPressure}
							</div>
						)}
						<label
							htmlFor="LFCamber"
							className="event-form__label_inline_quarter">
							<i className="fal fa-ruler-triangle fa-rotate-90" />
							&nbsp; Left Front Camber &#x00B0;
						</label>
						<label
							htmlFor="RFCamber"
							className="event-form__label_inline_quarter">
							Right Front Camber &#x00B0;
						</label>
						<label
							htmlFor="LRCamber"
							className="event-form__label_inline_quarter">
							Left Rear Camber &#x00B0;
						</label>
						<label
							htmlFor="RRCamber"
							className="event-form__label_inline_quarter">
							Right Rear Camber &#x00B0;
						</label>
						<Field
							id="LFCamber"
							name="LFCamber"
							type="text"
							className="event-form__field_quarter"
							onBlur={event => {
								// without handBlure(event) touched.LFCamber will not work
								handleBlur(event);
								updateCarFormData('LFCamber', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.LFCamber && errors.LFCamber && (
							<div className="event-form__field-error">
								{errors.LFCamber}
							</div>
						)}
						<Field
							id="RFCamber"
							name="RFCamber"
							type="text"
							className="event-form__field_quarter"
							onBlur={event => {
								// without handBlure(event) touched.RFCamber will not work
								handleBlur(event);
								updateCarFormData('RFCamber', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.RFCamber && errors.RFCamber && (
							<div className="event-form__field-error">
								{errors.RFCamber}
							</div>
						)}
						<Field
							id="LRCamber"
							name="LRCamber"
							type="text"
							className="event-form__field_quarter"
							onBlur={event => {
								// without handBlure(event) touched.LRCamber will not work
								handleBlur(event);
								updateCarFormData('LRCamber', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.LRCamber && errors.LRCamber && (
							<div className="event-form__field-error">
								{errors.LRCamber}
							</div>
						)}
						<Field
							id="RRCamber"
							name="RRCamber"
							type="text"
							className="event-form__field_quarter"
							onBlur={event => {
								// without handBlure(event) touched.RRCamber will not work
								handleBlur(event);
								updateCarFormData('RRCamber', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.RRCamber && errors.RRCamber && (
							<div className="event-form__field-error">
								{errors.RRCamber}
							</div>
						)}
						<label
							htmlFor="LFCaster"
							className="event-form__label_inline_half">
							<i className="fal fa-starfighter-alt" />
							&nbsp; Left Front Caster &#x00B0;
						</label>
						<label
							htmlFor="RFCaster"
							className="event-form__label_inline_half">
							Right Front Caster &#x00B0;
						</label>
						<Field
							id="LFCaster"
							name="LFCaster"
							type="text"
							className="event-form__field_half"
							onBlur={event => {
								// without handBlure(event) touched.LFCaster will not work
								handleBlur(event);
								updateCarFormData('LFCaster', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.LFCaster && errors.LFCaster && (
							<div className="event-form__field-error">
								{errors.LFCaster}
							</div>
						)}
						<Field
							id="RFCaster"
							name="RFCaster"
							type="text"
							className="event-form__field_half"
							onBlur={event => {
								// without handBlure(event) touched.RFCaster will not work
								handleBlur(event);
								updateCarFormData('RFCaster', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.RFCaster && errors.RFCaster && (
							<div className="event-form__field-error">
								{errors.RFCaster}
							</div>
						)}
						<label
							htmlFor="LFToe"
							className="event-form__label_inline_third">
							<i className="far fa-steering-wheel " />
							&nbsp; Left Front Toe &#x2033;
						</label>
						<label
							htmlFor="RFToe"
							className="event-form__label_inline_third">
							Right Front Toe &#x2033;
						</label>
						<label
							htmlFor="frontToe"
							className="event-form__label_inline_third">
							Front Toe &#x2033;
						</label>
						<Field
							id="LFToe"
							name="LFToe"
							type="text"
							className="event-form__field_third"
							onBlur={event => {
								// without handBlure(event) touched.LFToe will not work
								handleBlur(event);
								updateCarFormData('LFToe', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						<Field
							id="RFToe"
							name="RFToe"
							type="text"
							className="event-form__field_third"
							onBlur={event => {
								// without handBlure(event) touched.RFToe will not work
								handleBlur(event);
								updateCarFormData('RFToe', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						<Field
							id="frontToe"
							name="frontToe"
							type="text"
							className="event-form__field_third"
							onBlur={event => {
								// without handBlure(event) touched.frontToe will not work
								handleBlur(event);
								updateCarFormData('frontToe', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.LFToe && errors.LFToe && (
							<div className="event-form__field-error">
								{errors.LFToe}
							</div>
						)}
						{touched.RFToe && errors.RFToe && (
							<div className="event-form__field-error">
								{errors.RFToe}
							</div>
						)}
						{touched.frontToe && errors.frontToe && (
							<div className="event-form__field-error">
								{errors.frontToe}
							</div>
						)}
						<label
							htmlFor="LRToe"
							className="event-form__label_inline_third">
							<i className="far fa-steering-wheel" />
							&nbsp; Left Rear Toe &#x2033;
						</label>
						<label
							htmlFor="RRToe"
							className="event-form__label_inline_third">
							Right Rear Toe &#x2033;
						</label>
						<label
							htmlFor="rearToe"
							className="event-form__label_inline_third">
							Rear Toe &#x2033;
						</label>
						<Field
							id="LRToe"
							name="LRToe"
							type="text"
							className="event-form__field_third"
							onBlur={event => {
								// without handBlure(event) touched.LRToe will not work
								handleBlur(event);
								updateCarFormData('LRToe', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						<Field
							id="RRToe"
							name="RRToe"
							type="text"
							className="event-form__field_third"
							onBlur={event => {
								// without handBlure(event) touched.RRToe will not work
								handleBlur(event);
								updateCarFormData('RRToe', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						<Field
							id="rearToe"
							name="rearToe"
							type="text"
							className="event-form__field_third"
							onBlur={event => {
								// without handBlure(event) touched.rearToe will not work
								handleBlur(event);
								updateCarFormData('rearToe', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.LRToe && errors.LRToe && (
							<div className="event-form__field-error">
								{errors.LRToe}
							</div>
						)}
						{touched.RRToe && errors.RRToe && (
							<div className="event-form__field-error">
								{errors.RRToe}
							</div>
						)}
						{touched.rearToe && errors.rearToe && (
							<div className="event-form__field-error">
								{errors.rearToe}
							</div>
						)}
						<label
							htmlFor="FBar"
							className="event-form__label_inline_half">
							<i className="fas fa-line-height fa-rotate-270" />
							&nbsp; Front Sway Bar
						</label>
						<label
							htmlFor="RBar"
							className="event-form__label_inline_half">
							Rear Sway Bar
						</label>
						<Field
							id="FBar"
							name="FBar"
							type="text"
							className="event-form__field_half"
							onBlur={event => {
								// without handBlure(event) touched.FBar will not work
								handleBlur(event);
								updateCarFormData('FBar', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.FBar && errors.FBar && (
							<div className="event-form__field-error">
								{errors.FBar}
							</div>
						)}
						<Field
							id="RBar"
							name="RBar"
							type="text"
							className="event-form__field_half"
							onBlur={event => {
								// without handBlure(event) touched.RBar will not work
								handleBlur(event);
								updateCarFormData('RBar', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.RBar && errors.RBar && (
							<div className="event-form__field-error">
								{errors.RBar}
							</div>
						)}
						<label
							htmlFor="FRebound"
							className="event-form__label_inline_quarter">
							<i className="far fa-sort-numeric-up-alt" />
							&nbsp; Front Rebound
						</label>
						<label
							htmlFor="RRebound"
							className="event-form__label_inline_quarter">
							Rear Rebound
						</label>
						<label
							htmlFor="FCompression"
							className="event-form__label_inline_quarter">
							Front Compression
						</label>
						<label
							htmlFor="RCompression"
							className="event-form__label_inline_quarter">
							Rear Compression
						</label>
						<Field
							id="FRebound"
							name="FRebound"
							type="text"
							className="event-form__field_quarter"
							onBlur={event => {
								// without handBlure(event) touched.FRebound will not work
								handleBlur(event);
								updateCarFormData('FRebound', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.FRebound && errors.FRebound && (
							<div className="event-form__field-error">
								{errors.FRebound}
							</div>
						)}
						<Field
							id="RRebound"
							name="RRebound"
							type="text"
							className="event-form__field_quarter"
							onBlur={event => {
								// without handBlure(event) touched.RRebound will not work
								handleBlur(event);
								updateCarFormData('RRebound', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.RRebound && errors.RRebound && (
							<div className="event-form__field-error">
								{errors.RRebound}
							</div>
						)}
						<Field
							id="FCompression"
							name="FCompression"
							type="text"
							className="event-form__field_quarter"
							onBlur={event => {
								// without handBlure(event) touched.FCompression will not work
								handleBlur(event);
								updateCarFormData('FCompression', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.FCompression && errors.FCompression && (
							<div className="event-form__field-error">
								{errors.FCompression}
							</div>
						)}
						<Field
							id="RCompression"
							name="RCompression"
							type="text"
							className="event-form__field_quarter"
							onBlur={event => {
								// without handBlure(event) touched.RCompression will not work
								handleBlur(event);
								updateCarFormData('RCompression', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.RCompression && errors.RCompression && (
							<div className="event-form__field-error">
								{errors.RCompression}
							</div>
						)}
						<label htmlFor="note" className="event-form__label">
							<i className="far fa-sticky-note" />
							&nbsp; Note(max: 350 characters)
						</label>
						<Field
							id="note"
							name="note"
							type="text"
							component="textarea"
							rows="5"
							cols="70"
							maxLength="350"
							className="event-form__field_textarea"
							onBlur={event => {
								// without handBlure(event) touched.note will not work
								handleBlur(event);
								updateCarFormData('note', event.target.value);
								setOKLeavePage(false);
							}}
						/>
						{touched.note && errors.note && (
							<div className="event-form__field-error">
								{errors.note}
							</div>
						)}
						<Field
							id="image"
							name="image"
							title="image"
							required={true}
							component={ImageUploader}
							validate={validateImageSize}
							setFieldValue={setFieldValue}
							errorMessage={errors.image ? errors.image : ''}
							onBlur={event => {
								handleBlur(event);
								setOKLeavePage(false);
								// if (event.target.value) {
								// 	setImageOK(false);
								// } else {
								// 	setImageOK(true);
								// }
							}}
							labelStyle="event-form__label"
							inputStyle="event-form__field-select"
							previewStyle="image-upload__preview"
							errorStyle="event-form__field-error"
						/>
						<Button
							type="submit"
							size="medium"
							margin-left="1.5rem"
							disabled={isSubmitting || !isValid}>
							Submit
						</Button>
						<NavigationPrompt
							afterConfirm={() => {
								formContext.setIsInsideForm(false);
								removeCarFormData();
							}}
							// Confirm navigation if going to a path that does not start with current path.
							// We don't want to confirm navigation when OKLeavePage === true and redirect to '/users/auth' due to
							// authentication issue
							when={(crntLocation, nextLocation) => {
								// remove UserRedirectURL from memory
								userAuthContext.setUserRedirectURL(null);
								// OKLeavePage meaning form was not touched yet
								if (OKLeavePage) {
									formContext.setIsInsideForm(false);
									removeCarFormData();
									return false;
								} else {
									// nextLocation.pathname !== '/users/auth' &&  --- adding this line causing state update on an
									// unmounted component issue.  Without it, confirmation modal will pop up
									// always gives the warning, because we want to be able to
									// clear localStorage after confirm
									return (
										!nextLocation ||
										!nextLocation.pathname.startsWith(
											crntLocation.pathname
										)
									);
								}
							}}>
							{({ isActive, onCancel, onConfirm }) => {
								if (isActive) {
									return (
										<PromptModal
											onCancel={onCancel}
											onConfirm={onConfirm}
											contentClass="event-item__modal-content"
											footerClass="event-item__modal-actions"
											error="You sure want to leave? Unsaved data will be lost.">
											{/* render props.children */}
										</PromptModal>
									);
								}
								return (
									<div>
										This is probably an anti-pattern but ya know...
									</div>
								);
							}}
						</NavigationPrompt>
					</Form>
				)}
			</Formik>
		</div>
	);

	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{carForm()}
		</React.Fragment>
	);
};

export default NewCar;
