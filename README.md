
# Baseball Stats App

This is a web application that allows users to view, edit, and read descriptions for baseball players based on their stats.

## Features

- View a list of baseball players sorted by their number of hits.
- Click on a player to view detailed stats and a description.
- Edit player information and update their details.
- Generate LLM-generated descriptions for players using the OpenAI API.

## Project Structure

baseball-stats-app/
├── backend/
│   ├── app.py # Main Flask application file
│   ├── models.py # Database models
│   ├── routes.py # API route definitions
│   ├── requirements.txt # Python dependencies
│   ├── .env # Environment variables (including OpenAI API key)
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx # Main React component
│   │   ├── components/ # Reusable React components
│   │   ├── pages/ # React page components
│   │   ├── theme.ts # Custom MUI theme configuration
│   ├── public/
│   │   ├── index.html # Main HTML file
│   ├── package.json # Frontend dependencies and scripts
│   ├── tsconfig.json # TypeScript configuration
│
├── db/
│   ├── migrations/ # Database migrations
│   ├── setup.sql # SQL setup script
│
├── instance/
│   ├── config.py # Instance-specific configuration
│
├── migrations/
│   ├── versions/ # Versioned migrations for Alembic
│
├── venv/ # Python virtual environment for backend
│
├── .gitignore # Git ignore file
│
├── README.md # Project documentation

## Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/starin-technologies/baseball-stats-app.git
   ```

2. **Backend Setup:**
   - Navigate to the backend directory:
     ```bash
     cd baseball-stats-app/backend
     ```
   - Create a virtual environment:
     ```bash
     python3 -m venv venv
     ```
   - Activate the virtual environment:
     - On macOS/Linux:
       ```bash
       source venv/bin/activate
       ```
     - On Windows:
       ```bash
       venv\Scriptsctivate
       ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Set up the database:
     ```bash
     flask db upgrade
     ```
   - Start the backend server:
     ```bash
     flask run
     ```

3. **Frontend Setup:**
   - Navigate to the frontend directory:
     ```bash
     cd baseball-stats-app/frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the frontend development server:
     ```bash
     npm start
     ```

4. **Database Setup:**
   - Run the setup SQL script to initialize the database schema and data:
     ```bash
     psql -U yourusername -d yourdatabase -f setup.sql
     ```

## Usage

- Visit `http://localhost:3000` to access the frontend.
- Use the UI to view, edit, and generate descriptions for baseball players.
- Changes to player data will automatically generate a new LLM description.

## Technologies Used

- **Frontend:** React, Material-UI (MUI), TypeScript
- **Backend:** Flask, SQLAlchemy, Flask-Migrate
- **Database:** PostgreSQL
- **LLM Integration:** OpenAI API

