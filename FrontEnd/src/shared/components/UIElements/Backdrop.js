import React from 'react';
import ReactDOM from 'react-dom';

import './Backdrop.css';

// create a backdrop hook that will be be rendered as a transparent background
// with a callback to
const Backdrop = props => {
	const content = <div className='backdrop' onClick={props.onClick}></div>;

	return ReactDOM.createPortal(
		content,
		document.getElementById('backdrop-hook')
	);
};

export default Backdrop;
