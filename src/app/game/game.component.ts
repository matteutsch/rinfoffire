import { Component, OnInit, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  pickCardAnimation = false;
  currentCard: string = '';
  game: Game = new Game();
  firestore: Firestore = inject(Firestore);
  aCollection = collection(this.firestore, 'games');
  items$!: Observable<any>;

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {
    this.items$ = collectionData(this.aCollection);
  }

  ngOnInit() {
    this.newGame();
    this.route.params.subscribe((params) => {
      console.log(params);
    });
    this.items$.subscribe((games) => {
      console.log('game update', games);
    });

    this.addGameToFirestore();
  }

  newGame() {
    this.game = new Game();
  }

  addGameToFirestore() {
    const jsonObject = this.game.toJson();

    // Use the 'addDoc' function to add the JSON object to the 'games' collection
    addDoc(collection(this.firestore, 'games'), jsonObject)
      .then((docRef) => {
        console.log('Document written with ID: ', docRef.id);
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
      });
  }

  takeCard() {
    let card = this.game.stack.pop();
    if (!this.pickCardAnimation && card !== undefined) {
      this.currentCard = card;
      this.pickCardAnimation = true;
    } else {
      this.currentCard = '';
      this.pickCardAnimation = false;
    }

    this.game.currentPlayer++;
    this.game.currentPlayer =
      this.game.currentPlayer % this.game.players.length;
    setTimeout(() => {
      this.game.playedCards.push(this.currentCard);
      this.pickCardAnimation = false;
    }, 1000);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
      }
    });
  }
}
