## The project is a **cryptocurrency tracker with scheduled data collection from different APIs**


The system was designed to minimize external API call as to not exceed the free use of the specific APIs.



Several **NEW features** have not been implemented/required for previous projects:

- Project is using **PostgresSQL** as the database.

- It pulls data from 3 **external APIs**

  - Server side functions are used through **APScheduler** to collect data on an hourly and daily basis. from the Coingecko API and to then update the Postgres database.

- Project was developed in a **virtual environment** and is hosted on **Heroku**.

- It has a **search feature** with a **live result** display.

- Data is displayed using **sortable tables** and google **graphs**.

- All features are **responsive**.

- Sensitive information like Secret Keys were seperated for the project for better security.



Other features that are similar to previous projects:

- Users if logged in can add and remove items from a watchlist, add new items to the database.
