import React from 'react';
import ReactDOM from 'react-dom';
// 3rd party
import { CSSTransition } from 'react-transition-group';

import './SideDrawer.css';

const SideDrawer = props => {
	/* CSSTransition does animation for sideDrawer, use props.show to control when to mountOnEnter/
	unmountOnExit "side-drawer" */
	const content = (
		<CSSTransition
			in={props.show}
			timeout={200}
			classNames="slide-in-left"
			mountOnEnter
			unmountOnExit>
			<aside className="side-drawer" onClick={props.onClick}>
				{props.children}
			</aside>
		</CSSTransition>
	);

	// using portal because we want to render SideDrawer outside of the root
	// meaning we want to make it outside of the component tree
	// createPortal renders content @ where sidedrawer-hook is (index.html)
	return ReactDOM.createPortal(
		content,
		document.getElementById('sidedrawer-hook')
	);
};

export default SideDrawer;
