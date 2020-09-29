/**
 * <DynamicOptionList />
 */

import React from 'react';
import ID from './UUID';

export default class DynamicOptionList extends React.Component {
	constructor(props) {
		super(props);
		console.log('this.props = ', this.props);
		this.state = {
			element: this.props.element,
			data: this.props.data,
			dirty: false,
			parent: this.props.parent
		};
	}

	_setValue(text) {
		return text.replace(/[^A-Z0-9]+/gi, '_').toLowerCase();
	}

	editOption(option_index, e) {
		console.log('I am in editOption');
		const this_element = this.state.element;
		const val =
			this_element.options[option_index].value !==
			this._setValue(this_element.options[option_index].text)
				? this_element.options[option_index].value
				: this._setValue(e.target.value);

		this_element.options[option_index].text = e.target.value;
		this_element.options[option_index].value = val;
		this.setState({
			element: this_element,
			dirty: true
		});
	}

	editValue(option_index, e) {
		console.log('I am in editValue');
		const this_element = this.state.element;
		const val =
			e.target.value === ''
				? this._setValue(this_element.options[option_index].text)
				: e.target.value;
		this_element.options[option_index].value = val;
		this.setState({
			element: this_element,
			dirty: true
		});
	}

	// eslint-disable-next-line no-unused-vars
	editOptionCorrect(option_index, e) {
		console.log('I am in editOptionCorrect');
		const this_element = this.state.element;
		console.log(
			'this_element.options[option_index] = ',
			this_element.options[option_index]
		);
		if (
			this_element.options[option_index].hasOwnProperty('correct')
		) {
			delete this_element.options[option_index].correct;
		} else {
			this_element.options[option_index].correct = true;
		}
		console.log('dynamic-option-list this_elemnt = ', this_element);
		this.setState({ element: this_element });

		this.props.updateElement.call(this.props.preview, this_element);
	}

	updateOption() {
		console.log('I am in updateOption');
		const this_element = this.state.element;
		// to prevent ajax calls with no change
		if (this.state.dirty) {
			console.log('in dirty');
			console.log('this.props.preview = ', this.props.preview);
			console.log('this_element = ', this_element);
			console.log('this.props.parent = ', this.props.parent);
			//this.props.updateElement.call(this.props.preview, this_element);
			this.props.updateElement.call(
				this.props.preview,
				this.props.parent
			);
			this.setState({ dirty: false });
		}
	}

	addOption(index) {
		console.log('I am in addOption');
		console.log('index = ', index);
		console.log('element = ', this.state.element.options[0].key);
		console.log('this.props = ', this.props);
		let optionsLength = this.state.element.options.length;
		let key;
		if (this.state.element.options[0].key.split('_').length > 0) {
			let optionKey = this.state.element.options[0].key;
			let optionName = optionKey.split('_')[0];
			key = optionName + '_' + ID.uuid();
			console.log('key = ', key);
		}

		const this_element = this.state.element;
		this_element.options.splice(index + 1, 0, {
			value: '',
			text: '',
			key: key ? key : ID.uuid()
		});
		this.props.updateElement.call(this.props.preview, this_element);
	}

	removeOption(index) {
		console.log('I am in removeOption');
		console.log('remove index = ', index);
		const this_element = this.state.element;
		this_element.options.splice(index, 1);
		this.props.updateElement.call(this.props.preview, this_element);
	}

	render() {
		if (this.state.dirty) {
			this.state.element.dirty = true;
		}
		return (
			<div className="dynamic-option-list">
				<ul>
					<li>
						<div className="row">
							<div className="col-sm-6">
								<b>Options</b>
							</div>
							{this.props.canHaveOptionValue && (
								<div className="col-sm-2">
									<b>Value</b>
								</div>
							)}
							{/* {this.props.canHaveOptionValue &&
								this.props.canHaveOptionCorrect && (
									<div className="col-sm-4">
										<b>Correct</b>
									</div>
								)} */}
						</div>
					</li>
					{this.props.element.options.map((option, index) => {
						// this is the place that handles adding options: [ ]
						console.log('option = ', option);
						console.log('index = ', index);
						const this_key = `edit_${option.key}`;
						const val =
							option.value !== this._setValue(option.text)
								? option.value
								: '';
						return (
							<li className="clearfix" key={this_key}>
								<div className="row">
									<div className="col-sm-6">
										<input
											tabIndex={index + 1}
											className="form-control"
											style={{ width: '100%' }}
											type="text"
											name={`text_${index}`}
											placeholder="Option text"
											value={option.text}
											onBlur={this.updateOption.bind(this)}
											onChange={this.editOption.bind(this, index)}
										/>
									</div>
									{this.props.canHaveOptionValue && (
										<div className="col-sm-2">
											<input
												className="form-control"
												type="text"
												name={`value_${index}`}
												value={val}
												onChange={this.editValue.bind(this, index)}
											/>
										</div>
									)}
									{/* {this.props.canHaveOptionValue &&
										this.props.canHaveOptionCorrect && (
											<div className="col-sm-1">
												<input
													className="form-control"
													type="checkbox"
													value="1"
													onChange={this.editOptionCorrect.bind(
														this,
														index
													)}
													checked={option.hasOwnProperty('correct')}
												/>
											</div>
										)} */}
									<div className="col-sm-3">
										<div className="dynamic-options-actions-buttons">
											<button
												onClick={this.addOption.bind(this, index)}
												className="btn btn-success">
												<i className="fas fa-plus-circle"></i>
											</button>
											{index > 0 && (
												<button
													onClick={this.removeOption.bind(
														this,
														index
													)}
													className="btn btn-danger">
													<i className="fas fa-minus-circle"></i>
												</button>
											)}
										</div>
									</div>
								</div>
							</li>
						);
					})}
				</ul>
			</div>
		);
	}
}
