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

const DEBUG = process.env.DEBUG_MODE;

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
		if (DEBUG) {
			console.log(
				'this.props.editElementProp = ',
				this.props.editElementProp
			);
			console.log('this.props.element = ', this.props.element);
			console.log('this.props.data = ', this.props.data);
		}
		this.state = {
			element: this.props.element,
			data: this.props.data,
			dirty: false,
			index: this.props.index,
			parent: this.props.parent
		};
		if (DEBUG) {
			console.log('57 this.state = ', this.state);
		}
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
		if (DEBUG) {
			console.log('I am in editOption');
		}
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
		if (DEBUG) {
			console.log('I am in editValue');
		}
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
		if (DEBUG) {
			console.log('I am in updateOption');
		}
		const this_element = this.state.element;
		// to prevent ajax calls with no change
		if (this.state.dirty) {
			this.props.updateElement.call(this.props.preview, this_element);
			this.setState({ dirty: false });
		}
	}

	addOption(index) {
		if (DEBUG) {
			console.log('in addOption');
			console.log('index = ', index);
			console.log('parent = ', this.props.parent);
			console.log('element = ', this.state.element);
		}
		// adding a Radio Button to parent Group
		// Make a copy of this.state.element and modify properties
		// We need to use Deep Copy to make sure all the information is disconnected
		// between this.state.element and newItem
		let newItem = JSON.parse(JSON.stringify(this.state.element));

		// parse parent text such as: "Lunch Selection"
		// get rid of SPACE in parent text + uuid
		newItem.field_name =
			this.props.parent.text.split(' ').join('') + '_' + ID.uuid();
		newItem.id = ID.uuid();
		newItem.parentId = this.props.parent.id;

		this.props.parent.options.splice(index + 1, 0, newItem);
		if (DEBUG) {
			console.log('this.props.parent = ', this.props.parent);
		}
		this.props.updateElement.call(
			this.props.preview,
			this.props.parent
		);
	}

	removeOption(index) {
		if (DEBUG) {
			console.log('remove index = ', index);
		}
		const this_element = this.state.element;
		if (DEBUG) {
			console.log('this_element = ', this_element);
		}
		// splice parent.options
		this.props.parent.options.splice(index, 1);
		this.props.updateElement.call(
			this.props.preview,
			this.props.parent
		);
	}

	updateElement() {
		const this_element = this.state.element;
		if (DEBUG) {
			console.log('this_element = ', this_element);
		}
		// to prevent ajax calls with no change
		if (DEBUG) {
			console.log('this.props.preview = ', this.props.preview);
			console.log('this.props.parent = ', this.props.parent);
		}
		const { options } = this.state.parent;
		if (DEBUG) {
			console.log('options = ', options);
		}
		for (let i = 0; i < options.length; ++i) {
			if (this_element.id === options[i].id) {
				options[i] = this_element;
				if (DEBUG) {
					console.log('parent 2 = ', this.state.parent);
				}
				break;
			}
		}
		if (this.state.dirty) {
			// this.props.updateElement.call(this.props.preview, this_element);
			this.props.updateElement.call(
				this.props.preview,
				this.state.parent
			);
			this.setState({ dirty: false });
		}
	}

	convertFromHTML(content) {
		if (DEBUG) {
			console.log('content = ', content);
		}
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

		if (DEBUG) {
			console.log('html = ', html);
			console.log('this.state = ', this.state);
			console.log('this_element = ', this_element);
			console.log('property = ', property);
		}

		this_element[property] = html;
		this_element['text'] = html;
		this.setState({
			element: this_element,
			dirty: true
		});
		if (DEBUG) {
			console.log('this.state = ', this.state);
		}
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

		if (DEBUG) {
			console.log('this.props in 228 = ', this.props);
		}
		let editorState;
		if (this.props.element.hasOwnProperty('name')) {
			if (DEBUG) {
				console.log('name this.props = ', this.props);
			}
			editorState = this.convertFromHTML(this.props.element.name);
		}
		if (this.props.element.hasOwnProperty('content')) {
			if (DEBUG) {
				console.log('content this.props = ', this.props);
			}
			editorState = this.convertFromHTML(this.props.element.content);
		}
		if (this.props.element.hasOwnProperty('label')) {
			if (DEBUG) {
				console.log('label this.props = ', this.props);
			}
			editorState = this.convertFromHTML(this.props.element.label);
		}
		if (this.props.element.label) {
			if (DEBUG) {
				console.log('label2 this.props = ', this.props.element.label);
			}
			editorState = this.convertFromHTML(this.props.element.label);
		}
		if (DEBUG) {
			console.log('ALL this.props = ', this.props);
			console.log('editorState = ', editorState);
		}
		return (
			<div className="form-group">
				<label>Display Label &nbsp; &nbsp; &nbsp; &nbsp;</label>
				{/* <div className="col-sm-3">
					<div className="dynamic-options-actions-buttons"> */}
				<button
					onClick={this.addOption.bind(this, this.state.index)}
					className="btn btn-success">
					<i className="fas fa-plus-circle"></i>
				</button>
				{this.state.index > 0 && (
					<button
						onClick={this.removeOption.bind(this, this.state.index)}
						className="btn btn-danger">
						<i className="fas fa-minus-circle"></i>
					</button>
				)}
				{/* </div>
				</div> */}
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
					// editorClassName="rdw-editor-label"
				/>
				{(this.state.element.element === 'RadioButtons' ||
					this.state.element.element === 'Checkboxes') && (
					// canHaveDisplayHorizontal &&
					<div className="custom-control custom-checkbox">
						{/* this input is for Display Horizontally */}
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
								this.state.element.canHaveOptionCorrect
							}
							canHaveOptionValue={
								this.state.element.canHaveOptionValue
							}
							// data can be obtained from parent of this_element
							// we will just get from parent
							data={this.props.data}
							// updateElement and preview are from parents, because this
							// is an option not a main component
							updateElement={this.props.updateElement}
							preview={this.props.preview}
							element={this.state.element}
							key={this.props.element.options.length}
							parent={this.props.parent}
						/>
						{/* {this.state.element.element.canHaveDisplayHorizontal && ( */}
						<label
							className="custom-control-label"
							htmlFor="display-horizontal">
							Display horizontally
						</label>
						{/* )} */}
					</div>
				)}
			</div>
		);
	}
}
