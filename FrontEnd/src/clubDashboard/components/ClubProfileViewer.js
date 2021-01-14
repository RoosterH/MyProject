import React, { useState, useContext, useEffect } from 'react';

import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { ClubAuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './clubProfileViewer.css';

const ClubProfileViewer = props => {
	const clubAuthContext = useContext(ClubAuthContext);
	const clubId = clubAuthContext.clubId;
	const clubName = clubAuthContext.clubName;
	const {
		isLoading,
		error,
		sendRequest,
		clearError
	} = useHttpClient();

	const [loadedProfileImage, setLoadedProfileImage] = useState();
	const [loadedDescription, setLoadedDescription] = useState();
	const [loadedSchedule, setLoadedSchedule] = useState();

	// this is for logo that comes separately
	const [loadedImage, setLoadedImage] = useState();
	useEffect(() => {
		const fetchClubProfile = async () => {
			try {
				const [
					responseData,
					responseStatus,
					responseMessage
				] = await sendRequest(
					process.env.REACT_APP_BACKEND_URL +
						`/clubs/profile/${clubId}`,
					'GET',
					null,
					{
						// adding JWT to header for authentication, JWT contains clubId
						Authorization: 'Bearer ' + clubAuthContext.clubToken
					}
				);
				setLoadedProfileImage(responseData.clubProfile.profileImage);
				setLoadedDescription(responseData.clubProfile.description);
				setLoadedSchedule(responseData.clubProfile.schedule);
				// club logo
				setLoadedImage(responseData.image);
			} catch (err) {}
		};
		fetchClubProfile();
	}, [
		clubId,
		setLoadedProfileImage,
		setLoadedDescription,
		setLoadedSchedule,
		setLoadedImage
	]);

	const [showDescription, setShowDescription] = useState(
		'btn collapsible minus-sign toggle-btn'
	);
	const toggleDescriptionButton = () => {
		if (showDescription === 'btn collapsible minus-sign toggle-btn') {
			setShowDescription('btn collapsible plus-sign toggle-btn');
		} else {
			setShowDescription('btn collapsible minus-sign toggle-btn');
		}
	};

	const [showSchedule, setShowSchedule] = useState(
		'btn collapsible minus-sign toggle-btn'
	);
	const toggleScheduleButton = () => {
		if (showSchedule === 'btn collapsible minus-sign toggle-btn') {
			setShowSchedule('btn collapsible plus-sign toggle-btn');
		} else {
			setShowSchedule('btn collapsible minus-sign toggle-btn');
		}
	};

	return (
		// React.Frgment connect multiple components
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && <LoadingSpinner asOverlay />}
			{/* render logo/club name */}
			<div className="event-pages eventtype-page">
				<section id="header" title="">
					<div className="section-container">
						<div className="logo-container ">
							<img src={loadedImage} alt={clubName} />
						</div>
						<div className="primary-info">
							<h3 className="header-title">{clubName}</h3>
						</div>
						<div className="clubname-container">
							From{' '}
							<a
								href="/"
								target="_blank"
								className="provider-clubname">
								{clubName}
							</a>
						</div>
					</div>
				</section>
				<p />
				{/* this section is for club profile image */}
				{/* Regitration container */}
				<div className="section-container">
					{/* event image on the left */}
					<div className="page-basic-container">
						<div className="clubimage-container">
							<img
								src={loadedProfileImage}
								alt={clubName}
								className="clubimage-container-img"
							/>
						</div>
					</div>
					{/* Blog posts on the right */}
					{/* <div className="registration-container">
						<div className="col-xs-12">
							<div className="clearfix">
								<RegistrationMSG />
							</div>
							<div className="section">
								<strong>
									{startDate} — {endDate}
								</strong>
								<br /> <br />
							</div>
							<div>
								<h3>{props.event.venue}</h3>
								<Image
									title={props.event.venue}
									alt={props.event.venue}
									src={require('../../shared/utils/png/GMapSmall.png')}
									onClick={() => openMapHandler()}
									onHoover
								/>
								<h4>{props.event.address}</h4>
							</div>
						</div>
						<div className="col-xs-12">
							{buttonName === 'REGISTER EVENT' && (
								<Link
									to={{
										pathname: `/events/newEntryManager/${props.event.id}`,
										state: {
											eventName: props.event.name
										}
									}}>
									<Button
										disabled={!openRegistration}
										size="small-orange">
										{buttonName}
									</Button>
								</Link>
							)}
							{buttonName === 'MODIFY ENTRY' && (
								<Link
									to={{
										pathname: `/events/editEntryManager/${props.event.id}`,
										state: {
											eventName: props.event.name
											// regClosed: !openRegistration
										}
									}}>
									<Button
										disabled={!openRegistration}
										size="small-orange">
										{buttonName}
									</Button>
								</Link>
							)}
							<div className="waitlist-msg">
								{userOnWaitlist && waitlistMSG}
							</div>
						</div>
					</div> */}
				</div>

				<div className="section-container">
					<div className="page-basic-container">
						<div className="about-description">
							<div className="toggle-section description">
								<div className="short-description">
									<div className="sub-heading">
										<a
											href="#description"
											data-toggle="collapse"
											onClick={toggleDescriptionButton}>
											About Club {'   '}
											<button
												type="button"
												className={showDescription}
												onClick={toggleDescriptionButton}></button>
										</a>
									</div>
									<div id="description" className="collapse show">
										<div
											dangerouslySetInnerHTML={{
												__html: loadedDescription
											}}></div>
										<br />
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* {props.event.courseMap && (
						<div className="courseMap-container">
							<div className="col-xs-12">
								<div className="section">
									<div className="coursemap-title">Course Map</div>
								</div>
								<div>
									<Image
										title={props.event.courseMap}
										alt={props.event.courseMap}
										src={
											// process.env.REACT_APP_ASSET_URL +
											// `/${props.event.courseMap}`
											props.event.courseMap
										}
										onClick={() => openCourseHandler()}
										onHoover
										className="courseMap"
									/>
								</div>
							</div>
						</div>
					)} */}
				</div>

				<div className="section-container">
					<div className="page-basic-container">
						<div className="about-description">
							<div className="toggle-section description">
								<div className="short-description">
									<div className="sub-heading">
										<a
											href="#instruction"
											data-toggle="collapse"
											onClick={toggleScheduleButton}>
											Event Schedule {'   '}
											<button
												type="button"
												className={showSchedule}
												onClick={toggleScheduleButton}></button>
										</a>
									</div>
									<div id="instruction" className="collapse show">
										<div
											dangerouslySetInnerHTML={{
												__html: loadedSchedule
											}}></div>
										<br />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="section-container">
					<div className="page-basic-container">
						<div className="page-footer"></div>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default ClubProfileViewer;
