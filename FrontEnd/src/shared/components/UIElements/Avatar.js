import React, { useEffect, useState } from 'react';

import './Avatar.css';

const Avatar = props => {
	const [className, setClassName] = useState('watermark');
	useEffect(() => {
		if (props.publishDescription === 'RETIRED') {
			setClassName('watermark-retired');
		}
	}, [props.publishDescription, setClassName]);

	return (
		// props.className determines which css to use
		<div className={`${props.className}`} style={props.style}>
			<figure className={`${className}`}>
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
				{props.signup && !props.waitlist && (
					<figcaption className="watermark-text">
						{props.signupDescription}
					</figcaption>
				)}
				{!props.signup && props.waitlist && (
					<figcaption className="watermark-text">
						{props.waitlistDescription}
					</figcaption>
				)}
				{props.signup && props.waitlist && (
					<figcaption className="watermark-text">
						{props.signupwaitlistDescription}
					</figcaption>
				)}
			</figure>
		</div>
	);
};

export default Avatar;
