# Baseball Stats App

This is a web application that allows users to view, edit, and read descriptions for baseball players based on their stats.
![image](https://github.com/user-attachments/assets/cea56d33-0664-4a6a-ab0e-6d6d142c88c8)

## Features

- View a list of baseball players sorted by their number of hits.
- Click on a player to view detailed stats and a description.
- Edit player information and update their details.
- Generate LLM-generated descriptions for players using the OpenAI API.

## Project Structure
```
baseball-stats-app/
├── README.md                # Project documentation
├── backend/                 # Backend directory for Flask application
│   ├── app.py               # Main Flask application file
│   └── requirements.txt     # Python dependencies
├── db/                      # Database initialization files
│   └── init.sql             # SQL setup script
├── frontend/                # Frontend directory for React application
│   ├── package-lock.json    # Lock file for npm dependencies
│   ├── package.json         # Frontend dependencies and scripts
│   ├── public/              # Public assets directory
│   │   └── index.html       # Main HTML file
│   ├── src/                 # Source directory for React components
│   │   ├── App.tsx          # Main React component
│   │   └── index.tsx        # Entry point for React application
│   └── tsconfig.json        # TypeScript configuration
├── instance/                # Instance-specific files
│   └── players.db           # SQLite database file
├── migrations/              # Database migrations
    ├── README               # Migrations documentation
    ├── alembic.ini          # Alembic configuration file
    ├── env.py               # Environment settings for Alembic
    ├── script.py.mako       # Script templates for Alembic
    └── versions/            # Directory for migration versions
```

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
       venv\Scripts\activate
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

