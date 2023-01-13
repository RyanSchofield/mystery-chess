import { Component, OnInit, Input } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { io } from "socket.io-client";

import { Alliance } from './alliance.enum';
import { King } from './pieces/king/king.component';
import { Bishop } from './pieces/bishop/bishop.component';
import { Rook } from './pieces/rook/rook.component';
import { Knight } from './pieces/knight/knight.component';
import { Queen } from './pieces/queen/queen.component';
import { Pawn } from './pieces/pawn/pawn.component';


@Component({
  	selector: 'app-gameboard',
  	templateUrl: './gameboard.component.html',
  	styleUrls: ['./gameboard.component.css']
})
export class GameboardComponent implements OnInit {

  	public tiles?: any;
  	public currentTurn?: Alliance;
	public highlightedTiles: any[][];
	public threatTiles: any[][];
	public whiteGraveyard?: any[];
	public blackGraveyard?: any[];
	public message: string = '';
	public isSpectator: boolean = false;
	public spectatorNumber: number = -1;
	public playerColor?: Alliance;
	public socket: any;
	
	private _unhighlightedTiles : any[][];
	private _whiteReserve?: any[];
	private _blackReserve?: any[];

	constructor() { 
		this.currentTurn = Alliance.WHITE; 
		this.highlightedTiles = this._noHighlightedTiles(); 
		this.threatTiles = this._noHighlightedTiles();
		this._unhighlightedTiles = this._noHighlightedTiles();
		this.socket= io("http://192.168.1.13:3000");
		// this.socket = io();
	}

	ngOnInit(): void {
		this._initializeGameboard();
		this._initializeSocket();

  	}

	drag(event: any) {
		this.highlightedTiles = event.source.data.piece.getValidMoveTiles({x: event.source.data.x, y: event.source.data.y}, this.tiles);
	}

	drop(event: CdkDragDrop<any>) {
		this.message = '';

		let target = {x: event.container.data.x, y: event.container.data.y};
		let origin = {x: event.item.data.x, y: event.item.data.y};

		if (!this._sameCoordinates(origin, target) && event.item.data.piece.validateMove(origin, target, this.tiles)) {
			let originalTiles = JSON.parse(JSON.stringify(this.tiles));
			let originalWhiteGraveyard = this.whiteGraveyard;
			let originalBlackGraveyard = this.blackGraveyard;
			console.log(JSON.parse(JSON.stringify(this.tiles)));

			for (let i = 0; i < 8; i++) {
				for (let j = 0; j < 8; j++) {
					if (originalTiles[i][j].piece) {
						originalTiles[i][j].piece = this._objectToPiece(originalTiles[i][j].piece);
					} else {
						originalTiles.piece = null;
					}
				}
			}
			
			if (this._tileHasEnemy(target, this.tiles, event.item.data.piece.alliance)) {
				if (this.tiles[target.x][target.y].piece.alliance === Alliance.WHITE) { //target is white
					if (this.tiles[target.x][target.y].piece.isMysterious) {
						let deadPiece = this._whiteReserve?.pop();
						deadPiece.makeMysterious();
						this.whiteGraveyard?.push(deadPiece);
					} else {
						this.whiteGraveyard?.push(this.tiles[target.x][target.y].piece);
					}
				} else { // target is black
					if (this.tiles[target.x][target.y].piece.isMysterious) {
						let deadPiece = this._blackReserve?.pop();
						deadPiece.makeMysterious();
						this.blackGraveyard?.push(deadPiece);
					} else {
						this.blackGraveyard?.push(this.tiles[target.x][target.y].piece);
					}
				}
			}


			this.tiles[target.x][target.y].piece = event.item.data.piece;
			this.tiles[origin.x][origin.y].piece = null;

			// console.log('wtf');
			// console.log('is check?', this.isCheck());
			if (this.isCheck()) {
				console.log('is check');
				console.log(JSON.parse(JSON.stringify(this.tiles)));
				
				this.tiles = originalTiles;
				this.whiteGraveyard = originalWhiteGraveyard;
				this.blackGraveyard = originalBlackGraveyard;
				this.highlightedTiles = this._noHighlightedTiles();
				return;
			}

			if (this.tiles[target.x][target.y].piece.isMysterious) {
				if (this.tiles[target.x][target.y].piece.alliance === Alliance.WHITE) {
					// console.log(this.tiles[target.x][target.y].piece.alliance);
					this.tiles[target.x][target.y].piece = this._whiteReserve?.pop();
				} else {
					this.tiles[target.x][target.y].piece = this._blackReserve?.pop();
				}
			}

			if (event.item.data.piece.typeDisplay === 'pawn'
				&& event.item.data.piece.alliance === Alliance.WHITE
				&& target.x === 7
			) {
				this.tiles[target.x][target.y].piece = new Queen(Alliance.WHITE);
				this.message = 'Pawn promoted';
			}

			if (event.item.data.piece.typeDisplay === 'pawn'
				&& event.item.data.piece.alliance === Alliance.BLACK
				&& target.x === 0
			) {
				this.tiles[target.x][target.y].piece = new Queen(Alliance.BLACK);
				this.message = 'Pawn promoted';
			}

			this.currentTurn = this.currentTurn === Alliance.WHITE ? Alliance.BLACK : Alliance.WHITE;

			this.socket.emit("move",  {
				tiles: this.tiles,
				currentTurn: this.currentTurn,
				whiteReserve: this._whiteReserve,
				blackReserve: this._blackReserve,
				whiteGraveyard: this.whiteGraveyard,
				blackGraveyard: this.blackGraveyard
			});
		}

		this.highlightedTiles = this._unhighlightedTiles;
	}

	public refresh() {
		if(confirm("Are you sure you want to restart the game?")) {
			// console.log("Implement delete functionality here");
			this.socket.emit("refresh", {});
		}
	}

	private _initializeGameboard() {
		this._initializeReserves();
		this._initializeGraveyards();
		this._inititalizeTiles();
	}

	private _initializeSocket() {
		this.socket.on("moveUpdate", (data: any) => {
			console.log('moveUpdate');
			this._receiveMoveUpdate(data);
		});

		this.socket.on("setPlayerStatus", (data: any) => {
			console.log("player status received");
			this._receivePlayerStatus(data);
		});

		this.socket.on("refresh", (data: any) => {
			this._initializeGameboard();
			this.currentTurn = Alliance.WHITE;
			this.threatTiles = this._noHighlightedTiles();
		});
	}

	private _receivePlayerStatus(data: any) {
		this.playerColor = data.color ? Alliance.WHITE : Alliance.BLACK;
		this.isSpectator = data.isSpectator;
		this.spectatorNumber = data.spectatorNumber;
   }

	private _sameCoordinates(origin: any, target: any) {
		return origin.x === target.x && origin.y === target.y;
	}

	private _noHighlightedTiles() {
		let tiles: any = [];
		for (let i = 0; i < 8; i++) {
				tiles[i] = [];
 		 		for (let j = 0; j < 8; j++) {
	 				tiles[i][j] = false;
		   	}
		}
		return tiles;
	}

	private _objectToPiece(object: any) {
		let alliance = object.alliance ? Alliance.WHITE : Alliance.BLACK;
		let piece;

		switch(object.typeDisplay) {
			case 'pawn':
				piece = new Pawn(alliance);
				break;
			case 'rook':
				piece = new Rook(alliance);
				break;
			case 'knight':
				piece = new Knight(alliance);
				break;
			case 'bishop':
			piece = new Bishop(alliance);
			break;
			case 'queen':
			piece = new Queen(alliance);
			break;
			case 'king':
				piece = new King(alliance);
				break;
		}

		if (object.isMysterious && piece) {
		  	piece.makeMysterious();
	   }

	   return piece;
	}

	private _receiveMoveUpdate(data: any) {
		// console.log(data);
		if (!data) return;
		
		this.currentTurn = data.currentTurn ? Alliance.WHITE : Alliance.BLACK;

		if (data.tiles) {
			for (let i = 0; i < data.tiles.length; i++) {
				for (let j = 0; j < data.tiles[i].length; j++) {
					if (data.tiles[i][j].piece) {
						this.tiles[i][j].piece = this._objectToPiece(data.tiles[i][j].piece);
					} else {
						this.tiles[i][j].piece = null;
					}
				}
			}
			// console.log(this.tiles);
		}

		this.threatTiles = this._threateningTiles(this.tiles, this.currentTurn);

	  	this.whiteGraveyard = [];
	  	for (let capturedPiece of data.whiteGraveyard) {
			this.whiteGraveyard.push(this._objectToPiece(capturedPiece));
	  	}
	  	this.blackGraveyard = [];
	  	for (let capturedPiece of data.blackGraveyard) {
			this.blackGraveyard.push(this._objectToPiece(capturedPiece));
	  	}

		this._whiteReserve = [];
		for (let reservePiece of data.whiteReserve) {
		  this._whiteReserve.push(this._objectToPiece(reservePiece));
		}
	  	this._blackReserve = [];
	  	for (let reservePiece of data.blackReserve) {
			this._blackReserve.push(this._objectToPiece(reservePiece));
	  	}
  	}

	private _tileHasEnemy(tile: any, boardTiles: any[][], movedPieceAlliance: boolean) : boolean {
		if (!boardTiles[tile.x][tile.y].piece) return false;
		if (boardTiles[tile.x][tile.y].piece.alliance !== movedPieceAlliance) return true;

		return false;
	}

	private _shuffledArray(array: any[]) {
		return array
  			.map(value => ({ value, sort: Math.random() }))
  			.sort((a, b) => a.sort - b.sort)
  			.map(({ value }) => value);
	}

	private _emptyGameboard() {
		let tiles: any = [];
		for (let i = 0; i < 8; i++) {
			tiles[i] = [];
			for (let j = 0; j < 8; j++) {
			  	tiles[i][j] = {
					'color': (i + j) % 2 ? '#5F9EA0' : 'white',
					'highlightedColor': (i + j) % 2 ? '#2F6E70' : 'gray',
					'x': i,
					'y': j
			  	}
			}
	  	}
		return tiles;
	}

	private _inititalizeTiles() {
		this.tiles = this._emptyGameboard();
		this._unhighlightedTiles = this._noHighlightedTiles();
		this.highlightedTiles = this._noHighlightedTiles();

		this.tiles[0][0].piece = new Rook(Alliance.WHITE);
		this.tiles[0][1].piece = new Knight(Alliance.WHITE);
		this.tiles[0][2].piece = new Bishop(Alliance.WHITE);
		this.tiles[0][3].piece = new King(Alliance.WHITE);
		this.tiles[0][4].piece = new Queen(Alliance.WHITE);
		this.tiles[0][5].piece = new Bishop(Alliance.WHITE);
		this.tiles[0][6].piece = new Knight(Alliance.WHITE);
		this.tiles[0][7].piece = new Rook(Alliance.WHITE);
		this.tiles[1][0].piece = new Pawn(Alliance.WHITE);
		this.tiles[1][1].piece = new Pawn(Alliance.WHITE);
		this.tiles[1][2].piece = new Pawn(Alliance.WHITE);
		this.tiles[1][3].piece = new Pawn(Alliance.WHITE);
		this.tiles[1][4].piece = new Pawn(Alliance.WHITE);
		this.tiles[1][5].piece = new Pawn(Alliance.WHITE);
		this.tiles[1][6].piece = new Pawn(Alliance.WHITE);
		this.tiles[1][7].piece = new Pawn(Alliance.WHITE);
		this.tiles[7][0].piece = new Rook(Alliance.BLACK);

		this.tiles[7][1].piece = new Knight(Alliance.BLACK);
		this.tiles[7][2].piece = new Bishop(Alliance.BLACK);
		this.tiles[7][3].piece = new King(Alliance.BLACK);
		this.tiles[7][4].piece = new Queen(Alliance.BLACK);
		this.tiles[7][5].piece = new Bishop(Alliance.BLACK);
		this.tiles[7][6].piece = new Knight(Alliance.BLACK);
		this.tiles[7][7].piece = new Rook(Alliance.BLACK);
		this.tiles[6][0].piece = new Pawn(Alliance.BLACK);
		this.tiles[6][1].piece = new Pawn(Alliance.BLACK);
		this.tiles[6][2].piece = new Pawn(Alliance.BLACK);
		this.tiles[6][3].piece = new Pawn(Alliance.BLACK);
		this.tiles[6][4].piece = new Pawn(Alliance.BLACK);
		this.tiles[6][5].piece = new Pawn(Alliance.BLACK);
		this.tiles[6][6].piece = new Pawn(Alliance.BLACK);
		this.tiles[6][7].piece = new Pawn(Alliance.BLACK);


		this.tiles[0][0].piece.makeMysterious();
		this.tiles[0][1].piece.makeMysterious();
		this.tiles[0][2].piece.makeMysterious();
		this.tiles[0][4].piece.makeMysterious();
		this.tiles[0][5].piece.makeMysterious();
		this.tiles[0][6].piece.makeMysterious();
		this.tiles[0][7].piece.makeMysterious();
		this.tiles[1][0].piece.makeMysterious();
		this.tiles[1][1].piece.makeMysterious();
		this.tiles[1][2].piece.makeMysterious();
		this.tiles[1][3].piece.makeMysterious();
		this.tiles[1][4].piece.makeMysterious();
		this.tiles[1][5].piece.makeMysterious();
		this.tiles[1][6].piece.makeMysterious();
		this.tiles[1][7].piece.makeMysterious();
		this.tiles[7][0].piece.makeMysterious();
		this.tiles[7][1].piece.makeMysterious();
		this.tiles[7][2].piece.makeMysterious();
		this.tiles[7][4].piece.makeMysterious();
		this.tiles[7][5].piece.makeMysterious();
		this.tiles[7][6].piece.makeMysterious();
		this.tiles[7][7].piece.makeMysterious();
		this.tiles[6][0].piece.makeMysterious();
		this.tiles[6][1].piece.makeMysterious();
		this.tiles[6][2].piece.makeMysterious();
		this.tiles[6][3].piece.makeMysterious();
		this.tiles[6][4].piece.makeMysterious();
		this.tiles[6][5].piece.makeMysterious();
		this.tiles[6][6].piece.makeMysterious();
		this.tiles[6][7].piece.makeMysterious();
	}

	private _initializeGraveyards() {
		this.blackGraveyard = [];
		this.whiteGraveyard = [];
	}

	private _initializeReserves() {
		this._whiteReserve = [
			new Rook(Alliance.WHITE),
			new Knight(Alliance.WHITE),
			new Bishop(Alliance.WHITE),
			new Queen(Alliance.WHITE),
			new Bishop(Alliance.WHITE),
			new Knight(Alliance.WHITE),
			new Rook(Alliance.WHITE),
			new Pawn(Alliance.WHITE),
			new Pawn(Alliance.WHITE),
			new Pawn(Alliance.WHITE),
			new Pawn(Alliance.WHITE),
			new Pawn(Alliance.WHITE),
			new Pawn(Alliance.WHITE),
			new Pawn(Alliance.WHITE),
			new Pawn(Alliance.WHITE),
		];

		this._blackReserve = [
			new Rook(Alliance.BLACK),
			new Knight(Alliance.BLACK),
			new Bishop(Alliance.BLACK),
			new Queen(Alliance.BLACK),
			new Bishop(Alliance.BLACK),
			new Knight(Alliance.BLACK),
			new Rook(Alliance.BLACK),
			new Pawn(Alliance.BLACK),
			new Pawn(Alliance.BLACK),
			new Pawn(Alliance.BLACK),
			new Pawn(Alliance.BLACK),
			new Pawn(Alliance.BLACK),
			new Pawn(Alliance.BLACK),
			new Pawn(Alliance.BLACK),
			new Pawn(Alliance.BLACK),
		];

		this._whiteReserve = this._shuffledArray(this._whiteReserve);
		this._blackReserve = this._shuffledArray(this._blackReserve);
	}

	private isCheck() {
		let threatTiles = this._threateningTiles(this.tiles, this.currentTurn === Alliance.WHITE ? Alliance.WHITE : Alliance.BLACK);
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (threatTiles[i][j]) {
					return true;
				}
			}
		}
		return false;
	}

	private _threateningTiles(tiles: any[][], alliance: Alliance) {
		// iterate through tiles to find the king position
		// iterate through tiles again to find all pieces attacking the king position.
		// if (!alliance) {console.log('wtf???');return this._noHighlightedTiles();}
		let kingCoordinates = this._findKing(tiles, alliance);
		let returnTiles = this._noHighlightedTiles();

		if (!kingCoordinates) return returnTiles;

		for (let i = 0; i < tiles.length; i++) {
			for (let j = 0; j < tiles[i].length; j++) {
				// if (tiles[i][j].piece) console.log('piece at ', i, j);
				if (tiles[i][j].piece 
					&& tiles[i][j].piece.alliance !== alliance 
					&& tiles[i][j].piece.getValidMoveTiles({x : i, y: j}, tiles)[kingCoordinates.x][kingCoordinates.y]) 
				{
					returnTiles[i][j] = true;
					console.log('threat at', i, j);
				}
			}
		}

		return returnTiles;
	}

	private _findKing(tiles: any[][], alliance: Alliance) {
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (tiles[i][j]?.piece?.typeDisplay === 'king' && tiles[i][j]?.piece?.alliance === alliance) {
					return {
						x: i,
						y: j
					};
				}
			}
		}
		return null;
	}
}

/**
 *
 * enhancement:
 * when opening the page, display a question asking if they want to play local or online.
 *
 * enhancement:
 * implement a refresh somehow (button, route?), that calls a method on gameboard, sending a moveUpdate with initial condition tiles.
 */

/**
 * Undo Button:
 * have an array of game state objects on the server. pop from the array when undo event is received.
 * 
 * Possibly do this on server:
 * Implement moveHistory, an array of move objects, that have player, tiles, white/black reserve/graveyard properties.
 * push to moveHistory on successful move (whatever the origin state was).
 * Implement undo button that goes back one move.
 *
 *
 * Do this on client:
 * when undo button is pressed, emit an undo socket event.
 *
 */

/**
 * Implement 'Start Over' button.
 * When clicked, it reinitializes tiles.
 * Send moveUpdate to the server
 *
 * Bonus enhancement: Prompt the other player when the button is pressed. If other player says yes, reinitialize. If no,
 * alert the player that clicked the button.
 */



/**
 * Have a component for players to set their name in a text field. When button is clicked to save, update other
 * players. Supply this as an input to the chat component for message data. In the template,
 * have the other player's name field be readonly. Spectators have a field to set their name, which defaults to spectator
 * for the chat.
 */

/**
 * Display a message for pawn promoted. send the message with moveUpdate data
 */