import React from 'react'
import ReactDOM from 'react-dom'


function range(size) {
  return [...Array(size).keys()];
}

function isInsideCollection(sub, master) {
  return master.map(i => JSON.stringify(i)).includes(JSON.stringify(sub));
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

    this.state = { games: [], selectedGame: null }

    fetch("/api/games").then(r => r.json()).then(games => {
      this.setState({ games })
    })
  }

  onRowRightClick = (x,y,e) => {
    e.preventDefault();

    let { selectedGame } = this.state;

    let cellText = this.renderCell(x,y);

    let method = null;

    if (cellText === "V") {
      method = "POST";
    }
    else if (cellText === "F") {
      method = "DESTROY";
    }

    if (method) {
      fetcher(`/api/games/${selectedGame.id}/flags`, { x, y }, method).then(r => r.json())
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

  render() {
    let { selectedGame, games } = this.state;
    if (selectedGame) {
      let { bombs, clicked_cell, revealed_positions, board_width, board_height } = selectedGame;
      return (
        <table>
          <tbody>
            {this.renderTBody()}
          </tbody>
        </table>
      )
    }
    else {
      return games.map(g => <li key={g.id} onClick={() => this.setState({ selectedGame: g })}>{g.name}</li>)
    }
  }
}


