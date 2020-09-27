import React from 'react';
import TextAreaAutosize from 'react-textarea-autosize';
import {
	ContentState,
	EditorState,
	convertFromHTML,
	convertToRaw
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';

import DynamicOptionList from './dynamic-option-list';
import DynamicOptionListForGroup from './dynamic-option-group';
import { get } from './stores/requests';

import ID from './UUID';

const toolbar = {
	options: [
		'inline',
		'list',
		'textAlign',
		'fontSize',
		'link',
		'history'
	],
	inline: {
		inDropdown: false,
		className: undefined,
		options: [
			'bold',
			'italic',
			'underline',
			'superscript',
			'subscript'
		]
	}
};

export default class FormElementsEdit extends React.Component {
	constructor(props) {
		super(props);
		console.log('props = ', props);
		this.state = {
			element: this.props.element,
			data: this.props.data,
			dirty: false
		};
	}

	toggleRequired() {
		// const this_element = this.state.element;
	}

	editElementProp(elemProperty, targProperty, e) {
		console.log('editElementProp');
		// elemProperty could be content or label
		// targProperty could be value or checked
		const this_element = this.state.element;
		this_element[elemProperty] = e.target[targProperty];

		this.setState(
			{
				element: this_element,
				dirty: true
			},
			() => {
				if (targProperty === 'checked') {
					this.updateElement();
				}
			}
		);
	}

	// index: index number of the Editor in the component
	// property: field where Editor is such as "label"
	// editorContent: EditorState (Editor Object), we can use editorContent.getCurrentContent() to get current
	//  content in the editor
	onEditorStateChange(index, property, editorContent) {
		console.log('onEditStateChange');
		console.log('property = ', property);
		console.log('index = ', index);
		console.log('editorContent = ', editorContent);

		// html is something like <strong>Registration Options</strong>
		const html = draftToHtml(
			convertToRaw(editorContent.getCurrentContent())
		)
			.replace(/<p>/g, '')
			.replace(/<\/p>/g, '')
			.replace(/(?:\r\n|\r|\n)/g, ' ');

		const this_element = this.state.element;
		console.log('this.state = ', this.state);
		console.log('this_element = ', this_element);
		this_element[property] = html;

		console.log('html = ', html);
		console.log('this_element2 = ', this_element);
		console.log('this_element[property] = ', this_element[property]);
		this.setState({
			element: this_element,
			dirty: true
		});
	}

	updateElement() {
		console.log('updateElement');
		const this_element = this.state.element;
		// to prevent ajax calls with no change
		if (this.state.dirty) {
			console.log(
				'this.props.updateElement = ',
				this.props.updateElement
			);
			console.log('this.props.preview = ', this.props.preview);
			// calls this.props.preview.updateElement
			this.props.updateElement.call(this.props.preview, this_element);
			this.setState({ dirty: false });
		}
	}

	convertFromHTML(content) {
		console.log('convertFromHTML');
		const newContent = convertFromHTML(content);
		if (
			!newContent.contentBlocks ||
			!newContent.contentBlocks.length
		) {
			// to prevent crash when no contents in editor
			return EditorState.createEmpty();
		}
		const contentState = ContentState.createFromBlockArray(
			newContent
		);
		return EditorState.createWithContent(contentState);
	}

	// this is for option canPopulateFromApi
	// addOptions() {
	// 	const optionsApiUrl = document.getElementById('optionsApiUrl')
	// 		.value;
	// 	console.log('optionsApiUrl = ', optionsApiUrl);
	// 	if (optionsApiUrl) {
	// 		get(optionsApiUrl).then(data => {
	// 			this.props.element.options = [];
	// 			const { options } = this.props.element;
	// 			data.forEach(x => {
	// 				// eslint-disable-next-line no-param-reassign
	// 				x.key = ID.uuid();
	// 				options.push(x);
	// 			});
	// 			const this_element = this.state.element;
	// 			this.setState({
	// 				element: this_element,
	// 				dirty: true
	// 			});
	// 		});
	// 	}
	// }

	create(item) {
		const elementOptions = {
			id: ID.uuid(),
			element: item.element || item.key,
			text: item.name,
			static: item.static,
			required: item.required ? item.required : false,
			showDescription: item.showDescription,
			nested: item.nested
		};

		if (this.props.showDescription === true && !item.static) {
			elementOptions.showDescription = true;
		}

		if (item.static) {
			elementOptions.bold = false;
			elementOptions.italic = false;
		}

		if (item.canHaveAnswer) {
			elementOptions.canHaveAnswer = item.canHaveAnswer;
		}

		if (item.canReadOnly) {
			elementOptions.readOnly = false;
		}

		if (item.canDefaultToday) {
			elementOptions.defaultToday = false;
		}

		if (item.content) {
			elementOptions.content = item.content;
		}

		if (item.href) {
			elementOptions.href = item.href;
		}

		elementOptions.canHavePageBreakBefore =
			item.canHavePageBreakBefore !== false;
		elementOptions.canHaveAlternateForm =
			item.canHaveAlternateForm !== false;
		elementOptions.canHaveDisplayHorizontal =
			item.canHaveDisplayHorizontal !== false;
		elementOptions.canHaveOptionCorrect =
			item.canHaveOptionCorrect !== false;
		elementOptions.canHaveOptionValue =
			item.canHaveOptionValue !== false;
		elementOptions.canPopulateFromApi =
			item.canPopulateFromApi !== false;

		if (item.key === 'Image') {
			elementOptions.src = item.src;
		}

		if (item.key === 'DatePicker') {
			elementOptions.dateFormat = item.dateFormat;
			elementOptions.timeFormat = item.timeFormat;
			elementOptions.showTimeSelect = item.showTimeSelect;
			elementOptions.showTimeSelectOnly = item.showTimeSelectOnly;
		}

		if (item.key === 'Download') {
			elementOptions._href = item._href;
			elementOptions.file_path = item.file_path;
		}

		if (item.key === 'Range') {
			elementOptions.step = item.step;
			elementOptions.default_value = item.default_value;
			elementOptions.min_value = item.min_value;
			elementOptions.max_value = item.max_value;
			elementOptions.min_label = item.min_label;
			elementOptions.max_label = item.max_label;
		}

		if (item.defaultValue) {
			elementOptions.defaultValue = item.defaultValue;
		}

		if (item.field_name) {
			elementOptions.field_name = item.field_name + ID.uuid();
		}

		if (item.label) {
			elementOptions.label = item.label;
		}

		// we only want to use default item option if it's not defined
		if (item.options) {
			// if (item.options.length === 0) {
			// 	elementOptions.options = Toolbar._defaultItemOptions(
			// 		elementOptions.element
			// 	);
			// } else {
			elementOptions.options = item.options;
			// }
		}
		return elementOptions;
	}

	render() {
		if (this.state.dirty) {
			this.props.element.dirty = true;
		}

		const this_checked = this.props.element.hasOwnProperty('required')
			? this.props.element.required
			: false;
		const this_read_only = this.props.element.hasOwnProperty(
			'readOnly'
		)
			? this.props.element.readOnly
			: false;
		const this_default_today = this.props.element.hasOwnProperty(
			'defaultToday'
		)
			? this.props.element.defaultToday
			: false;
		const this_show_time_select = this.props.element.hasOwnProperty(
			'showTimeSelect'
		)
			? this.props.element.showTimeSelect
			: false;
		const this_show_time_select_only = this.props.element.hasOwnProperty(
			'showTimeSelectOnly'
		)
			? this.props.element.showTimeSelectOnly
			: false;
		const this_checked_inline = this.props.element.hasOwnProperty(
			'inline'
		)
			? this.props.element.inline
			: false;
		const this_checked_bold = this.props.element.hasOwnProperty(
			'bold'
		)
			? this.props.element.bold
			: false;
		const this_checked_italic = this.props.element.hasOwnProperty(
			'italic'
		)
			? this.props.element.italic
			: false;
		const this_checked_center = this.props.element.hasOwnProperty(
			'center'
		)
			? this.props.element.center
			: false;
		const this_checked_page_break = this.props.element.hasOwnProperty(
			'pageBreakBefore'
		)
			? this.props.element.pageBreakBefore
			: false;
		const this_checked_alternate_form = this.props.element.hasOwnProperty(
			'alternateForm'
		)
			? this.props.element.alternateForm
			: false;

		const {
			canHavePageBreakBefore,
			canHaveAlternateForm,
			canHaveDisplayHorizontal,
			canHaveOptionCorrect,
			canHaveOptionValue,
			nested
		} = this.props.element;

		const this_files = this.props.files.length
			? this.props.files
			: [];
		if (
			this_files.length < 1 ||
			(this_files.length > 0 && this_files[0].id !== '')
		) {
			this_files.unshift({ id: '', file_name: '' });
		}

		// this.props.element is the option entity such as "RadioButton", "MultipleRadioButtonGroup"
		// get current text for text editor, we will use it to set as default text of Editor
		let editorState;
		if (this.props.element.hasOwnProperty('name')) {
			console.log('name = ', this.props.element.name);
			editorState = this.convertFromHTML(this.props.element.name);
		}
		if (this.props.element.hasOwnProperty('content')) {
			console.log('content = ', this.props.element.content);
			editorState = this.convertFromHTML(this.props.element.content);
		}
		if (this.props.element.hasOwnProperty('label')) {
			console.log('label = ', this.props.element.label);
			editorState = this.convertFromHTML(this.props.element.label);
		}

		console.log('this.state.element = ', this.state.element);
		console.log(
			'this.state.element.element = ',
			this.state.element.element
		);
		console.log('this.editElementProp = ', this.editElementProp);

		// deal with nested option such as MultipleRadioButtonGroup options,
		// each option of nested option, we need to create an object
		if (nested) {
			let optionComponents = [];
			this.props.element.options.map(opt => {
				// We only create the object if opt.text is unavailable.
				// Because create(item) will add "text", if opt.text is there meaning it's been
				// created
				if (!opt.text) {
					console.log('371 opt = ', opt);
					// Create option as an component because here option is also a component,
					// so it has all the componenet info.
					let elementOption = this.create(opt);
					console.log('elementOption = ', elementOption);
					optionComponents.push(elementOption);
				} else {
					optionComponents.push(opt);
				}
			});
			this.props.element.options = optionComponents;
		}

		return (
			<div>
				<div className="clearfix">
					<h4 className="float-left">{this.props.element.text}</h4>
					<i
						className="float-right fas fa-times dismiss-edit"
						onClick={this.props.manualEditModeOff}></i>
				</div>
				{/* this section is for ParagraphCheckbox */}
				{this.props.element.hasOwnProperty('content') &&
					this.props.element.hasOwnProperty('label') && (
						<div className="form-group">
							<label>Display Label</label>
							<Editor
								toolbar={toolbar}
								defaultEditorState={editorState}
								onBlur={this.updateElement.bind(this)}
								onEditorStateChange={this.onEditorStateChange.bind(
									this,
									0,
									'label'
								)}
								stripPastedStyles={true}
								placeholder="Please enter label"
								editorClassName="rdw-editor-label"
							/>
							<br />
							<label className="control-label">Content:</label>
							<Editor
								toolbar={toolbar}
								defaultEditorState={this.convertFromHTML(
									this.props.element.content
								)}
								onBlur={this.updateElement.bind(this)}
								onEditorStateChange={this.onEditorStateChange.bind(
									this,
									0,
									'content'
								)}
								stripPastedStyles={true}
								editorClassName="rdw-editor-content"
							/>
							<br />
							<div className="custom-control custom-checkbox">
								<input
									id="is-required"
									className="custom-control-input"
									type="checkbox"
									checked={this_checked}
									value={true}
									onChange={this.editElementProp.bind(
										this,
										'required',
										'checked'
									)}
								/>
								<label
									className="custom-control-label"
									htmlFor="is-required">
									Required
								</label>
							</div>
							{(this.state.element.element === 'RadioButtons' ||
								this.state.element.element === 'Checkboxes') &&
								canHaveDisplayHorizontal && (
									<div className="custom-control custom-checkbox">
										<input
											id="display-horizontal"
											className="custom-control-input"
											type="checkbox"
											checked={this_checked_inline}
											value={true}
											onChange={this.editElementProp.bind(
												this,
												'inline',
												'checked'
											)}
										/>
										<label
											className="custom-control-label"
											htmlFor="display-horizontal">
											Display horizontally
										</label>
									</div>
								)}
						</div>
					)}
				{/* this section is for Paragraph */}
				{this.props.element.hasOwnProperty('content') &&
					!this.props.element.hasOwnProperty('label') && (
						<div className="form-group">
							<label className="control-label">
								Text to display:
							</label>
							<Editor
								toolbar={toolbar}
								defaultEditorState={editorState}
								onBlur={this.updateElement.bind(this)}
								onEditorStateChange={this.onEditorStateChange.bind(
									this,
									0,
									'content'
								)}
								stripPastedStyles={true}
								editorClassName="rdw-editor-content"
							/>
						</div>
					)}
				{this.props.element.hasOwnProperty('file_path') && (
					<div className="form-group">
						<label className="control-label" htmlFor="fileSelect">
							Choose file:
						</label>
						<select
							id="fileSelect"
							className="form-control"
							defaultValue={this.props.element.file_path}
							onBlur={this.updateElement.bind(this)}
							onChange={this.editElementProp.bind(
								this,
								'file_path',
								'value'
							)}>
							{this_files.map(file => {
								const this_key = `file_${file.id}`;
								return (
									<option value={file.id} key={this_key}>
										{file.file_name}
									</option>
								);
							})}
						</select>
					</div>
				)}
				{this.props.element.hasOwnProperty('href') && (
					<div className="form-group">
						<TextAreaAutosize
							type="text"
							className="form-control"
							defaultValue={this.props.element.href}
							onBlur={this.updateElement.bind(this)}
							onChange={this.editElementProp.bind(
								this,
								'href',
								'value'
							)}
						/>
					</div>
				)}
				{this.props.element.hasOwnProperty('src') && (
					<div>
						<div className="form-group">
							<label className="control-label" htmlFor="srcInput">
								Link to:
							</label>
							<input
								id="srcInput"
								type="text"
								className="form-control"
								defaultValue={this.props.element.src}
								onBlur={this.updateElement.bind(this)}
								onChange={this.editElementProp.bind(
									this,
									'src',
									'value'
								)}
							/>
						</div>
						<div className="form-group">
							<div className="custom-control custom-checkbox">
								<input
									id="do-center"
									className="custom-control-input"
									type="checkbox"
									checked={this_checked_center}
									value={true}
									onChange={this.editElementProp.bind(
										this,
										'center',
										'checked'
									)}
								/>
								<label
									className="custom-control-label"
									htmlFor="do-center">
									Center?
								</label>
							</div>
						</div>
						<div className="row">
							<div className="col-sm-3">
								<label
									className="control-label"
									htmlFor="elementWidth">
									Width:
								</label>
								<input
									id="elementWidth"
									type="text"
									className="form-control"
									defaultValue={this.props.element.width}
									onBlur={this.updateElement.bind(this)}
									onChange={this.editElementProp.bind(
										this,
										'width',
										'value'
									)}
								/>
							</div>
							<div className="col-sm-3">
								<label
									className="control-label"
									htmlFor="elementHeight">
									Height:
								</label>
								<input
									id="elementHeight"
									type="text"
									className="form-control"
									defaultValue={this.props.element.height}
									onBlur={this.updateElement.bind(this)}
									onChange={this.editElementProp.bind(
										this,
										'height',
										'value'
									)}
								/>
							</div>
						</div>
					</div>
				)}
				{/* this section is for Radioboxes or Checkboxes */}
				{!nested &&
					this.props.element.hasOwnProperty('label') &&
					!this.props.element.hasOwnProperty('content') && (
						<div className="form-group">
							<label>Display Label</label>
							<Editor
								toolbar={toolbar}
								defaultEditorState={editorState}
								onBlur={this.updateElement.bind(this)}
								onEditorStateChange={this.onEditorStateChange.bind(
									this,
									0,
									'label'
								)}
								stripPastedStyles={true}
								placeholder="Please enter label"
							/>
							<br />
							<div className="custom-control custom-checkbox">
								<input
									id="is-required"
									className="custom-control-input"
									type="checkbox"
									checked={this_checked}
									value={true}
									onChange={this.editElementProp.bind(
										this,
										'required',
										'checked'
									)}
								/>
								<label
									className="custom-control-label"
									htmlFor="is-required">
									Required
								</label>
							</div>
							{this.props.element.hasOwnProperty('readOnly') && (
								<div className="custom-control custom-checkbox">
									<input
										id="is-read-only"
										className="custom-control-input"
										type="checkbox"
										checked={this_read_only}
										value={true}
										onChange={this.editElementProp.bind(
											this,
											'readOnly',
											'checked'
										)}
									/>
									<label
										className="custom-control-label"
										htmlFor="is-read-only">
										Read only
									</label>
								</div>
							)}
							{this.props.element.hasOwnProperty('defaultToday') && (
								<div className="custom-control custom-checkbox">
									<input
										id="is-default-to-today"
										className="custom-control-input"
										type="checkbox"
										checked={this_default_today}
										value={true}
										onChange={this.editElementProp.bind(
											this,
											'defaultToday',
											'checked'
										)}
									/>
									<label
										className="custom-control-label"
										htmlFor="is-default-to-today">
										Default to Today?
									</label>
								</div>
							)}
							{this.props.element.hasOwnProperty(
								'showTimeSelect'
							) && (
								<div className="custom-control custom-checkbox">
									<input
										id="show-time-select"
										className="custom-control-input"
										type="checkbox"
										checked={this_show_time_select}
										value={true}
										onChange={this.editElementProp.bind(
											this,
											'showTimeSelect',
											'checked'
										)}
									/>
									<label
										className="custom-control-label"
										htmlFor="show-time-select">
										Show Time Select?
									</label>
								</div>
							)}
							{this_show_time_select &&
								this.props.element.hasOwnProperty(
									'showTimeSelectOnly'
								) && (
									<div className="custom-control custom-checkbox">
										<input
											id="show-time-select-only"
											className="custom-control-input"
											type="checkbox"
											checked={this_show_time_select_only}
											value={true}
											onChange={this.editElementProp.bind(
												this,
												'showTimeSelectOnly',
												'checked'
											)}
										/>
										<label
											className="custom-control-label"
											htmlFor="show-time-select-only">
											Show Time Select Only?
										</label>
									</div>
								)}
							{(this.state.element.element === 'RadioButtons' ||
								this.state.element.element === 'Checkboxes') &&
								canHaveDisplayHorizontal && (
									<div className="custom-control custom-checkbox">
										<input
											id="display-horizontal"
											className="custom-control-input"
											type="checkbox"
											checked={this_checked_inline}
											value={true}
											onChange={this.editElementProp.bind(
												this,
												'inline',
												'checked'
											)}
										/>
										<label
											className="custom-control-label"
											htmlFor="display-horizontal">
											Display horizontally
										</label>
									</div>
								)}
						</div>
					)}
				{this.state.element.element === 'Signature' &&
				this.props.element.readOnly ? (
					<div className="form-group">
						<label className="control-label" htmlFor="variableKey">
							Variable Key:
						</label>
						<input
							id="variableKey"
							type="text"
							className="form-control"
							defaultValue={this.props.element.variableKey}
							onBlur={this.updateElement.bind(this)}
							onChange={this.editElementProp.bind(
								this,
								'variableKey',
								'value'
							)}
						/>
						<p className="help-block">
							This will give the element a key that can be used to
							replace the content with a runtime value.
						</p>
					</div>
				) : (
					<div />
				)}
				{/* {canHavePageBreakBefore && (
					<div className="form-group">
						<label className="control-label">Print Options</label>
						<div className="custom-control custom-checkbox">
							<input
								id="page-break-before-element"
								className="custom-control-input"
								type="checkbox"
								checked={this_checked_page_break}
								value={true}
								onChange={this.editElementProp.bind(
									this,
									'pageBreakBefore',
									'checked'
								)}
							/>
							<label
								className="custom-control-label"
								htmlFor="page-break-before-element">
								Page Break Before Element?
							</label>
						</div>
					</div>
				)} */}
				{/* {canHaveAlternateForm && (
					<div className="form-group">
						<label className="control-label">
							Alternate/Signature Page
						</label>
						<div className="custom-control custom-checkbox">
							<input
								id="display-on-alternate"
								className="custom-control-input"
								type="checkbox"
								checked={this_checked_alternate_form}
								value={true}
								onChange={this.editElementProp.bind(
									this,
									'alternateForm',
									'checked'
								)}
							/>
							<label
								className="custom-control-label"
								htmlFor="display-on-alternate">
								Display on alternate/signature Page?
							</label>
						</div>
					</div>
				)} */}
				{this.props.element.hasOwnProperty('step') && (
					<div className="form-group">
						<div className="form-group-range">
							<label className="control-label" htmlFor="rangeStep">
								Step
							</label>
							<input
								id="rangeStep"
								type="number"
								className="form-control"
								defaultValue={this.props.element.step}
								onBlur={this.updateElement.bind(this)}
								onChange={this.editElementProp.bind(
									this,
									'step',
									'value'
								)}
							/>
						</div>
					</div>
				)}
				{this.props.element.hasOwnProperty('min_value') && (
					<div className="form-group">
						<div className="form-group-range">
							<label className="control-label" htmlFor="rangeMin">
								Min
							</label>
							<input
								id="rangeMin"
								type="number"
								className="form-control"
								defaultValue={this.props.element.min_value}
								onBlur={this.updateElement.bind(this)}
								onChange={this.editElementProp.bind(
									this,
									'min_value',
									'value'
								)}
							/>
							<input
								type="text"
								className="form-control"
								defaultValue={this.props.element.min_label}
								onBlur={this.updateElement.bind(this)}
								onChange={this.editElementProp.bind(
									this,
									'min_label',
									'value'
								)}
							/>
						</div>
					</div>
				)}
				{this.props.element.hasOwnProperty('max_value') && (
					<div className="form-group">
						<div className="form-group-range">
							<label className="control-label" htmlFor="rangeMax">
								Max
							</label>
							<input
								id="rangeMax"
								type="number"
								className="form-control"
								defaultValue={this.props.element.max_value}
								onBlur={this.updateElement.bind(this)}
								onChange={this.editElementProp.bind(
									this,
									'max_value',
									'value'
								)}
							/>
							<input
								type="text"
								className="form-control"
								defaultValue={this.props.element.max_label}
								onBlur={this.updateElement.bind(this)}
								onChange={this.editElementProp.bind(
									this,
									'max_label',
									'value'
								)}
							/>
						</div>
					</div>
				)}
				{this.props.element.hasOwnProperty('default_value') && (
					<div className="form-group">
						<div className="form-group-range">
							<label
								className="control-label"
								htmlFor="defaultSelected">
								Default Selected
							</label>
							<input
								id="defaultSelected"
								type="number"
								className="form-control"
								defaultValue={this.props.element.default_value}
								onBlur={this.updateElement.bind(this)}
								onChange={this.editElementProp.bind(
									this,
									'default_value',
									'value'
								)}
							/>
						</div>
					</div>
				)}
				{this.props.element.hasOwnProperty('static') &&
					this.props.element.static && (
						<div className="form-group">
							<label className="control-label">Text Style</label>
							<div className="custom-control custom-checkbox">
								<input
									id="do-bold"
									className="custom-control-input"
									type="checkbox"
									checked={this_checked_bold}
									value={true}
									onChange={this.editElementProp.bind(
										this,
										'bold',
										'checked'
									)}
								/>
								<label
									className="custom-control-label"
									htmlFor="do-bold">
									Bold
								</label>
							</div>
							<div className="custom-control custom-checkbox">
								<input
									id="do-italic"
									className="custom-control-input"
									type="checkbox"
									checked={this_checked_italic}
									value={true}
									onChange={this.editElementProp.bind(
										this,
										'italic',
										'checked'
									)}
								/>
								<label
									className="custom-control-label"
									htmlFor="do-italic">
									Italic
								</label>
							</div>
						</div>
					)}
				{this.props.element.showDescription && (
					<div className="form-group">
						<label
							className="control-label"
							htmlFor="questionDescription">
							Description
						</label>
						<TextAreaAutosize
							type="text"
							className="form-control"
							id="questionDescription"
							defaultValue={this.props.element.description}
							onBlur={this.updateElement.bind(this)}
							onChange={this.editElementProp.bind(
								this,
								'description',
								'value'
							)}
						/>
					</div>
				)}
				{this.props.showCorrectColumn &&
					this.props.element.canHaveAnswer &&
					!this.props.element.hasOwnProperty('options') && (
						<div className="form-group">
							<label
								className="control-label"
								htmlFor="correctAnswer">
								Correct Answer
							</label>
							<input
								id="correctAnswer"
								type="text"
								className="form-control"
								defaultValue={this.props.element.correct}
								onBlur={this.updateElement.bind(this)}
								onChange={this.editElementProp.bind(
									this,
									'correct',
									'value'
								)}
							/>
						</div>
					)}
				{/* {this.props.element.canPopulateFromApi &&
					this.props.element.hasOwnProperty('options') && (
						<div className="form-group">
							<label
								className="control-label"
								htmlFor="optionsApiUrl">
								Populate Options from API
							</label>
							<div className="row">
								<div className="col-sm-6">
									<input
										className="form-control"
										style={{ width: '100%' }}
										type="text"
										id="optionsApiUrl"
										placeholder="http://localhost:8080/api/optionsdata"
									/>
								</div>
								<div className="col-sm-6">
									<button
										onClick={this.addOptions.bind(this)}
										className="btn btn-success">
										Populate
									</button>
								</div>
							</div>
						</div>
					)} */}
				{!nested && this.props.element.hasOwnProperty('options') && (
					<DynamicOptionList
						showCorrectColumn={this.props.showCorrectColumn}
						canHaveOptionCorrect={canHaveOptionCorrect}
						canHaveOptionValue={canHaveOptionValue}
						data={this.props.preview.state.data}
						updateElement={this.props.updateElement}
						preview={this.props.preview}
						element={this.props.element}
						key={this.props.element.options.length}
					/>
				)}

				{/* the following 2 sections are for MultipleRadioGroup, we define nested = true as we have nested option structur */}
				{/***** this section is for Group Title *****/}
				{nested && this.props.element.hasOwnProperty('options') && (
					<div className="form-group">
						<label>Display Label</label>
						<Editor
							toolbar={toolbar}
							defaultEditorState={editorState}
							onBlur={this.updateElement.bind(this)}
							onEditorStateChange={this.onEditorStateChange.bind(
								this,
								0,
								'label'
							)}
							stripPastedStyles={true}
							placeholder="Please enter label"
						/>
						<br />
						<div className="custom-control custom-checkbox">
							<input
								id="is-required"
								className="custom-control-input"
								type="checkbox"
								checked={this_checked}
								value={true}
								onChange={this.editElementProp.bind(
									this,
									'required',
									'checked'
								)}
							/>
							<label
								className="custom-control-label"
								htmlFor="is-required">
								Required
							</label>
						</div>
					</div>
				)}

				{/***** this section is for Group options *****/}
				{nested &&
					this.props.element.hasOwnProperty('options') &&
					this.props.element.options.map((opt, index) => {
						console.log('opt = ', opt);
						console.log(
							'1122 this.props.preview.state.data = ',
							this.props.preview.state.data
						);
						// this.props.element.options contains radioButton groups object such as "Day 1 Lunch" and "Day 2 Lunch"
						return (
							// data, updateElement and preview are from parent because this is
							// an option not a main component which we don't create neither
							// for it
							<DynamicOptionListForGroup
								key={opt.id}
								showCorrectColumn={opt.showCorrectColumn}
								canHaveOptionCorrect={opt.canHaveOptionCorrect}
								canHaveOptionValue={opt.canHaveOptionValue}
								data={this.props.preview.state.data}
								updateElement={this.props.updateElement}
								preview={this.props.preview}
								element={opt}
								index={index}
								parent={this.props.element}
							/>
						);
					})}
			</div>
		);
	}
}
FormElementsEdit.defaultProps = { className: 'edit-element-fields' };
