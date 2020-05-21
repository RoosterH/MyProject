import React from 'react';

import './MainHeader.css';

const MainHeader = props => {
	// header is jsx. props.children is the placeholder for the content between the opening and closing tag
	// of your own component defined in MainNavigation.js
	return <header className='main-header'>{props.children}</header>;
};

export default MainHeader;
