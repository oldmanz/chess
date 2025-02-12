
# Importing flask module in the project is mandatory
# An object of Flask class is our WSGI application.
from flask import Flask, render_template

# Flask constructor takes the name of 
# current module (__name__) as argument.
app = Flask(__name__)

# The route() function of the Flask class is a decorator, 
# which tells the application which URL should call 
# the associated function.
@app.route('/')
# ‘/’ URL is bound with hello_world() function.
def index():
    return render_template('index.html')

# main driver function
if __name__ == '__main__':

    # run() method of Flask class runs the application 
    # on the local development server.
    app.run()

    

import requests
import json

username = 'oldmanz'
token = "lip_jzYWic4XbOga8kuNq2mh"

gameId = "3sChzIlQ"

headers = {
  "Authorization": 'Bearer ' + token,
};

input("Press Enter to start the game")
start = True
move = ""
response = requests.get(f"https://lichess.org/api/board/game/stream/{gameId}", headers=headers, stream=True)
for chunk in response.iter_content(chunk_size=1024):
    if chunk:
        chunk = chunk.decode('utf-8').strip().replace('\n', ' ').replace('\r', '')
        if chunk:
            data = json.loads(chunk)
            if start:
                if data['white'].get('id', None) == username:
                    print("You are white")
                if data['black'].get('id', None) == username:
                    print("You are black")
                start = False
                moves = data['state']['moves']
            else:
                moves = data['moves']
            
            last_move = moves.split(' ')[-1]
            if last_move != move:
                print(last_move)
                move = input("Enter your move: ")
                endpoint = f"https://lichess.org/api/board/game/{gameId}/move/{move}"
                response = requests.post(endpoint, headers=headers)
                if response.status_code != 200:
                    print("Error: " + response.text)
print("Game over")