import { Component, OnInit } from '@angular/core';
import { Alliance } from '../../alliance.enum';

@Component({
  selector: 'app-pawn',
  templateUrl: './pawn.component.html',
  styleUrls: ['./pawn.component.css']
})
export class Pawn implements OnInit {
  
  public typeDisplay = 'pawn';
  public alliance: Alliance;
  public image: string;
  public isMysterious?: boolean = false;
  public isRevealed = false;
  public firstMove: boolean = true;

	constructor(alliance: Alliance) {
		this.alliance = alliance;
    this.image = this.alliance === Alliance.WHITE ? 'assets/white-pawn.png' : 'assets/black-pawn.png';
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
    
    if (this.alliance === Alliance.WHITE) {
      if (origin.x + 1 < 8 && !this._tileHasAlly(tiles[origin.x + 1][origin.y], tiles) && !this._tileHasEnemy(tiles[origin.x + 1][origin.y], tiles)) {
        validMoves[origin.x + 1][origin.y] = true;
        if (origin.x + 2 < 8 && !this._tileHasAlly(tiles[origin.x + 2][origin.y], tiles)  && !this._tileHasEnemy(tiles[origin.x + 2][origin.y], tiles) && this.isMysterious) {
          validMoves[origin.x + 2][origin.y] = true;
        }
      }

      if (origin.x + 1 < 8 && origin.y - 1 > -1 && this._tileHasEnemy(tiles[origin.x + 1][origin.y - 1], tiles)) {
        validMoves[origin.x + 1][origin.y - 1] = true;
      }

      if (origin.x + 1 < 8 && origin.y + 1 < 8 && this._tileHasEnemy(tiles[origin.x + 1][origin.y + 1], tiles)) {
        validMoves[origin.x + 1][origin.y + 1] = true;
      }
    }

    if (this.alliance === Alliance.BLACK) {
      if (origin.x - 1 > -1 && !this._tileHasAlly(tiles[origin.x - 1][origin.y], tiles) && !this._tileHasEnemy(tiles[origin.x - 1][origin.y], tiles)) {
        validMoves[origin.x - 1][origin.y] = true;
        if (origin.x - 2 > -1 && !this._tileHasAlly(tiles[origin.x - 2][origin.y], tiles)  && !this._tileHasEnemy(tiles[origin.x - 2][origin.y], tiles) && this.isMysterious) {
          validMoves[origin.x - 2][origin.y] = true;
        }
      }

      if (origin.x - 1 > -1 && origin.y - 1 > -1 && this._tileHasEnemy(tiles[origin.x - 1][origin.y - 1], tiles)) {
        validMoves[origin.x - 1][origin.y - 1] = true;
      }

      if (origin.x - 1 > -1 && origin.y + 1 < 8 && this._tileHasEnemy(tiles[origin.x - 1][origin.y + 1], tiles)) {
        validMoves[origin.x - 1][origin.y + 1] = true;
      }
    }

    

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
