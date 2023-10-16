
## Facility Monitor

Facility Monitor is a DHIS2 app that helps monitor orgunits and their users. It provides a variety of features, including:

**Usage reports**: Facility Monitor can generate usage reports for each orgunit and user. These reports show how often the orgunit or user has logged in, what data they have entered, and what reports they have generated.

**Inactive user listing**: Facility Monitor can list all inactive users, i.e., users who have not logged in for a certain period of time. This information can be used to identify users who need to be removed from the system.

Facility Monitor can be used by a variety of stakeholders, including:

**System administrators**: System administrators can use Facility Monitor to monitor the overall usage of the DHIS2 system and to identify any potential problems.

**Program managers**: Program managers can use Facility Monitor to monitor the usage of their programs and to identify any areas where data collection or reporting needs to be improved.
Superusers: Superusers can use Facility Monitor to monitor the usage of their orgunits and to identify any inactive users.

Example usage cases:

- A system administrator can use Facility Monitor to identify orgunits that have not logged in for a certain period of time. This information can be used to investigate any potential problems with the orgunit's network connection or user accounts.
- A program manager can use Facility Monitor to identify users who have not entered data for their program for a certain period of time. This information can be used to follow up with these users to ensure that they are reporting their data accurately and on time.
- A superuser can use Facility Monitor to identify inactive users in their orgunit. This information can be used to remove these users from the system and to free up user accounts for new users.

Benefits of using Facility Monitor:

- Improved visibility into orgunit and user activity
- Reduced risk of data loss and corruption
- Improved efficiency of system administration

This project was bootstrapped with [DHIS2 Application Platform](https://github.com/dhis2/app-platform).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner and runs all available tests found in `/src`.<br />

See the section about [running tests](https://platform.dhis2.nu/#/scripts/test) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
A deployable `.zip` file can be found in `build/bundle`!

See the section about [building](https://platform.dhis2.nu/#/scripts/build) for more information.

### `yarn deploy`

Deploys the built app in the `build` folder to a running DHIS2 instance.<br />
This command will prompt you to enter a server URL as well as the username and password of a DHIS2 user with the App Management authority.<br/>
You must run `yarn build` before running `yarn deploy`.<br />

See the section about [deploying](https://platform.dhis2.nu/#/scripts/deploy) for more information.

## Learn More

You can learn more about the platform in the [DHIS2 Application Platform Documentation](https://platform.dhis2.nu/).

You can learn more about the runtime in the [DHIS2 Application Runtime Documentation](https://runtime.dhis2.nu/).

To learn React, check out the [React documentation](https://reactjs.org/).
# facility_monitor
