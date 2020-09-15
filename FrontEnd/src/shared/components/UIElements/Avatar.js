import React from 'react';

import './Avatar.css';

const Avatar = props => {
	return (
		// props.className determines which css to use
		<div className={`${props.className}`} style={props.style}>
			<figure className="watermark">
				<img
					src={props.image}
					alt={props.alt}
					style={{ width: props.width, height: props.width }}
				/>
				{/* for pulished events and all cars */}
				{props.published && (
					<figcaption className="watermark-text">
						{props.publishDescription}
					</figcaption>
				)}
				{/* for enrolled event */}
				{props.signup && (
					<figcaption className="watermark-text">
						{props.signupDescription}
					</figcaption>
				)}
			</figure>
		</div>
	);
};

export default Avatar;
