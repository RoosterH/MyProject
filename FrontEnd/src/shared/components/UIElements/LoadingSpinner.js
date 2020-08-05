import React from 'react';

import './LoadingSpinner.css';

const LoadingSpinner = props => {
	return (
		// <div
		// 	className={`${props.asOverlay && 'loading-spinner__overlay'}`}>
		// 	<div className="lds-dual-ring"></div>
		// </div>
		// use Bootstrap spinner
		<div className="spinner-border text-success" role="status">
			<span className="sr-only">Loading...</span>
		</div>
	);
};

export default LoadingSpinner;
