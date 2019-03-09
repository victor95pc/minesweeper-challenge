import React from 'react'
import ReactDOM from 'react-dom'


function range(size) {
  return [...Array(size).keys()];
}

function isInsideCollection(sub, master) {
  return master.map(i => JSON.stringify(i)).includes(JSON.stringify(sub));
}

function getIndexFromInsideCollection(sub, master) {
  return master.map(i => JSON.stringify(i)).indexOf(JSON.stringify(sub));
}


function fetcher(url, object, method) {
  return fetch(url, {
    method,
    headers: {'Content-Type': 'application/json', 'Accept': 'application/json, text/plain',},
    body:    JSON.stringify(object)
  });
}

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = { games: [], selectedGame: null, newGame: {} }

    fetch("/api/games").then(r => r.json()).then(games => {
      this.setState({ games })
    })
  }

  onNewGameSubmit = (e) => {
    e.preventDefault();

    fetcher(`/api/games/`, this.state.newGame, 'post')
      .then(r => r.json())
      .then(() => window.location.reload())
  }

  onNewGameChange = (field, value) => {
    let newGame = { ...this.state.newGame, [field]: value };
    this.setState({ newGame });
  }

  onRowRightClick = (x,y,e) => {
    e.preventDefault();

    let { selectedGame } = this.state;

    let cellText = this.renderCell(x,y);

    let method = null;
    let url    = null;

    if (cellText === "V") {
      method = "POST";
      url    = `/api/games/${selectedGame.id}/flags`;
    }
    else if (cellText === "F") {
      method    = "DELETE";
      let index = getIndexFromInsideCollection([x,y], selectedGame.flags);
      url       = `/api/games/${selectedGame.id}/flags/${index}`;
    }

    if (method) {
      fetcher(url, { x, y }, method).then(r => r.json())
        .then(flags => {
          return fetch(`/api/games/${selectedGame.id}`).then(r => r.json())
        })
        .then(selectedGame => {
          this.setState({ selectedGame });
        });
    }
  }

  onRowClick = (x,y) => {
    let { selectedGame } = this.state;

    let cellText = this.renderCell(x,y);

    switch (cellText) {
      case "V":
        fetcher(`/api/games/${selectedGame.id}/cell_clicks`, { x, y }, 'POST').then(r => r.json())
          .then(clicked_cells => {
            return fetch(`/api/games/${selectedGame.id}`).then(r => r.json())
          })
          .then(selectedGame => {
            this.setState({ selectedGame });
          });
      default:
    }
  }


  renderCell(x,y) {
    let { selectedGame } = this.state;
    let { bombs, clicked_cells, flags, revealed_positions, board_width, board_height } = selectedGame;

    let position = [x,y];

    if (selectedGame.is_gameover && isInsideCollection(position, bombs)) {
      return "B";
    }

    else if (isInsideCollection(position, clicked_cells)) {
      return "C";
    }

    else if (isInsideCollection(position, revealed_positions)) {
      return "R";
    }
    else if (isInsideCollection(position, flags)) {
      return "F";
    }

    return "V";
  }

  renderRow(y) {
    let { selectedGame } = this.state;
    let { board_width } = selectedGame;

    return range(board_width).map(_x => {
      let x = _x+1;
      let key = JSON.stringify([x,y]);

      return (
        <td key={key} onContextMenu={e => this.onRowRightClick(x,y, e)} onClick={() => this.onRowClick(x,y)}>
          {this.renderCell(x,y)}
        </td>
      )
    })
  }

  renderTBody() {
    let { selectedGame } = this.state;
    let { board_height } = selectedGame;

    return range(board_height).map(_y => {
      let y = _y+1;
      return (
        <tr key={y}>
          {this.renderRow(y)}
        </tr>
      )
    });
  }

  renderGameList() {
    let { games } = this.state;
    return games.map(g => <li key={g.id} onClick={() => this.setState({ selectedGame: g })}>{g.name}</li>)
  }

  warnAboutGame() {
    let { selectedGame } = this.state;
    if (selectedGame.is_gameover) {
      return "You lose :("
    }

    if (selectedGame.win_game) {
      return "You WIN!! ;)"
    }
  }

  render() {
    let { selectedGame, games } = this.state;
    if (selectedGame) {
      let { bombs, clicked_cell, revealed_positions, board_width, board_height } = selectedGame;
      return (
        <div>
          <h2>{this.warnAboutGame()}</h2>
          <table>
            <tbody>
              {this.renderTBody()}
            </tbody>
          </table>

          <h5>Legend:</h5>
          <p>R = Revealed</p>
          <p>V = Empty</p>
          <p>C = Clicked</p>
          <p>B = Bomb</p>
          <p>F = Flag</p>
        </div>
      )
    }
    else {
      return (
        <div>
          {this.renderGameList()}
          <form onSubmit={this.onNewGameSubmit}>
            <input required type="text" placeholder="Name" onChange={v => this.onNewGameChange("name", v.target.value)} />
            <input required type="number" placeholder="Board Width" onChange={v => this.onNewGameChange("board_width", parseInt(v.target.value))} />
            <input required type="number" placeholder="Board Height" onChange={v => this.onNewGameChange("board_height", parseInt(v.target.value))} />
            <input required type="number" placeholder="Amount of Bombs" onChange={v => this.onNewGameChange("amount_bombs", parseInt(v.target.value))} />
            <input type="submit" value="Create" />
          </form>
        </div>
      )
    }
  }
}


