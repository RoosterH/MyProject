import React, { useContext } from 'react';
import ReactDOM from 'react-dom';
import { useParams } from 'react-router-dom';

import { EventEmitter } from 'fbemitter';
import FormValidator from './form-validator';
import FormElements from './form-elements';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import '../../shared/scss/form-builder-form.scss';

import { UserAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
/**
 * <Form /> component. We will call it FormBuilderGenerator
 */

const {
	Image,
	Checkboxes,
	Signature,
	Download,
	Camera,
	ParagraphCheckbox
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
	// class form extends React.Component {
	form;

	// private variable section
	inputs = {};
	answerData;
	// we will assign sendRequest() to sendRQ
	sendRQ;
	userToken;
	eventId;
	// end of private variable section

	constructor(props) {
		super(props);
		this.answerData = this._convert(props.answer_data);
		this.emitter = new EventEmitter();
	}

	// convert provided answers
	_convert(answers) {
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
		return this.answerData[item.RadioButtons];
	}

	_optionsDefaultValue(item) {
		const defaultValue = this._getDefaultValue(item);
		if (defaultValue) {
			return defaultValue;
		}

		const defaultChecked = [];
		item.options.forEach(option => {
			if (this.answerData[`option_${option.key}`]) {
				defaultChecked.push(option.key);
			}
		});
		return defaultChecked;
	}

	_getItemValue(item, ref) {
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
			$item = ReactDOM.findDOMNode(ref.inputField.current);
			if (typeof $item.value === 'string') {
				$item.value = $item.value.trim();
			}
		}
		return $item;
	}

	_isIncorrect(item) {
		let incorrect = false;
		if (item.canHaveAnswer) {
			const ref = this.inputs[item.field_name];
			if (
				item.element === 'Checkboxes' ||
				item.element === 'RadioButtons' ||
				item.element === 'ParagraphCheckbox'
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
			const ref = this.inputs[item.field_name];
			if (
				item.element === 'Checkboxes' ||
				item.element === 'RadioButtons' ||
				item.element === 'ParagraphCheckbox'
			) {
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
			} else {
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
		const itemData = { name: item.field_name };
		const ref = this.inputs[item.field_name];
		if (
			item.element === 'Checkboxes' ||
			item.element === 'RadioButtons' ||
			item.element === 'ParagraphCheckbox'
		) {
			const checked_options = [];
			item.options.forEach(option => {
				const $option = ReactDOM.findDOMNode(
					ref.options[`child_ref_${option.key}`]
				);
				if ($option.checked) {
					checked_options.push(option.key);
				}
			});
			itemData.value = checked_options;
		} else {
			if (!ref) return null;
			itemData.value = this._getItemValue(item, ref).value;
		}
		return itemData;
	}

	_collectFormData(data) {
		const formData = [];
		data.forEach(item => {
			const item_data = this._collect(item);
			if (item_data) {
				formData.push(item_data);
			}
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
		e.preventDefault();

		let errors = [];
		if (!this.props.skip_validations) {
			errors = this.validateForm();
			// Publish errors, if any.
			this.emitter.emit('formValidation', errors);
		}

		// Only submit if there are no errors.
		if (errors.length < 1) {
			const answer_data = this.props;
			if (answer_data) {
				try {
					const answer = this._collectFormData(this.props.data);

					// let eventId = '5f2c86bbecd136a29ed14fa8';
					// we need to use JSON.stringify to send array objects.
					// FormData with JSON.stringify not working
					let responseData = await this.sendRQ(
						process.env.REACT_APP_BACKEND_URL +
							`/entries/submit/${this.eventId}`,
						'POST',
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

					if (responseData) {
						console.log('responseData = ', responseData);
					}
				} catch (err) {}
			} else {
				throw new Error('Submit failed. Please select answers.');
			}
		}
	}

	validateForm() {
		const errors = [];
		let data_items = this.props.data;
		if (this.props.display_short) {
			data_items = this.props.data.filter(
				i => i.alternateForm === true
			);
		}

		data_items.forEach(item => {
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
		const Input = FormElements[item.element];
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

	getSimpleElement(item) {
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

							// reason to have this condition is we need to return something meaningful at the end of the
							// React component
							if (!isLoading) {
								return <div></div>;
							}

							if (error) {
								return (
									<ErrorModal error={error} onClear={clearError} />
								);
							}

							return (
								<div className="center">
									<LoadingSpinner />
								</div>
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
									<input
										type="submit"
										className="btn btn-school btn-big"
										value={actionName}
									/>
								)}
								{!this.props.hide_actions && this.props.back_action && (
									<a
										href={this.props.back_action}
										className="btn btn-default btn-cancel btn-big">
										{backName}
									</a>
								)}
							</div>
						</form>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

ReactForm.defaultProps = { validateForCorrectness: false };
