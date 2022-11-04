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



#### What’s contained in each file you created.

settings.py - Adjusted settings for PostgreSQL, heroku and decoupling sensitive data.

**Dashboard App:**

- models.py - Models for coins, users, watchlist, Coinlist and a ModelForm to add new coins.

- views.py - API views for coins on DB and 

- urls.py - Routes for html pages and API endpoints

- **Jobs folder:** 

  - jobs.py -  updates the entries in the database for all coins and lists of coins from the API
  - updater.py - Initiates the jobs that update the database based on specified time intervals.

- **Static files:**

  - table.js - Main JavaScript file:
    - API calls for up to date prices on banner
    - Appending, sorting, event handling for tables
    - Live search display
    - Add and remove coins from watchlist
  - chart.js - Fetches data and draws all charts, either on page load, resize or modal trigger.
  - style.css - Media queries for responsive chart resizing 

- **Templates:**

  - index.html - Home page and table outline
  - watchlist.html - Similar to homepage with some small adjustments 

- **Heroku files:**

  - A requirements.txt, Procfile, runtime.txt were created for Heroku deployment.

  

#### How to run your application

The app is running at: https://satstobits.herokuapp.com/ 

#### Demo account:
Username: Tom
Password: Tom123456!
