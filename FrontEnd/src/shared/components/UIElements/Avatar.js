import React from 'react';

import './Avatar.css';

const Avatar = props => {
	console.log('classname = ', props.className);
	return (
		<div className={`avatar ${props.className}`} style={props.style}>
			<img
				src={props.image}
				alt={props.alt}
				style={{ width: props.width, height: props.width }}
			/>
		</div>
	);
};

export default Avatar;
