from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
import requests
import logging
from openai import OpenAI
import os

# Setup logging configuration for informational output
logging.basicConfig(level=logging.INFO)

# Initialize the OpenAI client with the API key
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for all routes

# Configure the SQLAlchemy part of the app instance
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://myuser:mypassword@localhost:5432/players_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Create the SQLAlchemy db instance
db = SQLAlchemy(app)

# Create the Migrate instance
migrate = Migrate(app, db)

# Define the Player model
class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rank = db.Column(db.Integer, nullable=False)
    player_name = db.Column(db.String(80), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    hits = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    bats = db.Column(db.String(1), nullable=False)
    description = db.Column(db.Text, nullable=True)

# Function to generate a player description using LLM
def generate_llm_description(player):
    prompt = (
        f"Provide a detailed description of a baseball player based on the following information:\n"
        f"Name: {player['player_name']}\n"
        f"Hits: {player['hits']}\n"
        f"Year: {player['year']}\n"
        f"Age: {player['age']}\n"
        f"Bats: {player['bats']}\n"
        f"Generate a summary in a couple of sentences."
    )

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="gpt-3.5-turbo",
            max_tokens=50,
            temperature=0.7,
        )
        description = response.choices[0].message.content.strip()
        logging.info(f"Generated LLM description: {description}")
        return description
    except KeyError as e:
        logging.error(f"KeyError: {str(e)}")
        return None
    except Exception as e:
        logging.error(f"Error generating LLM description: {str(e)}")
        return None

# Route to fetch data from the API, correct ranks, and update the database
@app.route('/fetch-and-correct-data', methods=['GET'])
def fetch_and_correct_data():
    url = 'https://api.sampleapis.com/baseball/hitsSingleSeason'
    response = requests.get(url)
    data = response.json()

    logging.info(f"Fetched data: {data}")

    # Group players by year and correct ranks based on hits
    from collections import defaultdict
    players_by_year = defaultdict(list)
    for player in data:
        players_by_year[player['Year']].append(player)

    # Sort players by hits within each year and update the database
    for year, players in players_by_year.items():
        sorted_players = sorted(players, key=lambda x: int(x['Hits']), reverse=True)
        for idx, player in enumerate(sorted_players, start=1):
            player['Rank'] = idx  # Update rank
            existing_player = Player.query.filter_by(id=player['id']).first()
            if existing_player:
                logging.info(f"Updating player: {existing_player.player_name} with ID: {existing_player.id}")
            else:
                logging.info(f"Inserting player: {player['Player']} with ID: {player['id']}")
                new_player = Player(
                    id=player['id'],
                    rank=int(player['Rank']),
                    player_name=player['Player'],
                    age=int(player['AgeThatYear']),
                    hits=int(player['Hits']),
                    year=int(player['Year']),
                    bats=player['Bats'],
                    description=generate_llm_description(player)
                )
                db.session.add(new_player)
    
    logging.info("Committing the transaction to the database.")
    db.session.commit()
    logging.info("Transaction committed successfully.")
    
    return jsonify({'message': 'Data fetched and corrected successfully'})

# Route to retrieve all players
@app.route('/players', methods=['GET'])
def get_players():
    players = Player.query.all()
    logging.info(f"Returning players: {[player.player_name for player in players]}")
    return jsonify([{
        'id': player.id,
        'rank': player.rank,
        'player_name': player.player_name,
        'age': player.age,
        'hits': player.hits,
        'year': player.year,
        'bats': player.bats,
        'description': player.description
    } for player in players])

# Route to get details of a single player and generate description if missing
@app.route('/player/<int:player_id>', methods=['GET'])
def get_player(player_id):
    player = Player.query.get_or_404(player_id)
    logging.info(f"Fetching player details for player ID: {player_id}")

    if not player.description:
        logging.info(f"Generating LLM description for player: {player.player_name}")
        description = generate_llm_description({
            "player_name": player.player_name,
            "hits": player.hits,
            "year": player.year,
            "age": player.age,
            "bats": player.bats
        })
        player.description = description
        db.session.commit()

    logging.info(f"Player data: {player}")
    return jsonify({
        'id': player.id,
        'rank': player.rank,
        'player_name': player.player_name,
        'age': player.age,
        'hits': player.hits,
        'year': player.year,
        'bats': player.bats,
        'description': player.description
    })

# Route to update a player's details
@app.route('/player/<int:player_id>', methods=['PUT'])
def edit_player(player_id):
    player = Player.query.get_or_404(player_id)
    data = request.get_json()

    logging.info(f"Received data for updating player ID {player_id}: {data}")

    player.player_name = data.get('player_name', player.player_name)
    player.age = data.get('age', player.age)
    player.hits = data.get('hits', player.hits)
    player.year = data.get('year', player.year)
    player.bats = data.get('bats', player.bats)
    
    # Generate a new LLM description based on the updated data
    description = generate_llm_description({
        "player_name": player.player_name,
        "hits": player.hits,
        "year": player.year,
        "age": player.age,
        "bats": player.bats
    })
    player.description = description

    logging.info(f"Updated player data before commit: {player}")

    try:
        logging.info("Attempting to commit the transaction to the database.")
        db.session.commit()
        logging.info("Transaction committed successfully.")
    except Exception as e:
        logging.error(f"Error committing transaction: {e}")
        db.session.rollback()
        logging.info("Transaction rolled back due to error.")
        return jsonify({'message': 'Error updating player data'}), 500

    recalculate_ranks(player.year)

    return jsonify({'message': 'Player updated and ranks recalculated successfully'})

# Route to generate a description using LLM for given player data
@app.route('/generate-description', methods=['POST'])
def generate_description():
    data = request.get_json()

    # Ensure all required fields are present
    required_fields = ['player_name', 'hits', 'year', 'age', 'bats']
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        logging.error(f"Missing required fields: {missing_fields}")
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

    player = {
        "player_name": data['player_name'],
        "hits": data['hits'],
        "year": data['year'],
        "age": data['age'],
        "bats": data['bats']
    }

    description = generate_llm_description(player)

    if description is None:
        logging.error("Failed to generate LLM description.")
        return jsonify({'error': 'Failed to generate LLM description.'}), 500

    return jsonify({'description': description})

# Function to recalculate player ranks based on hits
def recalculate_ranks(year):
    all_players = Player.query.filter_by(year=year).order_by(Player.hits.desc()).all()
    rank = 0
    previous_hits = None
    previous_rank = 0

    for player in all_players:
        if player.hits == previous_hits:
            player.rank = previous_rank
        else:
            rank += 1
            player.rank = rank
            previous_rank = rank

        previous_hits = player.hits

    logging.info(f"Recalculating ranks for the year {year}.")

    try:
        logging.info("Attempting to commit the rank updates to the database.")
        db.session.commit()
        logging.info("Rank updates committed successfully.")
    except Exception as e:
        logging.error(f"Error committing rank updates: {e}")
        db.session.rollback()
        logging.info("Rank update transaction rolled back due to error.")
        return jsonify({'message': 'Error updating player ranks'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Ensure the database and tables are created
    app.run(host='0.0.0.0', port=5001)  # Run the Flask app
