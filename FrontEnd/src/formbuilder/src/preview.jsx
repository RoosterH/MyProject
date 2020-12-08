/**
 * <Preview />
 */

import React from 'react';
import update from 'immutability-helper';
import store from './stores/store';
import FormElementsEdit from './form-elements-edit';
import SortableFormElements from './sortable-form-elements';
import { couldStartTrivia } from 'typescript';
import { connect } from 'formik';

const { PlaceHolder } = SortableFormElements;
const DEBUG = process.env.DEBUG_MODE;

export default class Preview extends React.Component {
	_isMounted = false;
	constructor(props) {
		super(props);
		if (DEBUG) {
			console.log('props = ', props);
		}
		const { onLoad, onPost } = props;
		store.setExternalHandler(onLoad, onPost);

		this.editForm = React.createRef();
		this.state = {
			data: [],
			answer_data: {}
		};
		this.seq = 0;
		const onUpdate = this._onChange.bind(this);
		store.subscribe(state => onUpdate(state.data));

		this.moveCard = this.moveCard.bind(this);
		this.insertCard = this.insertCard.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (DEBUG) {
			console.log('componentWillReceiveProps');
		}
		if (this.props.data !== nextProps.data) {
			if (DEBUG) {
				console.log('nextProps.data = ', nextProps.data);
			}
			store.dispatch('updateOrder', nextProps.data);
		}
	}

	componentDidMount() {
		if (DEBUG) {
			console.log('componentDidMount');
		}
		this._isMounted = true;
		const { data, url, saveUrl } = this.props;
		if (DEBUG) {
			console.log('componentDidMount data = ', data);
		}
		store.dispatch('load', {
			loadUrl: url,
			saveUrl,
			data: data || []
		});
		document.addEventListener('mousedown', this.editModeOff);
	}

	componentWillUnmount() {
		this._isMounted = false;
		document.removeEventListener('mousedown', this.editModeOff);
	}

	editModeOff = e => {
		if (DEBUG) {
			console.log('editModeOff');
		}
		if (
			this.editForm.current &&
			!this.editForm.current.contains(e.target)
		) {
			this.manualEditModeOff();
		}
	};

	manualEditModeOff = () => {
		if (DEBUG) {
			console.log('in manualEditOff ');
		}
		const { editElement } = this.props;
		if (DEBUG) {
			console.log('editElement = ', editElement);
		}
		if (editElement && editElement.dirty) {
			if (DEBUG) {
				console.log('77 editElement dirty = ');
			}
			editElement.dirty = false;
			this.updateElement(editElement);
		}
		this.props.manualEditModeOff();
	};

	_setValue(text) {
		if (DEBUG) {
			console.log('_setValue');
		}
		return text.replace(/[^A-Z0-9]+/gi, '_').toLowerCase();
	}

	// element: the component that needs to be updated
	updateElement(element) {
		if (DEBUG) {
			console.log('in updateElement');
			console.log('element = ', element);
		}
		// this.state is the array that has all the components on the form
		const { data } = this.state;
		if (DEBUG) {
			console.log('preview updateElement data = ', data);
		}
		let found = false;

		// loop through all the components matching ID with element.id
		// if matches, update the component with new element
		for (let i = 0, len = data.length; i < len; i++) {
			if (element.id === data[i].id) {
				data[i] = element;
				if (DEBUG) {
					console.log('found updateElement');
				}
				found = true;
				break;
			}

			// else if (element.parentId === data[i].id) {
			// 	console.log('Found parent');
			// 	console.log('i = ', i);
			// 	// for nested component, to add a new RadioButtons option
			// 	// element is the RadioButtons
			// 	data[i].options.push(element);
			// 	console.log('data = ', data);
			// 	found = true;
			// 	break;
			// } else if (data[i].nested) {
			// 	// for nested component, we need to match its option items with
			// 	// elment because element could be option component.
			// 	for (let j = 0; j < data[i].options.length; ++j) {
			// 		if (data[i].options[j].id === element.id) {
			// 			data[i].options[j] = element;
			// 			found = true;
			// 			break;
			// 		}
			// 	}
			// }
		}

		if (found) {
			this.seq = this.seq > 100000 ? 0 : this.seq + 1;
			// change the state tree
			store.dispatch('updateOrder', data);
		}
	}

	_onChange(data) {
		if (DEBUG) {
			console.log('_onChange');
		}
		if (!this._isMounted) {
			return;
		}
		const answer_data = {};

		if (!data) {
			return;
		}

		if (DEBUG) {
			console.log('data = ', data);
		}
		data.forEach(item => {
			if (DEBUG) {
				console.log('item = ', item);
			}
			if (
				item &&
				item.readOnly &&
				this.props.variables[item.variableKey]
			) {
				answer_data[item.field_name] = this.props.variables[
					item.variableKey
				];
			}
		});
		if (this._isMounted) {
			this.setState({
				data,
				answer_data
			});
		}
	}

	_onDestroy(item) {
		store.dispatch('delete', item);
	}

	insertCard(item, hoverIndex) {
		if (DEBUG) {
			console.log('insertCard');
			console.log('item = ', item);
		}
		const { data } = this.state;
		data.splice(hoverIndex, 0, item);
		this.saveData(item, hoverIndex, hoverIndex);
	}

	moveCard(dragIndex, hoverIndex) {
		if (DEBUG) {
			console.log('moveCard');
		}
		const { data } = this.state;
		const dragCard = data[dragIndex];
		this.saveData(dragCard, dragIndex, hoverIndex);
	}

	// eslint-disable-next-line no-unused-vars
	cardPlaceHolder(dragIndex, hoverIndex) {
		// Dummy
	}

	saveData(dragCard, dragIndex, hoverIndex) {
		if (DEBUG) {
			console.log('saveData');
		}
		const newData = update(this.state, {
			data: {
				$splice: [
					[dragIndex, 1],
					[hoverIndex, 0, dragCard]
				]
			}
		});
		if (DEBUG) {
			console.log('newData = ', newData);
		}
		this.setState(newData);
		store.dispatch('updateOrder', newData.data);
	}

	getElement(item, index) {
		if (DEBUG) {
			console.log('in getElement item = ', item);
		}
		const SortableFormElement = SortableFormElements[item.element];
		if (DEBUG) {
			console.log('item id = ', item.id);
			console.log('index = ', index);
			console.log('this.moveCard = ', this.moveCard);
			console.log('this.insertCard = ', this.insertCard);
		}
		return (
			<SortableFormElement
				id={item.id}
				seq={this.seq}
				index={index}
				moveCard={this.moveCard}
				insertCard={this.insertCard}
				mutable={false}
				parent={this.props.parent}
				editModeOn={this.props.editModeOn}
				isDraggable={true}
				key={item.id}
				sortData={item.id}
				data={item}
				_onDestroy={this._onDestroy}
			/>
		);
	}

	render() {
		if (DEBUG) {
			console.log(
				'235 this.props.editElement = ',
				this.props.editElement
			);
		}
		let classes = this.props.className;
		if (this.props.editMode) {
			classes += ' is-editing';
		}
		const data = this.state.data.filter(x => !!x);
		if (DEBUG) {
			console.log('data = ', data);
		}
		const items = data.map((item, index) => {
			if (DEBUG) {
				console.log('item = ', item);
			}
			return this.getElement(item, index);
		});
		return (
			<div className={classes}>
				<div className="edit-form" ref={this.editForm}>
					{this.props.editElement !== null && (
						<FormElementsEdit
							showCorrectColumn={this.props.showCorrectColumn}
							files={this.props.files}
							manualEditModeOff={this.manualEditModeOff}
							preview={this}
							element={this.props.editElement}
							updateElement={this.updateElement}
						/>
					)}
				</div>
				<div className="Sortable">{items}</div>
				<PlaceHolder
					id="form-place-holder"
					show={items.length === 0}
					index={items.length}
					moveCard={this.cardPlaceHolder}
					insertCard={this.insertCard}
				/>
			</div>
		);
	}
}
Preview.defaultProps = {
	showCorrectColumn: false,
	files: [],
	editMode: false,
	editElement: null,
	className: 'react-form-builder-preview float-left'
};
