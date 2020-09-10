import React from 'react';

import './Image.css';

const Image = props => {
	let imageClass = props.className ? props.className : 'image';
	return (
		<img
			src={props.src}
			alt={props.alt}
			type={props.type}
			onClick={props.onClick}
			className={imageClass}></img>
	);
};

export default Image;
