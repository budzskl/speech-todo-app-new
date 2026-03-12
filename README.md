# Speech To-Do App - React + Flask
- This is a Voice controlled task management application.

## 0. dialogflow.json file required
- In order to have access to the designed Dialogflow intents, the dialogflow.json file is required. Please do not distribute or share this key, as it can shut down access to the intents.

## 1. Backend Installation : Python3, pip
- For Windows Users, Download Python from the [official website](https://www.python.org/downloads/). Ensure to select "Add Python to PATH" during installation.
- For Mac Users, install using Homebrew : `brew install python`
- Confirm installation by typing `python --version` and `pip --version` on Command Prompt

## 2. Frontend Installation : Nodejs and npm
- For Windows users, install [Node.js and npm LTS version](https://nodejs.org/en/download)
- For Mac users, using Homebrew `brew install node`
- Confirm installation by running `node -v` and `npm -v`

## 3. Set up Application Demo locally
- two terminals required, one for backend, one for frontend.
### a. Set up Backend
- For Mac users, open up a new terminal. For Windows users, open up a new terminal, but list options. Select `Git Bash`. This terminal will host the backend.
- When initially setting up the backend, run the script `./initial-backend.sh`. This script was made to simplify the setup, and specifically initializes the sql database for tasks.
- For any further running of the backend, since the sql database was setup, use the `./backend.sh` script. this reruns without initializing a new database.
### b. Set up Frontend
- For Mac users, open up a new terminal. For Windows users, open up a new terminal, but list options. Select `Git Bash`.
- To setup the frontend on any instance, use the script `./frontend.sh`. 
### NOTE: you need both the backend and frontend running simultanously to have the app functioning. The frontend will be hosted at `http://localhost:5173`, and the backend will be hosted on `http://localhost:5000`,  and to see data in the backend use `http://localhost:5000/todos`.

## Some resources used:
- [Web Speech API (for live transcribing)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
- [Google Dialogflow (for intent detection)](https://cloud.google.com/dialogflow/docs)
- [react-calendar (for calendar UI)](https://github.com/wojtekmaj/react-calendar)