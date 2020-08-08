import React from 'react';

import './Image.css';

const Image = props => {
	return (
		<img
			src={props.src}
			alt={props.alt}
			type={props.type}
			onClick={props.onClick}
			className="image"></img>
	);
};

export default Image;
