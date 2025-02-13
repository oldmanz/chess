let token
let gameId
let username
let reader

pageLoad();

function pageLoad() {
    token = getCookie("token");
    if (!token) {
        token = prompt("Enter Token");
        setCookie("token", token);
    }
    
    fetch("https://lichess.org/api/account", {
        method: "GET",
        headers: {
        "Authorization": 'Bearer ' + token,
        }
    })
    .then((response) => response.json())
    .then((json) => {
        username = json.username;
        if (!username) {
            document.getElementById("username").innerHTML = 'Invalid Token';
            return;
        }
        document.getElementById("username").innerHTML = username;
    });
}

function changeToken() {
    eraseCookie("token");
    location.reload();
}

function quit(){
    location.reload();

}


function startGame() {
    gameId = getCookie("gameId");
    gameId = prompt("Enter Game ID", gameId);
    setCookie("gameId", gameId);
    document.getElementById("account").style.display = "none";
    document.getElementById("game").style.display = "none";
    document.getElementById("last_move_div").style.display = "block";
    document.getElementById("your_move_div").style.display = "block";
    document.getElementById("quit").style.display = "block";
    if (reader) {
        reader.cancel();
    }
    attachToGame();
}

async function attachToGame() {

    const response = await fetch('https://lichess.org/api/board/game/stream/' + gameId, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
        },
    })
    reader = response.body.getReader();
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
        var moves = null;
        if (data.state) {
            const gameId = data.id;
            document.getElementById("game_id").innerHTML = 'Game Id:' + gameId;
            var pieces = 'Black';
            if (data.white.id == username) {
                pieces = 'White';
            }
            document.getElementById("your_pieces").innerHTML = 'Your Pieces:' + pieces;


            moves = data.state.moves;
        }

        if (moves === null) {
            moves = data.moves;
        }
        if ( !moves ) {
            turn = "White";
        } else {
            moves = moves.split(" ");
            var turn = "Black";
            if (moves.length % 2 == 0){
                turn = "White";
            }
            
        }
        if (turn == pieces) {
            document.getElementById("last_move_div").style.backgroundColor = '#90EE90';
        } else {
            document.getElementById("last_move_div").style.backgroundColor = '#FFFFE0';
        }

        
        if (moves.length > 0) {
            tMove = moves[moves.length - 1].toUpperCase()
            
        } else {
            tMove = 'You Start';
        }
        document.getElementById("last_move").innerHTML = tMove;
      }
};

function clearMove() {
    move = '';
    document.getElementById("your_move").innerHTML = move;
}

var move = '';
function makeMove(input) {
    map = {
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D',
        '5': 'E',
        '6': 'F',
        '7': 'G',
        '8': 'H',
    }
    if (move.length == 4) {
        return;
    }
    if (move.length == 0 ||move.length == 2) {
        move += map[input];
    } else {
        move += input;
    }
    document.getElementById("your_move").innerHTML = move;
}

function sendMove() {
    fetch('https://lichess.org/api/board/game/' + gameId + '/move/' + move.toLowerCase(), {
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

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
