FrontEnd uses React

Known issues:

1. <Events> Need to make it work for event search
2. <Logout> Need to re-direct

Fixed issues:

1. ADD/EDIT EVENT startDate/endDate min and validators - fixed with moment
2. Need to support dynamic clubid when club login and direct to /:cid/events/ => using history

==================================================================================================================
API:
===========
NavLink
“/“ Main Page
“/users/auth” Driver Login
“/clubs/auth” Club Login

isClubLoggedIn
“/events/club/:cid” Club Events
“/clubs/events/new” Add Event
“/users/auth” Driver Login
“/clubs/auth” Club Login

Front end:
“/“ <Events />
“/events” <Events />
“/events/:id” <Event />
“/events/club/:clubId” <ClubEvents />
“/clubs/auth” <ClubAuth />
“/users/auth” <UserAuth />
“/error” <Error />

isClubLoggedIn:
“/“ <Events />
“/events/club/:clubId” <ClubEvents />
“/events/:id” <Event />
“/clubs/events/new” <NewEvent />
“/events/update/:id” <UpdateEvent />
“/error” <Error />

Back end:
/api/events
GET
'/' eventsController.getAllEvents
'/date/' eventsController.getEventsByDate
'/:eid' eventsController.getEventById
'/club/:cid' eventsController.getEventsByClubId

/api/clubs
GET
'/' clubsController.getAllClubs
'/:cid' clubsController.getClubById
POST
'/signup' clubsController.createClub
'/login' clubsController.loginClub
PATCH
'/:cid' clubsController.updateClub
DELETE
'/:cid' clubsController.deleteClub

/api/users

==================================================================================================================
Work flow:
===========
FrontEnd
<Clubs> http request => <ClubsList> => <ClubItem> link to =>  
<ClubEvents> http request => <EventsList> => <EventsItem> link to =>
<Event> http request => <EventItem>

xxxxx <Events> Need to make it work for event search
