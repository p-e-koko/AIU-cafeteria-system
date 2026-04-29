# AIU Cafeteria Menu Suggestion and Feedback System Build Plan

## 1. Project Goal
Build a React-based web application that lets students, faculty, and staff view cafeteria menus, submit suggestions, rate meals, and provide structured feedback. Cafeteria administrators will use dashboards and reports to review feedback, approve suggestions, and make menu decisions based on data.

## 2. Current Stack
- Frontend: React 19 with Create React App
- Tooling: `react-scripts`, Jest, and Testing Library
- Entry points: `src/index.js`, `src/App.js`

## 3. Build Strategy
The app should be delivered in phases so the core user flow works early and analytics can be added later.

### Phase 1: Project Setup and Layout
- Replace the starter CRA screen with the cafeteria app shell.
- Create a consistent layout with a public user area and an admin area.
- Add navigation for menu, suggestions, feedback, summaries, and admin views.
- Update the page title, metadata, and branding in `public/index.html`.

### Phase 2: Authentication and Roles
- Add user registration and login screens.
- Store passwords using secure hashing on the backend.
- Add role-based access control for `Student`, `Staff`, and `Admin`.
- Restrict admin routes and admin actions to authorized users only.

### Phase 3: Menu Suggestions
- Build a suggestion form with dish name, meal type, and reason.
- Save each suggestion with user identity, timestamp, and status.
- Show a public suggestion list with filters for meal type and approval status.
- Add approve and reject actions for admins.

### Phase 4: Food Feedback and Ratings
- Build a feedback form for taste, portion size, freshness, price, service, and comments.
- Support 1-5 rating inputs for each category.
- Save feedback history per user and per meal.
- Show a feedback summary page for users and staff.

### Phase 5: Analytics and Dashboards
- Aggregate feedback into rating summaries by meal name.
- Build admin charts for average ratings, most requested dishes, and common complaints.
- Add reports for suggestions, feedback, and suggestion popularity.
- Include date ranges and basic filters for faster review.

### Phase 6: Monitoring and Accountability
- Log important actions such as registration, login, suggestion submission, feedback submission, approval, and rejection.
- Keep timestamps and user IDs for traceability.
- Add admin views for activity logs.

## 4. Core Data Objects
- User
  - Id, name, email, hashed password, role, registration date
- Menu Suggestion
  - Id, dish name, meal type, description, submitted by, submission date, status
- Food Feedback
  - Id, user id, meal name, taste, portion, freshness, price, service, comment, submission date
- Rating Summary
  - Meal name, average category scores, total reviews
- Activity Log
  - Log id, user id, action type, timestamp, description

## 5. Key Screens
- Landing page
- Register page
- Login page
- User dashboard
- Submit suggestion form
- Submit feedback form
- Public suggestions list
- Feedback summary page
- Admin dashboard
- Admin suggestion review page
- Admin feedback analytics page
- Activity logs page

## 6. Functional Requirements
- Users can register, log in, and access features based on role.
- Users can submit menu suggestions and food feedback.
- Users can view public suggestions and feedback summaries.
- Admins can review, approve, or reject suggestions.
- Admins can view reports, charts, and activity logs.

## 7. Non-Functional Targets
- Usability: users should complete feedback submission in under 1 minute.
- Performance: page loads and submissions should complete in under 2 seconds under normal usage.
- Reliability: backups should be scheduled to reduce data loss risk.
- Security: passwords must be hashed and admin routes protected by RBAC.
- Supportability: modules should be separated so features can be updated without breaking others.

## 8. Suggested Implementation Order
1. Build the app layout and navigation.
2. Create mock data and static pages for suggestions and feedback.
3. Add forms and local state handling.
4. Add authentication and role-based route protection.
5. Connect forms and dashboards to a backend API.
6. Add analytics, charts, and admin review workflows.
7. Add logging, testing, and final polish.

## 9. Definition of Done
- Users can register, log in, submit suggestions, and submit feedback.
- Admins can review suggestions and view analytics.
- The UI is responsive and easy to use on desktop and mobile.
- Major actions are traceable through logs.
- Core flows are covered by tests.

## 10. Short-Term Milestone Plan
- Milestone 1: App shell, navigation, and placeholder pages
- Milestone 2: Suggestion and feedback forms with local validation
- Milestone 3: Role-based access and admin review screens
- Milestone 4: Analytics dashboard and report views
- Milestone 5: Logging, testing, and deployment preparation