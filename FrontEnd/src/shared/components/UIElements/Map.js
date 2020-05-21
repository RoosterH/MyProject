import React, { useRef, useEffect } from 'react';

import './Map.css';

const Map = props => {
	const mapRef = useRef();

	// pull key of props and store in the const
	const { center, zoom } = props;

	// () => {} the function will be executed when one of the dependencies changes
	// []: array of the dependencies
	useEffect(() => {
		const map = new window.google.maps.Map(mapRef.current, {
			center: center,
			zoom: zoom,
		});

		new window.google.maps.Marker({ position: center, map: map });
	}, [center, zoom]);

	return (
		<div
			ref={mapRef}
			className={`map ${props.className}`}
			style={props.style}></div>
	);
};

export default Map;
