token = "lip_jzYWic4XbOga8kuNq2mh";
gameId = "HJg8nvQ0"

pageLoad();

function pageLoad() {
    fetch("https://lichess.org/api/account", {
        method: "GET",
        headers: {
        "Authorization": 'Bearer ' + token,
        }
    })
    .then((response) => response.json())
    .then((json) => {
        const userName = json.username;
        document.getElementById("username").innerHTML += userName;
        this.attachToGame(userName);
    });
}


async function attachToGame(userName) {
    const response = await fetch('https://lichess.org/api/board/game/stream/' + gameId, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    })
    const reader = response.body.getReader();
    while (true) {
        const { done, value } = await reader.read();
        let textDecoder = new TextDecoder();
        let data = textDecoder.decode(value);

        try {
            data = JSON.parse(data);
        } catch (e) {
            continue;
        }

        if (done) {
          // Do something with last chunk of data then exit reader
          return;
        }
        console.log(data);
        var moves = null;
        if (data.state) {
            const gameId = data.id;
            document.getElementById("game_id").innerHTML += gameId;
            var pieces = 'Black';
            if (data.white.id == userName) {
                pieces = 'White';
            }
            document.getElementById("your_pieces").innerHTML += pieces;


            moves = data.state.moves;
        }

        if (moves === null) {
            moves = data.moves;
        }
        if ( !moves ) {
            turn = "White";
        } else {
            moves = moves.split(" ");
            console.log(moves);
            var turn = "Black";
            console.log(moves.length);
            if (moves.length % 2 == 0){
                turn = "White";
            }
        }
        document.getElementById("turn").innerHTML = 'Turn: ' + turn;

        if (moves.length > 0) {
            document.getElementById("last_move").innerHTML = 'Last Move: ' + moves[moves.length - 1];
        }
      }
};

function clearMove() {
    move = '';
    document.getElementById("your_move").innerHTML = 'Your Move: ' + move;
}

var move = '';
function makeMove(input) {
    map = {
        '1': 'a',
        '2': 'b',
        '3': 'c',
        '4': 'd',
        '5': 'e',
        '6': 'f',
        '7': 'g',
        '8': 'h',
    }
    if (move.length == 4) {
        return;
    }
    if (move.length == 0 ||move.length == 2) {
        move += map[input];
    } else {
        move += input;
    }
    document.getElementById("your_move").innerHTML = 'Your Move: ' + move;
}

function sendMove() {
    fetch('https://lichess.org/api/board/game/' + gameId + '/move/' + move, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    }).then((response) => {
        if (response.status == 200) {
            console.log('Move sent');
        } else {
            document.getElementById("your_move").innerHTML = 'Your Move: Bad Move';
        }
    }).catch((error) => {
        console.log(error)
    });
    move = '';
    
}
