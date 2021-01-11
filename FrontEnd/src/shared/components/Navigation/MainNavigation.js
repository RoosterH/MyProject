import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import MainHeader from './MainHeader';
import NavLinks from './NavLinks';
import SideDrawer from './SideDrawer';
import Backdrop from '../UIElements/Backdrop';
import { ClubAuthContext } from '../../context/auth-context';

import './MainNavigation.css';

const MainNavigation = props => {
	const clubAuthContext = useContext(ClubAuthContext);
	const [isClubLoggedIn, setIsClubLoggedIn] = useState(false);
	const [clubName, setClubName] = useState('');
	/* 
        create drawerIsOpen state drawerIsOpen is a var, setDrawIsOpen is the function that updates drawIsOpen when user hits 'main-navigation__menu-btn' call openDrawerHandler, once drawerIsOpen Backdrop and SideDrawer will be kicied in. In SideDrawer, it calls CSSTransition to mount/unmount "side-drawer" 
     */
	const [drawerIsOpen, setDrawerIsOpen] = useState(false);

	const openDrawerHandler = () => {
		setDrawerIsOpen(true);
	};

	const closeDrawerHandler = () => {
		setDrawerIsOpen(false);
	};

	useEffect(() => {
		if (clubAuthContext.isClubLoggedIn) {
			setIsClubLoggedIn(true);
			setClubName(clubAuthContext.clubName);
		} else {
			setIsClubLoggedIn(false);
			setClubName('');
		}
	}, [clubAuthContext]);

	return (
		// <React.Fragment> is a wrapper helps solve multiple return issues.
		// Because we have 2 return values <SideDrawer> and <MainHeader>
		<React.Fragment>
			{/* only render SideDrawer when drawerIsOpen */}
			{drawerIsOpen && <Backdrop onClick={closeDrawerHandler} />}
			<SideDrawer show={drawerIsOpen} onClick={closeDrawerHandler}>
				{/* main-navigation__drawer-nav is for mobile screen */}
				<nav className="main-navigation__drawer-nav">
					<NavLinks />
				</nav>
			</SideDrawer>

			<MainHeader>
				{/* <div className="header-image"> */}
				<button
					className="main-navigation__menu-btn"
					onClick={openDrawerHandler}>
					<span />
					<span />
					<span />
				</button>
				<h1 className="main-navigation__menu_title">
					{!isClubLoggedIn && (
						// <img src={COURSEHEADER} alt="header" width="800" height="100" />
						<Link to="/" style={{ textDecoration: 'none' }}>
							MYSeatTime
						</Link>
					)}
					{isClubLoggedIn && 'MYSeatTime'}
				</h1>
				{/* main-navigation__head is for desktop screen that only shows >= 768px */}
				<nav className="main-navigation__header-nav">
					<NavLinks />
				</nav>
				{/* </div> */}
			</MainHeader>
		</React.Fragment>
	);
};

export default MainNavigation;
