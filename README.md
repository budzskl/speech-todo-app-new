# Demo Project with Python Flask and React

This document assumes that you are starting from a *blank slate*. Feel free to skip steps if you have certain software installed prior. 

## 0. Creating your own Project Repository
- Click on **Fork** to create your own repo and then click **Create Fork**.

## 1. Install VSCode and Git

### a. Install VSCode
- Download VSCode from the [official website](https://code.visualstudio.com/download)
- Install Python extension from the left navigation bar

### b. Install Git and set up GitHub
- Create an account on [GitHub](https://github.com/)
- Install Git from the [official website](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) 
  - **For Mac users**, install [Homebrew](https://brew.sh/) and then type `brew install git` on the terminal. 
- After installation, open Git Bash/(Terminal for Mac users) from your Start menu and type `git --version` to confirm
- Set up your username and email globally through these commands:
  - `git config --global user.name "Your Name"`
  - `git config --global user.email "your.email@example.com"`

- To work with GitHub on VSCode install GitHub Repositories from the Extensions tab and you'll see a **Source Control** icon on your navigation tab an an option to clone Git repository etc.

## 2. Backend Installation : Python3, pip
- For Windows Users, Download Python from the [official website](https://www.python.org/downloads/). Ensure to select "Add Python to PATH" during installation.
- For Mac Users, install using Homebrew : `brew install python`
- Confirm installation by typing `python --version` and `pip --version` on Command Prompt

## 3. Frontend Installation : Nodejs and npm
- For Windows users, install [Node.js and npm LTS version](https://nodejs.org/en/download)
- For Mac users, using Homebrew `brew install node`
- Confirm installation by running `node -v` and `npm -v`

## 4. Set up Flask+React Demo locally
- Go to your Forked Repository on Github, Click on green **Code** button and copy the URL (using HTTPS or SSH)
- Open up VS Code and in the home page or under Source Control, click on **Clone a Repository**. Choose a directory to store your project on your local computer. You can also do the same from the *command line* using `git clone REPO_URL`
- You will now see a local version of all the files/source code from GitHub. 
### a. Set up Backend
- Move into the backend directory - `cd flask-backend` 
- Create a new virtual environment - `python -m venv env`
- Activate the virtual environment
    - For Windows : `.\env\Scripts\activate`
    - For Mac : `source env/bin/activate`
- You will now see a (venv) infront of your command line
- To install all dependencies and packages, run `pip install -r requirements.txt`
- **Note:** To deactivate, run `env\Scripts\deactivate.bat`
- Run `cd app` and `python init_db.py` to initialize your database (you will see a database.db pop up)
- Run `set FLASK_APP=server.py` to set the flask app
- Run the flask backend in debug mode for automatic reloading : `flask --app server.py --debug run`
- Your flask server will now be running on `localhost:PORT`! You can look at the terminal for the port number
- **Note for Mac users-** if your getting an error `no module named flask_cors`, reactivate your environment while in env by running `source env/bin/activate`

### b. Set up Frontend
- Open up a new terminal + button on top right of the terminal and run `cd react-frontend`
- Install all packages by running `npm install`
- To run the react frontend, `npm run dev`
- Your react app is now running on `localhost:PORT`! You can follow the link from the terminal for the port number.

## Notes about Demo Project
- This app is an oversimplified version of a **sunrise quality calculator**. You interact with the react frontend, which calls the backend which calls a third party API (OpenWeatherMap), retrieves data and displays relevant information in a nice manner. 
- There is also an sqlite database implemented to store data like states and country names that is also retrieved using the backend API.
- *Its main purpose is to provide an intro to a simple full stack app.* Your fullstack group project will be/should be much more complex!
- OpenWeatherMap requires an API key and provides a **free tier with 1000 calls a day**. 
- To *actually* get the app working, set up an account on [OpenWeatherMap's official website](https://openweathermap.org/api) and subscribe to the One Call API 3.0 to get access an API key and make requests.
- Here is the [official API documentation](https://openweathermap.org/api/one-call-3).
- Under flask-backend>app create a file named **.env** with the contents with the following contents : `WEATHER_API_KEY=<insert your API key here>`. .env files are to hold secrets like your API keys and should be ignored by git. (as sample .env is available)

## Designing User Interface
I like starting from Figma when I build web apps. This is not a UI/UX course but if you are interested here is the [Figma Design](https://www.figma.com/design/9wx5ambCgODaaJMdX5H1c6/rise-and-shine?node-id=0-1&t=SF738ptgADYMy1qQ-1) I created for my frontend. (also, [coolors](https://coolors.co/) for color palettes and [dribble](https://dribbble.com/) for design ideas)

## Some resources I used:
This can help you start your own frontend and backend from a blank repository
- [Flask Intro](https://python-adv-web-apps.readthedocs.io/en/latest/flask.html)
- [Flask Tutorial](https://flask.palletsprojects.com/en/stable/tutorial/layout/)
- [Building a REST API with Flask](https://auth0.com/blog/developing-restful-apis-with-python-and-flask/)
- [Setting up a SQL Database with Python Flask](https://www.digitalocean.com/community/tutorials/how-to-use-an-sqlite-database-in-a-flask-application)
- [Set up your React Project with Vite](https://vite.dev/guide/)





