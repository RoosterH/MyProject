import React from 'react';

import './Avatar.css';

const Avatar = props => {
	return (
		// props.className determines which css to use
		<div className={`${props.className}`} style={props.style}>
			<img
				src={props.image}
				alt={props.alt}
				style={{ width: props.width, height: props.width }}
			/>
		</div>
	);
};

export default Avatar;
