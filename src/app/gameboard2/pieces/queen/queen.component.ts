import { Component, OnInit } from '@angular/core';
import { Alliance } from '../../alliance.enum';

@Component({
  selector: 'app-queen',
  templateUrl: './queen.component.html',
  styleUrls: ['./queen.component.css']
})
export class Queen implements OnInit {
  
  public typeDisplay = 'queen';
  public alliance: Alliance;
  public image: string;
  public isMysterious?: boolean = false;
  public isRevealed = false;

	constructor(alliance: Alliance) {
		this.alliance = alliance;
    this.image = this.alliance === Alliance.WHITE ? 'assets/white-queen.png' : 'assets/black-queen.png';
	}

  ngOnInit(): void {
  }

  public makeMysterious() {
    this.isMysterious = true;
  }

  public validateMove(origin: any, target: any, tiles: boolean[][]) {
    return this.getValidMoveTiles(origin, tiles)[target.x][target.y];
  }

  public getValidMoveTiles(origin: any, tiles: any[]): any[][] {
    let validMoves: any[][] = [];
    // console.log('getting valid moves');

	  for (let i = 0; i < tiles.length; i++) {
	    validMoves[i] = [];
    }

    let currentX = origin.x;
    let currentY = origin.y;
    
    while (currentX < 7) {
      currentX = currentX + 1;
      if (this._tileHasAlly(tiles[currentX][origin.y], tiles)) {
        // console.log('tile has ally');
        break;
      } 

      if (this._tileHasEnemy(tiles[currentX][origin.y], tiles)) {
        validMoves[currentX][origin.y] = true;
        break;
      }

      validMoves[currentX][origin.y] = true;
    }

    currentX = origin.x;

    while (currentX > 0) {
      currentX = currentX - 1;
      if (this._tileHasAlly(tiles[currentX][origin.y], tiles)) {
        // console.log('tile has ally');
        break;
      } 

      if (this._tileHasEnemy(tiles[currentX][origin.y], tiles)) {
        validMoves[currentX][origin.y] = true;
        // console.log('tile has enemy');
        break;
      } 


      validMoves[currentX][origin.y] = true;
    }

    while (currentY < 7) {
      currentY = currentY + 1;
      if (this._tileHasAlly(tiles[origin.x][currentY], tiles)) {
        // console.log('tile has ally');
        break;
      } 

      if (this._tileHasEnemy(tiles[origin.x][currentY], tiles)) {
        validMoves[origin.x][currentY] = true;
        break;
      }

      validMoves[origin.x][currentY] = true;
    }

    currentY = origin.y;

    while (currentY > 0) {
      currentY = currentY - 1;
      if (this._tileHasAlly(tiles[origin.x][currentY], tiles)) {
        // console.log('tile has ally');
        break;
      } 

      if (this._tileHasEnemy(tiles[origin.x][currentY], tiles)) {
        validMoves[origin.x][currentY] = true;
        break;
      } 

      validMoves[origin.x][currentY] = true;
    }

    currentX = origin.x;
    currentY = origin.y;

    while (currentX < 7 && currentY < 7) {
      currentX = currentX + 1;
      currentY = currentY + 1;
      if (this._tileHasAlly(tiles[currentX][currentY], tiles)) {
        // console.log('tile has ally');
        break;
      } 

      if (this._tileHasEnemy(tiles[currentX][currentY], tiles)) {
        validMoves[currentX][currentY] = true;
        break;
      }

      validMoves[currentX][currentY] = true;
    }

    currentX = origin.x;
    currentY = origin.y;

    while (currentX > 0 && currentY < 7) {
      currentX = currentX - 1;
      currentY = currentY + 1;
      if (this._tileHasAlly(tiles[currentX][currentY], tiles)) {
        // console.log('tile has ally');
        break;
      } 

      if (this._tileHasEnemy(tiles[currentX][currentY], tiles)) {
        validMoves[currentX][currentY] = true;
        break;
      }

      validMoves[currentX][currentY] = true;
    }
    
    currentX = origin.x;
    currentY = origin.y;

    while (currentX > 0 && currentY > 0) {
      currentX = currentX - 1;
      currentY = currentY - 1;
      if (this._tileHasAlly(tiles[currentX][currentY], tiles)) {
        // console.log('tile has ally');
        break;
      } 

      if (this._tileHasEnemy(tiles[currentX][currentY], tiles)) {
        validMoves[currentX][currentY] = true;
        break;
      }

      validMoves[currentX][currentY] = true;
    }

    currentX = origin.x;
    currentY = origin.y;

    while (currentX < 7 && currentY > 0) {
      currentX = currentX + 1;
      currentY = currentY - 1;
      if (this._tileHasAlly(tiles[currentX][currentY], tiles)) {
        // console.log('tile has ally');
        break;
      } 

      if (this._tileHasEnemy(tiles[currentX][currentY], tiles)) {
        validMoves[currentX][currentY] = true;
        break;
      }

      validMoves[currentX][currentY] = true;
    }

    // console.log(validMoves);

    return validMoves;
  }

  private _tileHasAlly(tile: any, boardTiles: any[][]) : boolean {
    // if (boardTiles[tile.x][tile.y] === undefined) return false;
    if (boardTiles[tile.x][tile.y].piece?.alliance === this.alliance) {
      return true;
    }

    return false;
  }

  private _tileHasEnemy(tile: any, boardTiles: any[][]) : boolean {
    if (!boardTiles[tile.x][tile.y].piece) return false;
    if (boardTiles[tile.x][tile.y].piece.alliance !== this.alliance) {
      return true;
    }

    return false;
  }
}
