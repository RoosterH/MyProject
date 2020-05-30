import React from 'react';

import Button from '../../shared/components/FormElements/Button';

const Clubs = () => {
	return (
		<React.Fragment>
			<Button to="/clubs/auth">Club Login</Button>
			<Button to="/clubs/signup">Club Signup</Button>
		</React.Fragment>
	);
};

export default Clubs;
