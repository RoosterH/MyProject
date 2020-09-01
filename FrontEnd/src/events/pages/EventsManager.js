import React, { useContext, useEffect, useState } from 'react';
import './EventsManager.css';

const EventsManager = () => {
	return (
		<React.Fragment>
			<div className="dashboard-nav">
				<ul>
					<li className="dashboard-nav-menu dropdown" uib-dropdown="">
						<a
							ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.biz.name)}"
							ng-click="$ctrl.goTo($ctrl.routes.bizSetUpChannel.name)"
							href="javascript:void(0);"
							className="">
							<i
								className="fa fa-sort-desc pull-right"
								aria-hidden="true"></i>{' '}
							Manage Listing
						</a>

						<ul uib-dropdown-menu="" className="dropdown-menu">
							<li className="dashboard-nav-menu-item">
								<a
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.bizOverview.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.bizOverview.name)"
									href="javascript:void(0);"
									className="">
									Business Overview
								</a>
							</li>
							<li className="dashboard-nav-menu-item">
								<a
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.bizLogoManager.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.bizLogoManager.name)"
									href="javascript:void(0);">
									Photo Manager
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									ng-if="!$ctrl.showUpgradeMsg"
									href="javascript:void(0);"
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.usersList.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.usersList.name)"
									className="ng-scope">
									Manage Your Team
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a href="/providers/74533/provider_imports">Import</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									href="javascript:void(0);"
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.bizPaymentOpts.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.bizPaymentOpts.name)"
									className="">
									Billing
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									ng-if="!$ctrl.isFreeProvider"
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.aboutbiz.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.aboutbiz.name)"
									href="javascript:void(0);"
									className="ng-binding ng-scope">
									About MarketingHero
								</a>
							</li>
						</ul>
					</li>
					<li className="dashboard-nav-menu dropdown" uib-dropdown="">
						<a
							href="javascript:void(0);"
							ng-click="$ctrl.goTo($ctrl.routes.activitiesAndSessions.name)"
							ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.activities.name)}"
							className="active-nav">
							<i
								className="fa fa-sort-desc pull-right"
								aria-hidden="true"></i>
							Activities &amp; Sessions
						</a>

						<ul uib-dropdown-menu="" className="dropdown-menu">
							<li className="dashboard-nav-menu-item">
								<a
									href="javascript:void(0);"
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.activitiesList.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.activitiesList.name)"
									className="">
									Activity Manager
								</a>
							</li>
							<li className="dashboard-nav-menu-item">
								<a
									href="javascript:void(0);"
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.bizSessions.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.bizSessions.name)"
									ng-if="$ctrl.business &amp;&amp; $ctrl.business.has_activity"
									className="ng-scope">
									Sessions &amp; Spots Manager
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.bizLocations.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.bizLocations.name)"
									href="javascript:void(0);">
									Locations
								</a>
							</li>
							<li className="dashboard-nav-menu-item">
								<a href="/providers/74533/discounts">Discounts</a>
							</li>
							<li className="dashboard-nav-menu-item">
								<a
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.bizAdditionalProviderFees.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.bizAdditionalProviderFees.name)"
									href="javascript:void(0);">
									Additional Fees
								</a>
							</li>
							<li className="dashboard-nav-menu-item">
								<a
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.bizPaymentPlanList.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.bizPaymentPlanList.name)"
									href="javascript:void(0);">
									Payment Plan
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									href="javascript:void(0);"
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.manageFormsAndPolicies.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.refundPolicyList.name)">
									Manage Forms &amp; Policies
								</a>
							</li>
						</ul>
					</li>
					<li className="dashboard-nav-menu dropdown" uib-dropdown="">
						<a
							ng-click="$ctrl.goTo($ctrl.routes.regAndPaymentChannel.name)"
							ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.registrationAndPayment.name)}">
							<i
								className="fa fa-sort-desc pull-right"
								aria-hidden="true"></i>
							Registrations &amp; Payments
						</a>

						<ul uib-dropdown-menu="" className="dropdown-menu">
							<li className="dashboard-nav-menu-item">
								<a
									href="/registrations/provider_list?id=74533&amp;enrollment_status=All&amp;ongoing=true"
									ng-if="!$ctrl.showUpgradeMsg"
									className="ng-scope">
									Registration Reports
								</a>
							</li>
							<li className="dashboard-nav-menu-item">
								<a
									href="/registrations/provider_list?id=74533&amp;enrollment_status=Wait+Listed&amp;ongoing=true"
									ng-if="!$ctrl.showUpgradeMsg"
									className="ng-scope">
									Waitlist
								</a>
							</li>
							<li
								className="dashboard-nav-menu-item ng-scope"
								ng-if="!$ctrl.showUpgradeMsg">
								<a href="/registrations/provider_list?id=74533&amp;enrollment_status=Wait+Listed&amp;ongoing=true&amp;pending=true">
									Pending Waitlist Invitations
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									href="/registrations/payment_summary?id=74533"
									ng-if="!$ctrl.showUpgradeMsg"
									className="ng-scope">
									Payment Reports
								</a>
							</li>
							<li className="dashboard-nav-menu-item">
								<a
									ng-if="!$ctrl.showUpgradeMsg"
									href="/registrations/invoices?id=74533"
									className="ng-scope">
									Pending Invoices
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.detailAnalytics.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.searchViews.name)"
									href="javascript:void(0);">
									Detailed Analytics
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.userCredits.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.userCredits.name)"
									href="javascript:void(0);">
									User Credits
								</a>
							</li>
						</ul>
					</li>
					<li className="dashboard-nav-menu dropdown" uib-dropdown="">
						<a
							ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.communication.name)}"
							ng-click="$ctrl.goTo($ctrl.routes.communicationChannel.name)"
							className="">
							<i
								className="fa fa-sort-desc pull-right"
								aria-hidden="true"></i>
							Communication
						</a>

						<ul uib-dropdown-menu="" className="dropdown-menu">
							<li className="dashboard-nav-menu-item">
								<a
									href="javascript:void(0);"
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.sendEmailBlast.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.sendEmailBlast.name, {send_email: true})"
									ng-if="!$ctrl.isSHorAdmin"
									className="ng-scope">
									Send Email
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									href="javascript:void(0);"
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.sendEmailBlast.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.sendEmailBlast.name)"
									ng-if="!$ctrl.isSHorAdmin"
									className="ng-scope">
									Message History
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									href="/contact_providers/provider_list?provider_id=74533"
									ng-if="!$ctrl.showUpgradeMsg"
									className="ng-scope">
									Customer Inquiries
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									href="javascript:void(0);"
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.emailHeaderFooter.name)}"
									ng-if="!$ctrl.showUpgradeMsg"
									ng-click="$ctrl.goTo($ctrl.routes.emailHeaderFooter.name)"
									className="ng-scope">
									Email Header/Footer
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									href="javascript:void(0);"
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.askForReviews.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.askForReviews.name)">
									Ask for Reviews
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a href="/providers/74533/tax_receipts/choose">
									Send Tax Receipts
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									href="javascript:void(0);"
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.askForVotes.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.askForVotes.name)">
									Ask for Votes
								</a>
							</li>
						</ul>
					</li>
					<li className="dashboard-nav-menu dropdown" uib-dropdown="">
						<a
							ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.tools.name)}"
							ng-click="$ctrl.goTo($ctrl.routes.toolsChannel.name)">
							<i
								className="fa fa-sort-desc pull-right"
								aria-hidden="true"></i>
							Tools for Your Website
						</a>

						<ul uib-dropdown-menu="" className="dropdown-menu">
							<li className="dashboard-nav-menu-item">
								<a
									ng-if="$ctrl.showUpgradeMsg || $ctrl.showUpgradeToMH"
									href="javascript:void(0);"
									ng-click="$ctrl.goTo($ctrl.routes.onlineRegChannel.name)"
									className="ng-scope">
									Online Registration Widget
								</a>
							</li>
							<li className="dashboard-nav-menu-item">
								<a href="/providers/dashboard_schedule_widget?provider_id=74533&amp;active_tab=review_widget">
									Testimonials Widget
								</a>
							</li>
							<li className="dashboard-nav-menu-item">
								<a href="/providers/dashboard_schedule_widget?provider_id=74533&amp;active_tab=rate_us">
									Review Us Widget
								</a>
							</li>
							<li className="dashboard-nav-menu-item separate-section">
								<a
									ng-if="$ctrl.showUpgradeMsg || $ctrl.showUpgradeToMH"
									href="javascript:void(0);"
									ng-className="{'active-nav': $ctrl.isRouteActive($ctrl.routes.brandedLink.name)}"
									ng-click="$ctrl.goTo($ctrl.routes.brandedLinkUpgradeChannel.name)"
									className="ng-scope">
									Branded Link
								</a>
							</li>
						</ul>
					</li>
				</ul>
			</div>

			{/* THE FOLLOWING IS GOOD */}
			<div className="eventmanager">
				<div className="dashboard-tabs activity-sections">
					<ul className="nav nav-tabs">
						<li>
							<button className="btn btn-default tab-link">
								Description
							</button>
						</li>
						<li>
							<button className="btn btn-default tab-link">
								Photos
							</button>
						</li>
						<li>
							<button className="btn btn-default tab-link active">
								Sessions
							</button>
						</li>
						<li>
							<button className="btn btn-default tab-link">
								Video
							</button>
						</li>
					</ul>
				</div>
			</div>
		</React.Fragment>
	);
};

export default EventsManager;
