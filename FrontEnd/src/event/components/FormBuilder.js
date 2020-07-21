import React from 'react';

import FormBuilder from 'react-form-builder2';

import './FormBuilder.css';
import '../../shared/scss/application.scss';
import '../../shared/scss/form-builder-form.scss';
import '../../shared/scss/form-builder.scss';
// import '../../shared/scss/react-bootstrap-slider.scss';
import '../../shared/scss/react-date-picker.scss';
import '../../shared/scss/react-draft.scss';
import '../../shared/scss/react-select.scss';
import '../../shared/scss/react-star-rating.scss';
import '../../shared/scss/variables.scss';

const CustomForm = () => {
	return (
		<div className="formbuilder-container">
			<FormBuilder.ReactFormBuilder />
		</div>
	);
};

export default CustomForm;

// jquery setup
// import $ from 'jquery';
// import React, { createRef, Component } from 'react';
// import ReactDOM from 'react-router-dom';

// window.jQuery = $;
// window.$ = $;

// require('jquery-ui-sortable');
// require('formBuilder');

// jquery FormBuilder
// class CustomForm extends Component {
// 	fb = createRef();
// 	componentDidMount() {
// 		$(this.fb.current).formBuilder();
// 	}

// 	render() {
// 		return <div id="fb-editor" ref={this.fb} />;
// 	}
// }
// export default CustomForm;
