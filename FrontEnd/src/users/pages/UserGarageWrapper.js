import React from 'react';
import { useParams } from 'react-router-dom';

import UserGarage from './UserGarage';

const UserGarageWrapper = () => {
	let userId = useParams().userId;

	return <UserGarage userId={userId} />;
};

export default UserGarageWrapper;
