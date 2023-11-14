import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { onSnapshot, doc, Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Game } from 'src/models/game';


@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent {

  constructor(private firestore: Firestore, private router: Router) { }

  async newGame() {
    // Start game
    let game = new Game();

    await addDoc(collection(this.firestore, 'games'), game.toJson()).catch(
      (err) => { console.error(err) }
    ).then(
      (gameInfo: any) => {
        this.router.navigateByUrl('/game/' + gameInfo.id);        
      }
    );
  }
}
