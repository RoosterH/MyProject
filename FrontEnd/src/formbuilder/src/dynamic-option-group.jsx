/**
 * <DynamicOptionList />
 */
import React from 'react';
import ID from './UUID';
import {
	ContentState,
	EditorState,
	convertFromHTML,
	convertToRaw
} from 'draft-js';

import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import DynamicOptionList from './dynamic-option-list';

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

export default class DynamicOptionGroup extends React.Component {
	constructor(props) {
		super(props);
		console.log(
			'this.props.editElementProp = ',
			this.props.editElementProp
		);
		console.log('this.props.element = ', this.props.element);
		console.log('this.props.data = ', this.props.data);

		this.state = {
			element: this.props.element,
			data: this.props.data,
			dirty: false
		};
		// const {
		// 	canHavePageBreakBefore,
		// 	canHaveAlternateForm,
		// 	canHaveDisplayHorizontal,
		// 	canHaveOptionCorrect,
		// 	canHaveOptionValue,
		// 	nested
		// } = this.props.element;
	}

	_setValue(text) {
		return text.replace(/[^A-Z0-9]+/gi, '_').toLowerCase();
	}

	editElementProp(elemProperty, targProperty, e) {
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
		const this_element = this.state.element;
		if (
			this_element.options[option_index].hasOwnProperty('correct')
		) {
			delete this_element.options[option_index].correct;
		} else {
			this_element.options[option_index].correct = true;
		}
		this.setState({ element: this_element });
		this.props.updateElement.call(this.props.preview, this_element);
	}

	updateOption() {
		console.log('I am in updateOption');
		const this_element = this.state.element;
		// to prevent ajax calls with no change
		if (this.state.dirty) {
			this.props.updateElement.call(this.props.preview, this_element);
			this.setState({ dirty: false });
		}
	}

	addOption(index) {
		console.log('index = ', index);
		console.log('element = ', this.state.element.options[0].key);
		let optionsLength = this.state.element.options.length;
		let key;
		if (this.state.element.options[0].key.split('_').length > 0) {
			let optionKey = this.state.element.options[0].key;
			let optionName = optionKey.split('_')[0];
			key = optionName + '_' + ID.uuid();
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
		console.log('remove index = ', index);
		const this_element = this.state.element;
		this_element.options.splice(index, 1);
		this.props.updateElement.call(this.props.preview, this_element);
	}

	updateElement() {
		const this_element = this.state.element;
		// to prevent ajax calls with no change
		console.log('this.props.preview = ', this.props.preview);
		if (this.state.dirty) {
			this.props.updateElement.call(this.props.preview, this_element);
			this.setState({ dirty: false });
		}
	}

	convertFromHTML(content) {
		console.log('content = ', content);
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

	onEditorStateChange(index, property, editorContent) {
		// const html = draftToHtml(convertToRaw(editorContent.getCurrentContent())).replace(/<p>/g, '<div>').replace(/<\/p>/g, '</div>');
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

		this.setState({
			element: this_element,
			dirty: true
		});
	}

	render() {
		if (this.state.dirty) {
			this.state.element.dirty = true;
		}

		const this_checked = this.props.hasOwnProperty('required')
			? this.props.required
			: false;

		const this_checked_inline = this.props.hasOwnProperty('inline')
			? this.props.inline
			: false;

		let editorState;
		if (this.props.hasOwnProperty('name')) {
			console.log('this.props = ', this.props);
			editorState = this.convertFromHTML(this.props.element.name);
		}
		if (this.props.hasOwnProperty('content')) {
			editorState = this.convertFromHTML(this.props.element.content);
		}
		if (this.props.hasOwnProperty('label')) {
			editorState = this.convertFromHTML(this.props.element.label);
		}

		return (
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
				{/* <label className="control-label">Content:</label> */}
				{/* <Editor
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
				/> */}
				<br />
				{/* <div className="custom-control custom-checkbox">
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
				</div> */}
				{(this.state.element.element === 'RadioButtons' ||
					this.state.element.element === 'Checkboxes') && (
					// canHaveDisplayHorizontal &&
					<div className="custom-control custom-checkbox">
						<input
							id="display-horizontal"
							className="custom-control-input"
							type="checkbox"
							// checked={this_checked_inline}
							value={true}
							onChange={this.editElementProp.bind(
								this,
								'inline',
								'checked'
							)}
						/>
						<DynamicOptionList
							showCorrectColumn={this.props.element.showCorrectColumn}
							canHaveOptionCorrect={
								this.props.element.canHaveOptionCorrect
							}
							canHaveOptionValue={
								this.props.element.canHaveOptionValue
							}
							// data={this.props.element.preview.state.data}
							updateElement={this.props.element.updateElement}
							preview={this.props.element.preview}
							element={this.props.element}
							key={this.props.element.options.length}
						/>

						<label
							className="custom-control-label"
							htmlFor="display-horizontal">
							Display horizontally
						</label>
					</div>
				)}
			</div>
		);
	}
}
