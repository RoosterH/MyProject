// eslint-disable-next-line max-classes-per-file
import React from 'react';
import Select from 'react-select';
import xss from 'xss';
import { format, parse } from 'date-fns';
// import moment from 'moment';
import SignaturePad from 'react-signature-canvas';
import ReactBootstrapSlider from 'react-bootstrap-slider';
import ReactDatePicker from 'react-datepicker';
import StarRating from './star-rating';
import HeaderBar from './header-bar';

import './form-elements.css';

const DEBUG = process.env.DEBUG_MODE;
const FormElements = {};
const myxss = new xss.FilterXSS({
	whiteList: {
		u: [],
		br: [],
		b: [],
		i: [],
		ol: ['style'],
		ul: ['style'],
		li: [],
		p: ['style'],
		sub: [],
		sup: [],
		div: ['style'],
		em: [],
		strong: [],
		span: ['style']
	}
});

const ComponentLabel = props => {
	// This displays component label on the Form as well as "Requred" label
	const hasRequiredLabel =
		props.data.hasOwnProperty('required') &&
		props.data.required === true &&
		!props.read_only;

	return (
		<label className={props.className || ''}>
			<span
				className={props.spanClassName || ''}
				dangerouslySetInnerHTML={{
					__html: myxss.process(props.data.label)
				}}
			/>
			{hasRequiredLabel && (
				<span className="label-required badge badge-danger">
					Required
				</span>
			)}
		</label>
	);
};

const GroupComponentLabel = props => {
	if (DEBUG) {
		console.log('group props = ', props);
	}
	// This displays group option label on the Form
	return (
		<label className={props.className || ''}>
			<span
				className={props.spanClassName || ''}
				dangerouslySetInnerHTML={{
					__html: myxss.process(props.props.label)
				}}
			/>
		</label>
	);
};

const ComponentHeader = props => {
	if (props.mutable) {
		return null;
	}
	if (DEBUG) {
		console.log('ComponentHeader props = ', props);
	}
	return (
		<div>
			{props.data.pageBreakBefore && (
				<div className="preview-page-break">Page Break</div>
			)}
			<HeaderBar
				parent={props.parent}
				editModeOn={props.editModeOn}
				data={props.data}
				onDestroy={props._onDestroy}
				onEdit={props.onEdit}
				static={props.data.static}
				required={props.data.required}
			/>
		</div>
	);
};

class Header extends React.Component {
	render() {
		// const headerClasses = `dynamic-input ${this.props.data.element}-input`;
		let classNames = 'static';
		if (this.props.data.bold) {
			classNames += ' bold';
		}
		if (this.props.data.italic) {
			classNames += ' italic';
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<h3
					className={classNames}
					dangerouslySetInnerHTML={{
						__html: myxss.process(this.props.data.content)
					}}
				/>
			</div>
		);
	}
}

class Paragraph extends React.Component {
	render() {
		let classNames = 'static';
		if (this.props.data.bold) {
			classNames += ' bold';
		}
		if (this.props.data.italic) {
			classNames += ' italic';
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<p
					className={classNames}
					dangerouslySetInnerHTML={{
						__html: myxss.process(this.props.data.content)
					}}
				/>
			</div>
		);
	}
}

class Label extends React.Component {
	render() {
		let classNames = 'static';
		if (this.props.data.bold) {
			classNames += ' bold';
		}
		if (this.props.data.italic) {
			classNames += ' italic';
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<label
					className={classNames}
					dangerouslySetInnerHTML={{
						__html: myxss.process(this.props.data.content)
					}}
				/>
			</div>
		);
	}
}

class LineBreak extends React.Component {
	render() {
		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<hr />
			</div>
		);
	}
}

class TextInput extends React.Component {
	constructor(props) {
		super(props);
		this.inputField = React.createRef();
	}

	render() {
		const props = {};
		props.type = 'text';
		props.className = 'form-control';
		props.name = this.props.data.field_name;
		if (this.props.mutable) {
			props.defaultValue = this.props.defaultValue;
			props.ref = this.inputField;
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		if (this.props.read_only) {
			props.disabled = 'disabled';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<ComponentLabel {...this.props} />
					<input {...props} />
				</div>
			</div>
		);
	}
}

class NumberInput extends React.Component {
	constructor(props) {
		super(props);
		this.inputField = React.createRef();
	}

	render() {
		const props = {};
		props.type = 'number';
		props.className = 'form-control';
		props.name = this.props.data.field_name;

		if (this.props.mutable) {
			props.defaultValue = this.props.defaultValue;
			props.ref = this.inputField;
		}

		if (this.props.read_only) {
			props.disabled = 'disabled';
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<ComponentLabel {...this.props} />
					<input {...props} />
				</div>
			</div>
		);
	}
}

class TextArea extends React.Component {
	constructor(props) {
		super(props);
		this.inputField = React.createRef();
	}

	render() {
		const props = {};
		props.className = 'form-control';
		props.name = this.props.data.field_name;

		if (this.props.read_only) {
			props.disabled = 'disabled';
		}

		if (this.props.mutable) {
			props.defaultValue = this.props.defaultValue;
			props.ref = this.inputField;
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<ComponentLabel {...this.props} />
					<textarea {...props} />
				</div>
			</div>
		);
	}
}

class DatePicker extends React.Component {
	constructor(props) {
		super(props);
		this.inputField = React.createRef();

		this.updateFormat(props);
		this.state = this.updateDateTime(props, this.formatMask);
	}

	formatMask = '';

	handleChange = dt => {
		let placeholder;
		if (dt && dt.target) {
			placeholder =
				dt && dt.target && dt.target.value === ''
					? this.formatMask.toLowerCase()
					: '';
			const formattedDate = dt.target.value
				? format(dt.target.value, this.formatMask)
				: '';
			this.setState({
				value: formattedDate,
				internalValue: formattedDate,
				placeholder
			});
		} else {
			this.setState({
				value: dt ? format(dt, this.formatMask) : '',
				internalValue: dt,
				placeholder
			});
		}
	};

	updateFormat(props) {
		const { showTimeSelect, showTimeSelectOnly } = props.data;
		const dateFormat =
			showTimeSelect && showTimeSelectOnly
				? ''
				: props.data.dateFormat;
		const timeFormat = showTimeSelect ? props.data.timeFormat : '';
		const formatMask = `${dateFormat} ${timeFormat}`.trim();
		const updated = formatMask !== this.formatMask;
		this.formatMask = formatMask;
		return updated;
	}

	updateDateTime(props, formatMask) {
		let value;
		let internalValue;
		const { defaultToday } = props.data;
		if (
			defaultToday &&
			(props.defaultValue === '' || props.defaultValue === undefined)
		) {
			value = format(new Date(), formatMask);
			internalValue = new Date();
		} else {
			value = props.defaultValue;

			if (value === '' || value === undefined) {
				internalValue = undefined;
			} else {
				internalValue = parse(value, this.formatMask, new Date());
			}
		}
		return {
			value,
			internalValue,
			placeholder: formatMask.toLowerCase(),
			defaultToday
		};
	}

	componentWillReceiveProps(props) {
		const formatUpdated = this.updateFormat(props);
		if (
			props.data.defaultToday !== !this.state.defaultToday ||
			formatUpdated
		) {
			const state = this.updateDateTime(props, this.formatMask);
			this.setState(state);
		}
	}

	render() {
		const { showTimeSelect, showTimeSelectOnly } = this.props.data;
		const props = {};
		props.type = 'date';
		props.className = 'form-control';
		props.name = this.props.data.field_name;
		const readOnly = this.props.data.readOnly || this.props.read_only;
		const iOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) &&
			!window.MSStream;
		const placeholderText = this.formatMask.toLowerCase();

		if (this.props.mutable) {
			props.defaultValue = this.props.defaultValue;
			props.ref = this.inputField;
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<ComponentLabel {...this.props} />
					<div>
						{readOnly && (
							<input
								type="text"
								name={props.name}
								ref={props.ref}
								readOnly={readOnly}
								placeholder={this.state.placeholder}
								value={this.state.value}
								className="form-control"
							/>
						)}
						{iOS && !readOnly && (
							<input
								type="date"
								name={props.name}
								ref={props.ref}
								onChange={this.handleChange}
								dateFormat="MM/DD/YYYY"
								placeholder={this.state.placeholder}
								value={this.state.value}
								className="form-control"
							/>
						)}
						{!iOS && !readOnly && (
							<ReactDatePicker
								name={props.name}
								ref={props.ref}
								onChange={this.handleChange}
								selected={this.state.internalValue}
								todayButton={'Today'}
								className="form-control"
								isClearable={true}
								showTimeSelect={showTimeSelect}
								showTimeSelectOnly={showTimeSelectOnly}
								dateFormat={this.formatMask}
								placeholderText={placeholderText}
							/>
						)}
					</div>
				</div>
			</div>
		);
	}
}

class Dropdown extends React.Component {
	constructor(props) {
		super(props);
		this.inputField = React.createRef();
	}

	render() {
		const props = {};
		props.className = 'form-control';
		props.name = this.props.data.field_name;

		if (this.props.mutable) {
			props.defaultValue = this.props.defaultValue;
			props.ref = this.inputField;
		}

		if (this.props.read_only) {
			props.disabled = 'disabled';
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<ComponentLabel {...this.props} />
					<select {...props}>
						{this.props.data.options.map(option => {
							const this_key = `preview_${option.key}`;
							return (
								<option value={option.value} key={this_key}>
									{option.text}
								</option>
							);
						})}
					</select>
				</div>
			</div>
		);
	}
}

class Signature extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			defaultValue: props.defaultValue
		};
		this.inputField = React.createRef();
		this.canvas = React.createRef();
	}

	clear = () => {
		if (this.state.defaultValue) {
			this.setState({ defaultValue: '' });
		} else if (this.canvas.current) {
			this.canvas.current.clear();
		}
	};

	render() {
		const { defaultValue } = this.state;
		let canClear = !!defaultValue;
		const props = {};
		props.type = 'hidden';
		props.name = this.props.data.field_name;

		if (this.props.mutable) {
			props.defaultValue = defaultValue;
			props.ref = this.inputField;
		}
		const pad_props = {};
		// umd requires canvasProps={{ width: 400, height: 150 }}
		if (this.props.mutable) {
			pad_props.defaultValue = defaultValue;
			pad_props.ref = this.canvas;
			canClear = !this.props.read_only;
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		let sourceDataURL;
		if (defaultValue && defaultValue.length > 0) {
			sourceDataURL = `data:image/png;base64,${defaultValue}`;
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<ComponentLabel {...this.props} />
					{this.props.read_only === true || !!sourceDataURL ? (
						<img src={sourceDataURL} alt={props.name} />
					) : (
						<SignaturePad {...pad_props} />
					)}
					{canClear && (
						<i
							className="fas fa-times clear-signature"
							onClick={this.clear}
							title="Clear Signature"></i>
					)}
					<input {...props} />
				</div>
			</div>
		);
	}
}

class Tags extends React.Component {
	constructor(props) {
		super(props);
		this.inputField = React.createRef();
		const { defaultValue, data } = props;
		this.state = {
			value: this.getDefaultValue(defaultValue, data.options)
		};
	}

	getDefaultValue(defaultValue, options) {
		if (defaultValue) {
			if (typeof defaultValue === 'string') {
				const vals = defaultValue.split(',').map(x => x.trim());
				return options.filter(x => vals.indexOf(x.value) > -1);
			}
			return options.filter(x => defaultValue.indexOf(x.value) > -1);
		}
		return [];
	}

	// state = { value: this.props.defaultValue !== undefined ? this.props.defaultValue.split(',') : [] };

	handleChange = e => {
		this.setState({ value: e });
	};

	render() {
		const options = this.props.data.options.map(option => {
			option.label = option.text;
			return option;
		});
		const props = {};
		props.isMulti = true;
		props.name = this.props.data.field_name;
		props.onChange = this.handleChange;

		props.options = options;
		if (!this.props.mutable) {
			props.value = options[0].text;
		} // to show a sample of what tags looks like
		if (this.props.mutable) {
			props.isDisabled = this.props.read_only;
			props.value = this.state.value;
			props.ref = this.inputField;
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<ComponentLabel {...this.props} />
					<Select {...props} />
				</div>
			</div>
		);
	}
}

class Checkboxes extends React.Component {
	constructor(props) {
		super(props);
		this.options = {};
	}

	render() {
		const self = this;
		let classNames = 'custom-control custom-checkbox';
		if (this.props.data.inline) {
			classNames += ' option-inline';
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<ComponentLabel className="form-label" {...this.props} />
					{this.props.data.options.map(option => {
						const this_key = `preview_${option.key}`;
						const props = {};
						props.name = `option_${option.key}`;

						props.type = 'checkbox';
						props.value = option.value;
						if (self.props.mutable) {
							props.defaultChecked =
								self.props.defaultValue !== undefined &&
								self.props.defaultValue.indexOf(option.key) > -1;
						}
						if (this.props.read_only) {
							props.disabled = 'disabled';
						}
						return (
							<div className={classNames} key={this_key}>
								<input
									id={'fid_' + this_key}
									className="custom-control-input"
									ref={c => {
										if (c && self.props.mutable) {
											self.options[`child_ref_${option.key}`] = c;
										}
									}}
									{...props}
								/>
								<label
									className="custom-control-label"
									htmlFor={'fid_' + this_key}>
									{option.text}
								</label>
							</div>
						);
					})}
				</div>
			</div>
		);
	}
}

class RadioButtons extends React.Component {
	constructor(props) {
		super(props);
		this.options = {};
	}

	render() {
		const self = this;
		let classNames = 'custom-control custom-radio';
		if (this.props.data.inline) {
			classNames += ' option-inline';
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<ComponentLabel className="form-label" {...this.props} />
					{this.props.data.options.map(option => {
						const this_key = `preview_${option.key}`;
						const props = {};
						props.name = self.props.data.field_name;
						props.type = 'radio';
						props.value = option.value;
						if (DEBUG) {
							console.log('radio mutable = ', self.props.mutable);
							console.log('radio props = ', self.props);
						}
						if (self.props.mutable) {
							props.defaultChecked =
								self.props.defaultValue !== null &&
								self.props.defaultValue !== undefined &&
								(self.props.defaultValue.indexOf(option.key) > -1 ||
									self.props.defaultValue.indexOf(option.value) > -1);
						}
						if (this.props.read_only) {
							props.disabled = 'disabled';
						}

						return (
							<div className={classNames} key={this_key}>
								<input
									id={'fid_' + this_key}
									className="custom-control-input"
									ref={c => {
										if (c && self.props.mutable) {
											if (DEBUG) {
												console.log('Radio c = ', c);
												console.log('self.options = ', self.options);
											}
											self.options[`child_ref_${option.key}`] = c;
										}
									}}
									{...props}
								/>
								<label
									className="custom-control-label"
									htmlFor={'fid_' + this_key}>
									{option.text}
								</label>
							</div>
						);
					})}
				</div>
			</div>
		);
	}
}

class Image extends React.Component {
	render() {
		const style = this.props.data.center
			? { textAlign: 'center' }
			: null;

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses} style={style}>
				{!this.props.mutable && (
					<HeaderBar
						parent={this.props.parent}
						editModeOn={this.props.editModeOn}
						data={this.props.data}
						onDestroy={this.props._onDestroy}
						onEdit={this.props.onEdit}
						required={this.props.data.required}
					/>
				)}
				{this.props.data.src && (
					<img
						src={this.props.data.src}
						width={this.props.data.width}
						height={this.props.data.height}
						alt={this.props.name}
					/>
				)}
				{!this.props.data.src && (
					<div className="no-image">No Image</div>
				)}
			</div>
		);
	}
}

class Rating extends React.Component {
	constructor(props) {
		super(props);
		this.inputField = React.createRef();
	}

	render() {
		const props = {};
		props.name = this.props.data.field_name;
		props.ratingAmount = 5;

		if (this.props.mutable) {
			props.rating =
				this.props.defaultValue !== null &&
				this.props.defaultValue !== undefined
					? parseFloat(this.props.defaultValue, 10)
					: 0;
			props.editing = true;
			props.disabled = this.props.read_only;
			props.ref = this.inputField;
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<ComponentLabel {...this.props} />
					<StarRating {...props} />
				</div>
			</div>
		);
	}
}

class HyperLink extends React.Component {
	render() {
		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<a
						target="_blank"
						href={this.props.data.href}
						rel="noopener noreferrer">
						{this.props.data.content}
					</a>
				</div>
			</div>
		);
	}
}

class Download extends React.Component {
	render() {
		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<a
						href={`${this.props.download_path}?id=${this.props.data.file_path}`}>
						{this.props.data.content}
					</a>
				</div>
			</div>
		);
	}
}

class Camera extends React.Component {
	constructor(props) {
		super(props);
		this.state = { img: null };
	}

	displayImage = e => {
		const self = this;
		const target = e.target;
		let file;
		let reader;

		if (target.files && target.files.length) {
			file = target.files[0];
			// eslint-disable-next-line no-undef
			reader = new FileReader();
			reader.readAsDataURL(file);

			reader.onloadend = () => {
				self.setState({
					img: reader.result
				});
			};
		}
	};

	clearImage = () => {
		this.setState({
			img: null
		});
	};

	render() {
		let baseClasses = 'SortableItem rfb-item';
		const name = this.props.data.field_name;
		const fileInputStyle = this.state.img
			? { display: 'none' }
			: null;
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}
		let sourceDataURL;
		if (
			this.props.read_only === true &&
			this.props.defaultValue &&
			this.props.defaultValue.length > 0
		) {
			if (this.props.defaultValue.indexOf(name > -1)) {
				sourceDataURL = this.props.defaultValue;
			} else {
				sourceDataURL = `data:image/png;base64,${this.props.defaultValue}`;
			}
		}
		if (DEBUG) {
			console.log('sourceDataURL', sourceDataURL);
		}
		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<ComponentLabel {...this.props} />
					{this.props.read_only === true &&
					this.props.defaultValue &&
					this.props.defaultValue.length > 0 ? (
						<div>
							<img src={sourceDataURL} alt={this.props.name} />
						</div>
					) : (
						<div className="image-upload-container">
							<div style={fileInputStyle}>
								<input
									name={name}
									type="file"
									accept="image/*"
									capture="camera"
									className="image-upload"
									onChange={this.displayImage}
								/>
								<div className="image-upload-control">
									<div className="btn btn-default btn-school">
										<i className="fas fa-camera"></i> Upload Photo
									</div>
									<p>Select an image from your computer or device.</p>
								</div>
							</div>

							{this.state.img && (
								<div>
									<img
										src={this.state.img}
										height="100"
										className="image-upload-preview"
										alt={this.props.name}
									/>
									<br />
									<div
										className="btn btn-school btn-image-clear"
										onClick={this.clearImage}>
										<i className="fas fa-times"></i> Clear Photo
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		);
	}
}

class Range extends React.Component {
	constructor(props) {
		super(props);
		this.inputField = React.createRef();
		this.state = {
			value:
				props.defaultValue !== null &&
				props.defaultValue !== undefined
					? parseInt(props.defaultValue, 10)
					: parseInt(props.data.default_value, 10)
		};
	}

	changeValue = e => {
		const { target } = e;
		this.setState({
			value: target.value
		});
	};

	render() {
		const props = {};
		const name = this.props.data.field_name;

		props.type = 'range';
		props.list = `tickmarks_${name}`;
		props.min = this.props.data.min_value;
		props.max = this.props.data.max_value;
		props.step = this.props.data.step;

		props.value = this.state.value;
		props.change = this.changeValue;

		if (this.props.mutable) {
			props.ref = this.inputField;
		}

		const datalist = [];
		for (
			let i = parseInt(props.min_value, 10);
			i <= parseInt(props.max_value, 10);
			i += parseInt(props.step, 10)
		) {
			datalist.push(i);
		}

		const oneBig = 100 / (datalist.length - 1);

		const _datalist = datalist.map((d, idx) => (
			<option key={`${props.list}_${idx}`}>{d}</option>
		));

		const visible_marks = datalist.map((d, idx) => {
			const option_props = {};
			let w = oneBig;
			if (idx === 0 || idx === datalist.length - 1) {
				w = oneBig / 2;
			}
			option_props.key = `${props.list}_label_${idx}`;
			option_props.style = { width: `${w}%` };
			if (idx === datalist.length - 1) {
				option_props.style = { width: `${w}%`, textAlign: 'right' };
			}
			return <label {...option_props}>{d}</label>;
		});

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}

		return (
			<div className={baseClasses}>
				<ComponentHeader {...this.props} />
				<div className="form-group">
					<ComponentLabel {...this.props} />
					<div className="range">
						<div className="clearfix">
							<span className="float-left">
								{this.props.data.min_label}
							</span>
							<span className="float-right">
								{this.props.data.max_label}
							</span>
						</div>
						<ReactBootstrapSlider {...props} />
					</div>
					<div className="visible_marks">{visible_marks}</div>
					<input name={name} value={this.state.value} type="hidden" />
					<datalist id={props.list}>{_datalist}</datalist>
				</div>
			</div>
		);
	}
}

class ParagraphCheckbox extends React.Component {
	constructor(props) {
		super(props);
		this.options = {};
		this.inputField = React.createRef();
	}

	render() {
		// Start of Header and Paragaph section
		// Discard the warning message saying classNames is never used.  It is used in {...this.props}
		let classNames = 'static';
		if (this.props.data.bold) {
			classNames += ' bold';
		}
		if (this.props.data.italic) {
			classNames += ' italic';
		}
		// End of Header and Paragaph section

		// Start of Checkbox section
		const self = this;
		let checkboxClassNames = 'custom-control custom-checkbox';
		if (this.props.data.inline) {
			checkboxClassNames += ' option-inline';
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}
		// End of Checkbox section

		return (
			<React.Fragment>
				<div className={baseClasses}>
					<ComponentHeader {...this.props} />
					<ComponentLabel
						spanClassName="paragraphcheckbox_lable"
						{...this.props}
					/>
					<p
						className="paragraphcheckbox_content"
						dangerouslySetInnerHTML={{
							__html: myxss.process(this.props.data.content)
						}}
					/>
					<div className="form-group">
						{this.props.data.options.map(option => {
							const this_key = `preview_${option.key}`;
							const props = {};
							props.name = `option_${option.key}`;

							props.type = 'checkbox';
							props.value = option.value;
							if (self.props.mutable) {
								props.defaultChecked =
									self.props.defaultValue !== null &&
									self.props.defaultValue !== undefined &&
									self.props.defaultValue.indexOf(option.key) > -1;
							}
							if (this.props.read_only) {
								props.disabled = 'disabled';
							}
							return (
								<div className={checkboxClassNames} key={this_key}>
									<input
										id={'fid_' + this_key}
										className="custom-control-input"
										ref={c => {
											if (c && self.props.mutable) {
												self.options[`child_ref_${option.key}`] = c;
											}
										}}
										{...props}
									/>
									<label
										className="custom-control-label"
										htmlFor={'fid_' + this_key}>
										{option.text}
									</label>
								</div>
							);
						})}
					</div>
				</div>
			</React.Fragment>
		);
	}
}

class MultipleRadioButtonGroup extends React.Component {
	constructor(props) {
		super(props);
		this.options = {};
		if (DEBUG) {
			console.log('props.defaultValue = ', props.defaultValue);
		}

		this.defaultValue = {};

		// defaultValue is only available when we are loading user answers
		if (props.defaultValue) {
			props.defaultValue.map(option => {
				let key = Object.keys(option);
				this.defaultValue[key] = option[key];
			});
		}
		if (DEBUG) {
			console.log('this.defaultValue = ', this.defaultValue);
			// this.options.options = {};
			// this.inputField = React.createRef();
			console.log('props = ', props);
			console.log('1209 this.options = ', this.options);
		}
	}

	render() {
		// Header Section
		// const headerClasses = `dynamic-input ${this.props.data.element}-input`;
		let classNames = 'static';
		if (this.props.data.bold) {
			classNames += ' bold';
		}
		if (this.props.data.italic) {
			classNames += ' italic';
		}

		const self = this;
		classNames = 'custom-control custom-radio';
		if (this.props.data.inline) {
			classNames += ' option-inline';
		}

		let baseClasses = 'SortableItem rfb-item';
		if (this.props.data.pageBreakBefore) {
			baseClasses += ' alwaysbreak';
		}
		if (DEBUG) {
			console.log(
				'this.props.data.options = ',
				this.props.data.options
			);
			console.log(
				'this.props.data.content = ',
				this.props.data.content
			);
		}
		return (
			<React.Fragment>
				<div className={baseClasses}>
					<ComponentHeader {...this.props} />
					{/* this is when hovering on top of the item, it shows "Lunch Selection" which
					comes from name: */}
					<h3
						className={classNames}
						dangerouslySetInnerHTML={{
							__html: myxss.process(this.props.data.content)
						}}
					/>
					<div className="form-group">
						{/* Label for the Group  */}
						<ComponentLabel className="form-label" {...this.props} />
						{this.props.data.options.map((option, index) => {
							if (DEBUG) {
								console.log('option = ', option);
							}
							// To create form we will use key, to regenerate form we will use field_name.
							const this_key = option.key
								? `preview_${option.key}`
								: `preview_${option.field_name}`;
							if (DEBUG) {
								console.log('this_key = ', this_key);
							}
							const props = {};
							// props.name = self.props.data.field_name;
							props.name = option.field_name;
							props.type = 'radio';
							props.value = option.value;
							if (self.props.mutable) {
								props.defaultChecked =
									self.props.defaultValue !== null &&
									self.props.defaultValue !== undefined &&
									(self.props.defaultValue.indexOf(option.key) > -1 ||
										self.props.defaultValue.indexOf(option.value) >
											-1);
							}
							if (this.props.read_only) {
								props.disabled = 'disabled';
							}
							return (
								// need to have key for distinct <div> because of map
								<div className="form-group" key={props.name}>
									{/* label for each option under group */}
									<GroupComponentLabel
										className="form-label"
										props={option}
									/>
									<div className={classNames}>
										{/* <input
											id={'fid_' + this_key}
											className="custom-control-input"
											ref={c => {
												if (c && self.props.mutable) {
													self.options[`child_ref_${option.key}`] = c;
													self.options[
														`child_ref_${option.key}`
													].options = {};
												}
											}}
											{...props}
										/> */}
										{/* rendering Radio Button Choice Options */}
										{option.options.map((opt, index) => {
											// this_key = preview_lunchRadioOption_1
											const this_key = `preview_${opt.key}`;
											if (DEBUG) {
												console.log('this_key 1305 = ', this_key);
											}
											const props = {};
											props.name = option.field_name;
											props.type = 'radio';
											props.value = opt.value;
											if (DEBUG) {
												console.log('self.props = ', self.props);
												console.log('1312 props.name = ', props.name);
												console.log('opt = ', opt);
												console.log('props.value = ', opt.value);
											}

											// self.props => "MultipleRadioButtonGroup" big component information
											// props.name = "Lunch2-8FA19AEA-7166-4CDC-8463-4150B1F56941"
											// opt = {value: "1", text: "Hamburger $1", key: "lunchRadioOption2_0"}
											if (self.props.mutable) {
												if (DEBUG) {
													console.log('mutable true');
												}
												let key = opt.key ? opt.key : opt.field_name;
												if (DEBUG) {
													console.log('opt.key = ', opt.key);
													console.log(
														'opt.field_name = ',
														opt.field_name
													);
												}

												// props.defaultChecked =
												// 	self.props.defaultValue !== null &&
												// 	self.props.defaultValue !== undefined &&
												// 	(self.props.defaultValue.indexOf(key) >
												// 		-1 ||
												// 		self.props.defaultValue.indexOf(
												// 			opt.value
												// 		) > -1);
												// console.log(
												// 	'defaultChecked = ',
												// 	props.defaultChecked
												// );
												if (DEBUG) {
													console.log(
														'this.defaultValue[option.field_name]  = ',
														this.defaultValue[props.name]
													);
													console.log('key = ', key);
												}
												props.defaultChecked =
													this.defaultValue !== null &&
													this.defaultValue !== undefined &&
													this.defaultValue[props.name] === key;
												if (DEBUG) {
													console.log(
														'props.defaultChecked = ',
														props.defaultChecked
													);
												}
											}

											if (this.props.read_only) {
												props.disabled = 'disabled';
											}
											if (DEBUG) {
												console.log('key = ', this_key + index);
											}

											return (
												<div className={classNames} key={this_key}>
													<input
														id={'fid_' + this_key}
														className="custom-control-input"
														ref={c => {
															if (DEBUG) {
																console.log('c = ', c);
															}
															let optionKey = option.key
																? option.key
																: option.field_name;
															if (c && self.props.mutable) {
																if (DEBUG) {
																	console.log(
																		' 1359 self.options = ',
																		self.options
																	);
																	console.log(
																		'1390 key = ',
																		`child_ref_${option.key}_${opt.key}`
																	);
																}
																self.options[
																	`child_ref_${option.key}_${opt.key}`
																] = c;
															}
														}}
														{...props}
													/>
													{/* this displays option choice for each gorup item such as "Hamburger $1" */}
													<label
														className="custom-control-label"
														htmlFor={'fid_' + this_key}>
														{opt.text}
													</label>
												</div>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</React.Fragment>
		);
	}
}

FormElements.Header = Header;
FormElements.Paragraph = Paragraph;
FormElements.Label = Label;
FormElements.LineBreak = LineBreak;
FormElements.TextInput = TextInput;
FormElements.NumberInput = NumberInput;
FormElements.TextArea = TextArea;
FormElements.Dropdown = Dropdown;
FormElements.Signature = Signature;
FormElements.Checkboxes = Checkboxes;
FormElements.DatePicker = DatePicker;
FormElements.RadioButtons = RadioButtons;
FormElements.Image = Image;
FormElements.Rating = Rating;
FormElements.Tags = Tags;
FormElements.HyperLink = HyperLink;
FormElements.Download = Download;
FormElements.Camera = Camera;
FormElements.Range = Range;
FormElements.ParagraphCheckbox = ParagraphCheckbox;
FormElements.MultipleRadioButtonGroup = MultipleRadioButtonGroup;

export default FormElements;
