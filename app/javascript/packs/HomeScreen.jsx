import React from 'react'
import ReactDOM from 'react-dom'


function range(size) {
  return [...Array(size).keys()];
}

function isInsideCollection(sub, master) {
  return master.map(i => JSON.stringify(i)).includes(JSON.stringify(sub));
}

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = { games: [], selectedGame: null }

    fetch("/api/games").then(r => r.json()).then(games => {
      this.setState({ games })
    })
  }

  onRowRightClick = (x,y) => {
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
      fetch(`/api/games/${selectedGame.id}/flags`, { method, body: JSON.stringify({ x, y }) }).then(r => r.json()).then(flags => {
        this.setState({ selectedGame: { ...selectedGame, flags } });
      });
    }
  }

  onRowClick = (x,y) => {
    let { selectedGame } = this.state;

    let cellText = this.renderCell(x,y);

    switch (cellText) {
      case "V":
        fetch(`/api/games/${selectedGame.id}/cell_clicks`, { method: 'POST', body: JSON.stringify({ x, y }) }).then(r => r.json()).then(clicked_cells => {
          this.setState({ selectedGame: { ...selectedGame, clicked_cells } });
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

    if (isInsideCollection(position, revealed_positions)) {
      return "R";
    }
    else if (isInsideCollection(position, clicked_cells)) {
      return "C";
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
        <td key={key} onContextMenu={() => this.onRowRightClick(x,y)} onClick={() => this.onRowClick(x,y)}>
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


