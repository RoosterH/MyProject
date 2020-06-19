import React from 'react';

import './Card.css';

const Card = props => {
	return (
		<React.Fragment>
			<div className={`card ${props.className}`} style={props.style}>
				<h3> {props.title} </h3>
				{props.children}
			</div>
		</React.Fragment>
	);
};

export default Card;
