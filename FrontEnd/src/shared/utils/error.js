import React from 'react';

import Card from '../../shared/components/UIElements/Card';
import Image from '../../shared/components/UIElements/Image';
import OFFCOURSE from './OffCourse.jpg';

const Error = () => {
	return (
		<div className="center_error">
			<Card className="error_img">
				<h2>Oops, the page you requested was not found!</h2>
				<h2>Please go back to the course.</h2>
				<a href="/">
					<Image src={OFFCOURSE} link="/">
						Create a new event
					</Image>
				</a>
			</Card>
		</div>
	);
};

export default Error;
