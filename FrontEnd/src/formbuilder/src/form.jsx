import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import { useParams } from 'react-router-dom';

import Button from '../../shared/components/FormElements/Button';
import { EventEmitter } from 'fbemitter';
import FormValidator from './form-validator';
import FormElements from './form-elements';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import '../scss/form-builder-form.scss';

import { UserAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
const DEBUG = process.env.DEBUG_MODE;

/**
 * <Form /> component. We will call it FormBuilderGenerator
 */

const {
	Image,
	Checkboxes,
	Signature,
	Download,
	Camera,
	ParagraphCheckbox,
	MultipleRadioButtonGroup
} = FormElements;

// This is the technique used to call hook in the class using Render Props.
// https://hellocode.dev/using-hooks-with-classes#render-props
// Make a wrapper function to wrap useHttpClient returns the logics from useHttpClient()
// Later, in render code, we create <HookWrapper /> component and call its props function.
function HookWrapper({ children }) {
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const userAuthContext = useContext(UserAuthContext);
	const userToken = userAuthContext.userToken;
	const eventId = useParams().id;
	return children({
		isLoading,
		error,
		sendRequest,
		clearError,
		userToken,
		eventId
	});
}

export default class ReactForm extends React.Component {
	form;

	// private variable section
	inputs = {};
	answerData;
	// we will assign sendRequest() to sendRQ
	sendRQ;
	userToken;
	eventId;
	fullMessage;
	// end of private variable section

	constructor(props) {
		super(props);
		this.answerData = this._convert(props.answer_data);
		this.emitter = new EventEmitter();
		this.entryId = props.entryId;
		this.editingMode = props.editingMode;
		// this.getNewEntry = newEntry => {
		// 	console.log('75 newEntry = ', newEntry);
		// 	props.getNewEntry(newEntry);
		// };
	}

	getNewEntry(newEntry) {
		if (DEBUG) {
			console.log('75 newEntry = ', newEntry);
		}
		this.props.getNewEntry(newEntry);
	}

	// convert provided answers
	_convert(answers) {
		if (DEBUG) {
			console.log('_convert ');
		}
		if (Array.isArray(answers)) {
			const result = {};
			answers.forEach(x => {
				if (x.name.indexOf('tags_') > -1) {
					result[x.name] = x.value.map(y => y.value);
				} else {
					result[x.name] = x.value;
				}
			});
			return result;
		}
		return answers;
	}

	_getDefaultValue(item) {
		if (DEBUG) {
			console.log('_getDefaultValue ');
		}
		if (item.field_name && this.answerData) {
			return this.answerData[item.field_name];
		}
		return null;
	}

	// get default values for Checkboxes and Paragraphcheckbox
	_optionsDefaultValue(item) {
		if (DEBUG) {
			console.log('_optionsDefaultValue ');
		}
		const defaultValue = this._getDefaultValue(item);
		if (defaultValue) {
			return defaultValue;
		}

		const defaultChecked = [];
		item.options.forEach(option => {
			if (
				this.answerData &&
				this.answerData[`option_${option.key}`]
			) {
				defaultChecked.push(option.key);
			}
		});
		return defaultChecked;
	}

	_getItemValue(item, ref) {
		if (DEBUG) {
			console.log('_getItemValue ');
		}
		let $item = {
			element: item.element,
			value: ''
		};
		if (item.element === 'Rating') {
			$item.value = ref.inputField.current.state.rating;
		} else if (item.element === 'Tags') {
			$item.value = ref.inputField.current.state.value;
		} else if (item.element === 'DatePicker') {
			$item.value = ref.state.value;
		} else if (item.element === 'Camera') {
			$item.value = ref.state.img
				? ref.state.img.replace('data:image/png;base64,', '')
				: '';
		} else if (ref && ref.inputField) {
			if (DEBUG) {
				console.log('I am in ref & ref.inputField');
			}
			$item = ReactDOM.findDOMNode(ref.inputField.current);
			if (typeof $item.value === 'string') {
				$item.value = $item.value.trim();
			}
		}
		return $item;
	}

	_isIncorrect(item) {
		if (DEBUG) {
			console.log('_isIncorrect ');
		}
		let incorrect = false;
		if (item.canHaveAnswer) {
			const ref = this.inputs[item.field_name];
			if (
				item.element === 'Checkboxes' ||
				item.element === 'RadioButtons' ||
				item.element === 'ParagraphCheckbox' ||
				item.element === 'MultipleRadionButtonGroup'
			) {
				item.options.forEach(option => {
					const $option = ReactDOM.findDOMNode(
						ref.options[`child_ref_${option.key}`]
					);
					if (
						(option.hasOwnProperty('correct') && !$option.checked) ||
						(!option.hasOwnProperty('correct') && $option.checked)
					) {
						incorrect = true;
					}
				});
			} else {
				const $item = this._getItemValue(item, ref);
				if (item.element === 'Rating') {
					if ($item.value.toString() !== item.correct) {
						incorrect = true;
					}
				} else if (
					$item.value.toLowerCase() !==
					item.correct.trim().toLowerCase()
				) {
					incorrect = true;
				}
			}
		}
		return incorrect;
	}

	_isInvalid(item) {
		let invalid = false;
		if (item.required === true) {
			if (
				item.element === 'Checkboxes' ||
				item.element === 'RadioButtons' ||
				item.element === 'ParagraphCheckbox'
			) {
				const ref = this.inputs[item.field_name];
				let checked_options = 0;
				item.options.forEach(option => {
					const $option = ReactDOM.findDOMNode(
						ref.options[`child_ref_${option.key}`]
					);
					if ($option.checked) {
						checked_options += 1;
					}
				});
				if (checked_options < 1) {
					// errors.push(item.label + ' is required!');
					invalid = true;
				}
			} else if (item.element === 'MultipleRadioButtonGroup') {
				if (DEBUG) {
					console.log(
						'MultipleRadioButtonGroup this.inputs = ',
						this.inputs
					);
					console.log('item = ', item);
				}
				// ***** HACK ****** //
				// Becuase we don't have a field_name for parent Group,  so
				// we use item.options[0].field_name to get information.
				// group is the MultipleRadioButtonGroup not the child option
				let group = this.inputs[item.options[0].field_name];
				if (DEBUG) {
					console.log('group = ', group);
				}
				// group.options contains all the children RadioButtons choices
				// group.props.data.options has RadioButons
				// 1. Get each RadioButtons with its ref of choice options
				//    The way to get ref of choices is to get the key
				//    "child_ref_undefined_" + choice key

				// The number of the checked choices must match the number of
				// group.props.data.options
				let checked_options = true;
				group.props.data.options.forEach(option => {
					let optionValid = false;
					if (DEBUG) {
						console.log('option = ', option);
					}
					option.options.forEach(opt => {
						if (DEBUG) {
							console.log('opt.key = ', opt.key);
						}
						// let key = 'child_ref_undefined_' + opt.key;
						let key = 'child_ref_RadioButtons_' + opt.key;
						if (DEBUG) {
							console.log('key = ', key);
							console.log('checked = ', group.options[key].checked);
						}
						optionValid |= group.options[key].checked;
						if (DEBUG) {
							console.log('optionValid = ', optionValid);
						}
					});
					checked_options &= optionValid;
				});

				if (!checked_options) {
					invalid = true;
				}
			} else {
				const ref = this.inputs[item.field_name];
				const $item = this._getItemValue(item, ref);
				if (item.element === 'Rating') {
					if ($item.value === 0) {
						invalid = true;
					}
				} else if (
					$item.value === undefined ||
					$item.value.length < 1
				) {
					invalid = true;
				}
			}
		}
		return invalid;
	}

	_collect(item) {
		let itemDataArray = [];
		if (DEBUG) {
			console.log('_collect ');
		}
		const ref = this.inputs[item.field_name];
		if (
			item.element === 'Checkboxes' ||
			item.element === 'RadioButtons' ||
			item.element === 'ParagraphCheckbox'
		) {
			const itemData = { name: item.field_name };
			if (DEBUG) {
				console.log('_collect item.element = ', item.element);
			}
			const checked_options = [];
			item.options.forEach(option => {
				const $option = ReactDOM.findDOMNode(
					ref.options[`child_ref_${option.key}`]
				);
				if (DEBUG) {
					console.log('$option = ', $option);
					console.log('option = ', option);
					console.log(
						'ref.option[child_ref_${option.key}] = ',
						ref.options[`child_ref_${option.key}`]
					);
				}
				if ($option.checked) {
					checked_options.push(option.key);
				}
			});
			itemData.value = checked_options;
			itemDataArray.push(itemData);
			if (DEBUG) {
				console.log('itemData = ', itemData);
			}
		} else if (item.element === 'MultipleRadioButtonGroup') {
			if (DEBUG) {
				console.log(
					'MultipleRadioButtonGroup this.inputs = ',
					this.inputs
				);
				console.log('item = ', item);
			}
			// ***** HACK ****** //
			// Becuase we don't have a field_name for parent Group,  so
			// we use item.options[0].field_name to get information.
			// group is the MultipleRadioButtonGroup not the child option
			let group = this.inputs[item.options[0].field_name];

			if (DEBUG) {
				console.log('group = ', group);
			}
			// group.options contains all the children RadioButtons choices
			// group.props.data.options has RadioButons
			// 1. Get each RadioButtons with its ref of choice options
			//    The way to get ref of choices is to get the key
			//    "child_ref_undefined_" + choice key

			// The number of the checked choices must match the number of
			// group.props.data.options
			group.props.data.options.forEach(option => {
				let itemData = {};
				let checked_options = [];
				option.options.forEach(opt => {
					if (DEBUG) {
						console.log('I am creating undefined key ');
					}
					let key = 'child_ref_RadioButtons_' + opt.key;
					if (DEBUG) {
						console.log('key = ', key);
					}
					if (group.options[key].checked) {
						checked_options.push(opt.key);
					}
				});
				itemData.name = option.field_name;
				itemData.value = checked_options;
				itemDataArray.push(itemData);
			});
		} else {
			const itemData = { name: item.field_name };
			if (!ref) return null;
			itemData.value = this._getItemValue(item, ref).value;
			itemDataArray.push(itemData);
		}
		return itemDataArray;
	}

	_collectFormData(data) {
		if (DEBUG) {
			console.log('_collectFormData ');
		}
		const formData = [];
		data.forEach(item => {
			const item_data = this._collect(item);
			item_data.map(data => {
				formData.push(data);
			});
			// if (item_data) {
			// 	formData.push(item_data);
			// }
		});
		return formData;
	}

	_getSignatureImg(item) {
		const ref = this.inputs[item.field_name];
		const $canvas_sig = ref.canvas.current;
		if ($canvas_sig) {
			const base64 = $canvas_sig
				.toDataURL()
				.replace('data:image/png;base64,', '');
			const isEmpty = $canvas_sig.isEmpty();
			const $input_sig = ReactDOM.findDOMNode(ref.inputField.current);
			if (isEmpty) {
				$input_sig.value = '';
			} else {
				$input_sig.value = base64;
			}
		}
	}

	async handleSubmit(e) {
		if (DEBUG) {
			console.log('376 responseData.entry');
		}
		e.preventDefault();
		let errors = [];
		if (!this.props.skip_validations) {
			errors = this.validateForm();
			// Publish errors, if any.
			this.emitter.emit('formValidation', errors);
		}

		if (DEBUG) {
			console.log('384 responseData.entry');
		}
		// Only submit if there are no errors.
		if (errors.length < 1) {
			const answer_data = this.props;
			if (answer_data) {
				// send answer_data back to NewEntryManager, we will send to backend all together in Submit tab
				const answer = this._collectFormData(this.props.data);
				// editinMode meaning we are in EditEntryManager
				if (this.editingMode) {
					try {
						if (DEBUG) {
							console.log('393 responseData.entry = ');
						}
						const answer = this._collectFormData(this.props.data);
						// we need to use JSON.stringify to send array objects.
						// FormData with JSON.stringify not working
						let [
							responseData,
							responseStatus,
							responseMessage
						] = await this.sendRQ(
							process.env.REACT_APP_BACKEND_URL +
								`/entries/formAnswer/${this.entryId}`,
							'PATCH',
							JSON.stringify({
								answer: answer
							}),
							{
								'Content-type': 'application/json',
								// adding JWT to header for authentication
								// Authorization: 'Bearer ' + storageData.userToken
								Authorization: 'Bearer ' + this.userToken
							}
						);
						if (DEBUG) {
							console.log('responseMessage = ', responseMessage);
						}
						if (responseStatus === 202) {
							// either group is full or event is full
							this.fullMessage = responseMessage;
						} else {
							// if status is 200, we want to print out Total Price so this is not a fullMessage
							this.fullMessage = 'NO ' + responseMessage;
						}
						if (DEBUG) {
							console.log('this.fullMessage = ', this.fullMessage);
						}
						this.getNewEntry(responseData.entry);
					} catch (err) {}
				} else {
					// this route is for NewEntryManager
					if (DEBUG) {
						console.log('answer = ', answer);
					}
					this.props.returnFormAnswer(answer);
				}
			} else {
				throw new Error('Submit failed. Please select answers.');
			}
		}
	}

	validateForm() {
		if (DEBUG) {
			console.log('validateForm');
		}
		const errors = [];
		let data_items = this.props.data;
		if (this.props.display_short) {
			data_items = this.props.data.filter(
				i => i.alternateForm === true
			);
		}

		data_items.forEach(item => {
			if (DEBUG) {
				console.log('item = ', item);
			}
			if (item.element === 'Signature') {
				this._getSignatureImg(item);
			}

			if (this._isInvalid(item)) {
				errors.push(`${item.label} is required!`);
			}

			if (
				this.props.validateForCorrectness &&
				this._isIncorrect(item)
			) {
				errors.push(`${item.label} was answered incorrectly!`);
			}
		});

		return errors;
	}

	getInputElement(item) {
		if (DEBUG) {
			console.log('getInputElement');
			console.log('item = ', item);
		}
		const Input = FormElements[item.element];
		if (DEBUG) {
			console.log('Input = ', Input);
		}
		return (
			<Input
				handleChange={this.handleChange}
				ref={c => (this.inputs[item.field_name] = c)}
				mutable={true}
				key={`form_${item.id}`}
				data={item}
				read_only={this.props.read_only}
				defaultValue={this._getDefaultValue(item)}
			/>
		);
	}

	_getMultipleInputDefaultValues(item) {
		let answers = [];
		if (DEBUG) {
			console.log('this.answerData = ', this.answerData);
		}
		item.options.forEach(option => {
			let optAnswer = {};
			if (option.field_name && this.answerData) {
				if (this.answerData[option.field_name]) {
					optAnswer[option.field_name] = this.answerData[
						option.field_name
					][0];
					answers.push(optAnswer);
				}
			}
		});
		if (DEBUG) {
			console.log('464 answers = ', answers);
		}
		return answers;
	}

	getMultipleInputElement(item) {
		if (DEBUG) {
			console.log('getMultipleInputElement');
			console.log('item = ', item);
		}
		const Input = FormElements[item.element];

		return (
			<Input
				handleChange={this.handleChange}
				ref={c => (this.inputs[item.options[0].field_name] = c)}
				mutable={true}
				key={`form_${item.id}`}
				data={item}
				read_only={this.props.read_only}
				defaultValue={this._getMultipleInputDefaultValues(item)}
			/>
		);
	}

	getSimpleElement(item) {
		if (DEBUG) {
			console.log('getSimpleElement');
		}
		const Element = FormElements[item.element];
		return (
			<Element mutable={true} key={`form_${item.id}`} data={item} />
		);
	}

	render() {
		let data_items = this.props.data;

		if (!data_items) {
			return;
		}

		if (this.props.display_short) {
			data_items = this.props.data.filter(
				i => i.alternateForm === true
			);
		}

		data_items.forEach(item => {
			if (
				item &&
				item.readOnly &&
				item.variableKey &&
				this.props.variables[item.variableKey]
			) {
				this.answerData[item.field_name] = this.props.variables[
					item.variableKey
				];
			}
		});

		const items = data_items.map(item => {
			if (!item) return null;
			switch (item.element) {
				case 'TextInput':
				case 'NumberInput':
				case 'TextArea':
				case 'Dropdown':
				case 'DatePicker':
				case 'RadioButtons':
				case 'Rating':
				case 'Tags':
				case 'Range':
					return this.getInputElement(item);
				case 'Signature':
					return (
						<Signature
							ref={c => (this.inputs[item.field_name] = c)}
							read_only={this.props.read_only || item.readOnly}
							mutable={true}
							key={`form_${item.id}`}
							data={item}
							defaultValue={this._getDefaultValue(item)}
						/>
					);
				case 'Checkboxes':
					return (
						<Checkboxes
							ref={c => (this.inputs[item.field_name] = c)}
							read_only={this.props.read_only}
							handleChange={this.handleChange}
							mutable={true}
							key={`form_${item.id}`}
							data={item}
							defaultValue={this._optionsDefaultValue(item)}
						/>
					);
				case 'ParagraphCheckbox':
					return (
						<ParagraphCheckbox
							ref={c => (this.inputs[item.field_name] = c)}
							read_only={this.props.read_only}
							handleChange={this.handleChange}
							mutable={true}
							key={`form_${item.id}`}
							data={item}
							defaultValue={this._optionsDefaultValue(item)}
						/>
					);
				case 'MultipleRadioButtonGroup':
					if (DEBUG) {
						console.log('inside MultipleRadioButtonGroup');
						console.log('this.inputs = ', this.inputs);
						console.log('item = ', item);
						console.log('item.id = ', item.id);
					}
					return this.getMultipleInputElement(item);
				case 'Image':
					return (
						<Image
							ref={c => (this.inputs[item.field_name] = c)}
							handleChange={this.handleChange}
							mutable={true}
							key={`form_${item.id}`}
							data={item}
							defaultValue={this._getDefaultValue(item)}
						/>
					);
				case 'Download':
					return (
						<Download
							download_path={this.props.download_path}
							mutable={true}
							key={`form_${item.id}`}
							data={item}
						/>
					);
				case 'Camera':
					return (
						<Camera
							ref={c => (this.inputs[item.field_name] = c)}
							read_only={this.props.read_only || item.readOnly}
							mutable={true}
							key={`form_${item.id}`}
							data={item}
							defaultValue={this._getDefaultValue(item)}
						/>
					);
				default:
					return this.getSimpleElement(item);
			}
		});

		const formTokenStyle = {
			display: 'none'
		};

		const actionName = this.props.action_name
			? this.props.action_name
			: 'Submit';
		const backName = this.props.back_name
			? this.props.back_name
			: 'Cancel';

		return (
			<React.Fragment>
				<div
					style={{
						borderStyle: 'double',
						borderColor: '#a3aeae'
					}}>
					<HookWrapper>
						{({
							isLoading,
							error,
							sendRequest,
							clearError,
							userToken,
							eventId
						}) => {
							// assignments
							this.sendRQ = sendRequest;
							this.userToken = userToken;
							this.eventId = eventId;

							return (
								<React.Fragment>
									{isLoading && (
										<div className="center">
											<LoadingSpinner />
										</div>
									)}
									{error && (
										<ErrorModal error={error} onClear={clearError} />
									)}
								</React.Fragment>
							);
						}}
					</HookWrapper>
					<FormValidator emitter={this.emitter} />
					<div className="react-form-builder-form">
						<form
							encType="multipart/form-data"
							ref={c => (this.form = c)}
							action={this.props.form_action}
							onSubmit={this.handleSubmit.bind(this)}
							method={this.props.form_method}>
							{this.props.authenticity_token && (
								<div style={formTokenStyle}>
									<input name="utf8" type="hidden" value="&#x2713;" />
									<input
										name="authenticity_token"
										type="hidden"
										value={this.props.authenticity_token}
									/>
									<input
										name="task_id"
										type="hidden"
										value={this.props.task_id}
									/>
								</div>
							)}
							{items}
							<div className="btn-toolbar">
								{!this.props.hide_actions && (
									// <input
									// 	type="submit"
									// 	className="btn btn-school btn-big"
									// 	value={actionName}
									// />
									<Button
										type="submit"
										size="medium"
										margin-left="1.5rem">
										{actionName}
									</Button>
								)}

								{!this.props.hide_actions && this.props.back_action && (
									<a
										href={this.props.back_action}
										className="btn btn-default btn-cancel btn-big">
										{backName}
									</a>
								)}
							</div>
							{this.fullMessage &&
								!this.fullMessage.startsWith('NO') && (
									<p
										style={{
											color: 'red'
										}}>
										{' '}
										{this.fullMessage}{' '}
									</p>
								)}
							{this.fullMessage && this.fullMessage.startsWith('NO') && (
								<p
									style={{
										color: 'green'
									}}>
									{' '}
									Your entry is successfully submitted.{' '}
									{this.fullMessage.slice(3)}{' '}
								</p>
							)}
						</form>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

ReactForm.defaultProps = { validateForCorrectness: false };
