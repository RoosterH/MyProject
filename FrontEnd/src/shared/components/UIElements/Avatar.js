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
				{props.published && (
					<figcaption className="watermark-text">
						Published
					</figcaption>
				)}
			</figure>
		</div>
	);
};

export default Avatar;
