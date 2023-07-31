import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from 'src/models/game';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-startscreen',
  templateUrl: './startscreen.component.html',
  styleUrls: ['./startscreen.component.scss'],
})
export class StartscreenComponent implements OnInit {
  game: Game = new Game();
  constructor(private firestore: Firestore, private router: Router) {}

  ngOnInit(): void {}

  newGame() {
    //Start Game
    const jsonObject = this.game.toJson();

    addDoc(collection(this.firestore, 'games'), jsonObject)
      .then((docRef) => {
        this.router.navigateByUrl('/game/' + docRef.id);
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
      });
  }
}
