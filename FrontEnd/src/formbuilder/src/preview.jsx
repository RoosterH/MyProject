/**
 * <Preview />
 */

import React from 'react';
import update from 'immutability-helper';
import store from './stores/store';
import FormElementsEdit from './form-elements-edit';
import SortableFormElements from './sortable-form-elements';
import { couldStartTrivia } from 'typescript';

const { PlaceHolder } = SortableFormElements;

export default class Preview extends React.Component {
	_isMounted = false;
	constructor(props) {
		super(props);
		console.log('props = ', props);
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
		if (this.props.data !== nextProps.data) {
			store.dispatch('updateOrder', nextProps.data);
		}
	}

	componentDidMount() {
		this._isMounted = true;
		const { data, url, saveUrl } = this.props;
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
		if (
			this.editForm.current &&
			!this.editForm.current.contains(e.target)
		) {
			this.manualEditModeOff();
		}
	};

	manualEditModeOff = () => {
		const { editElement } = this.props;
		if (editElement && editElement.dirty) {
			editElement.dirty = false;
			this.updateElement(editElement);
		}
		this.props.manualEditModeOff();
	};

	_setValue(text) {
		return text.replace(/[^A-Z0-9]+/gi, '_').toLowerCase();
	}

	updateElement(element) {
		console.log('in updateElement');
		const { data } = this.state;
		let found = false;

		for (let i = 0, len = data.length; i < len; i++) {
			if (element.id === data[i].id) {
				data[i] = element;
				found = true;
				break;
			}
		}

		if (found) {
			this.seq = this.seq > 100000 ? 0 : this.seq + 1;
			store.dispatch('updateOrder', data);
		}
	}

	_onChange(data) {
		if (!this._isMounted) {
			return;
		}
		const answer_data = {};

		if (!data) {
			return;
		}

		console.log('data = ', data);
		data.forEach(item => {
			console.log('item = ', item);
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
		console.log('item = ', item);
		const { data } = this.state;
		data.splice(hoverIndex, 0, item);
		this.saveData(item, hoverIndex, hoverIndex);
	}

	moveCard(dragIndex, hoverIndex) {
		const { data } = this.state;
		const dragCard = data[dragIndex];
		this.saveData(dragCard, dragIndex, hoverIndex);
	}

	// eslint-disable-next-line no-unused-vars
	cardPlaceHolder(dragIndex, hoverIndex) {
		// Dummy
	}

	saveData(dragCard, dragIndex, hoverIndex) {
		const newData = update(this.state, {
			data: {
				$splice: [
					[dragIndex, 1],
					[hoverIndex, 0, dragCard]
				]
			}
		});
		console.log('newData = ', newData);
		this.setState(newData);
		store.dispatch('updateOrder', newData.data);
	}

	getElement(item, index) {
		console.log('in getElement item = ', item);
		const SortableFormElement = SortableFormElements[item.element];
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
		let classes = this.props.className;
		if (this.props.editMode) {
			classes += ' is-editing';
		}
		const data = this.state.data.filter(x => !!x);
		console.log('data = ', data);
		const items = data.map((item, index) =>
			this.getElement(item, index)
		);
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
