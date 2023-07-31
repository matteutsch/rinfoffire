import { Component, OnInit, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import {
  Firestore,
  collection,
  doc,
  docData,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  game: Game = new Game();
  gameId: string | undefined;
  firestore: Firestore = inject(Firestore);
  aCollection = collection(this.firestore, 'games');
  game$!: Observable<any>;

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {}

  ngOnInit() {
    this.newGame();
    this.route.params.subscribe((params) => {
      this.gameId = params['id'];
      this.setGameData();
    });
  }

  setGameData() {
    let docRef = doc(this.aCollection, this.gameId);
    this.game$ = docData(docRef);
    this.game$.subscribe((games: any) => {
      this.game.currentPlayer = games.currentPlayer;
      this.game.players = games.players;
      this.game.playedCards = games.playedCards;
      this.game.stack = games.stack;
      this.game.currentCard = games.currentCard;
      this.game.pickCardAnimation = games.pickCardAnimation;
      console.log('games in setGameData', games);
    });
  }

  newGame() {
    this.game = new Game();
  }

  takeCard() {
    let card = this.game.stack.pop();
    if (!this.game.pickCardAnimation && card !== undefined) {
      this.game.currentCard = card;
      this.game.pickCardAnimation = true;
    } else {
      this.game.currentCard = '';
      this.game.pickCardAnimation = false;
    }

    this.game.currentPlayer++;
    this.game.currentPlayer =
      this.game.currentPlayer % this.game.players.length;
    setTimeout(() => {
      this.game.playedCards.push(this.game.currentCard);
      this.game.pickCardAnimation = false;
      this.updateGame();
    }, 1000);
    this.updateGame();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
        this.updateGame();
      }
    });
  }

  updateGame() {
    updateDoc(doc(this.aCollection, this.gameId), this.game.toJson());
  }
}
