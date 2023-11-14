import { Component, OnInit, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { onSnapshot, doc, Firestore, collection, addDoc, updateDoc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  
  game: Game;
  gameId: string;

  unsubGames;

  firestore: Firestore = inject(Firestore);


  constructor(private route: ActivatedRoute, public dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.newGame();
    this.route.params.subscribe((params) => {
      console.log(params['id']);    
      this.gameId = params['id'];

      this.unsubGames = onSnapshot(this.getSingleGameRef('games', this.gameId), (list: any) => {
        console.log('Game update: ', list.data());
        this.game.currentPlayer = list.data().currentPlayer;
        this.game.playedCards = list.data().playedCards;
        this.game.players = list.data().players;
        this.game.stack = list.data().stack;
        this.game.pickCardAnimation = list.data().pickCardAnimation;
        this.game.currentCard = list.data().currentCard;
      });
    })
  }

  ngOnDestroy(): void {
    this.unsubGames();
  }

  getGameRef() {
    return collection(this.firestore, 'games');
  }

  getSingleGameRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  async newGame() {
    this.game = new Game();
    
  }

  async takeCard() {
    if (!this.game.pickCardAnimation) {
      this.game.currentCard = this.game.stack.pop();
      this.game.pickCardAnimation = true;
      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      this.saveGame();

      setTimeout(() => {
        this.game.playedCards.push(this.game.currentCard);
        this.game.pickCardAnimation = false;
        this.saveGame();
      }, 1000);
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
        this.saveGame();
      }
    });
  }

  async saveGame() {
    let docRef = this.getSingleGameRef('games', this.gameId);
    await updateDoc(docRef, this.game.toJson()).catch(
      (err) => { console.log(err) }
    );
  }
}
