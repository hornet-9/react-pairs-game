import React, { Component } from 'react';
import Cards from './Cards';
import '../styles/Game.css';
import spriteSheetUrl from '../assets/Star_Wars.svg';
import sampleSize from 'lodash/sampleSize';
import shuffle from 'lodash/shuffle';
import CardImage from '../utils/CardImage';

class Game extends Component {

  constructor() {
    super();

    let storage = window.localStorage;
    if (storage) {
      if (!storage.getItem('pairs_level_0')) { storage.setItem('pairs_level_0', ' - ')}      
      if (!storage.getItem('pairs_level_1')) { storage.setItem('pairs_level_1', ' - ')}      
      if (!storage.getItem('pairs_level_2')) { storage.setItem('pairs_level_2', ' - ')}      
    }

    this.state = {
      bestScores: storage ? [storage.getItem('pairs_level_0'), storage.getItem('pairs_level_1'), storage.getItem('pairs_level_2')] : [],
      canFlip: true,
      cardsFlipped: 0,
      cardImages: this._createCardImages(),
      cardsMatched: 0,
      firstCardInPair: {},
      inProgress: false,
      level: 0,
      restart: false,
      selectedCardImages: [],
      successMessage: ''
    }
  }

  _createCardImages() {

    // Create an object for each image location from spritesheet
    let cardImages = [];

    cardImages.push(new CardImage(1, -40, -39));
    cardImages.push(new CardImage(2, -40, -86));
    cardImages.push(new CardImage(3, -40, -132));
    cardImages.push(new CardImage(4, -87, -39));
    cardImages.push(new CardImage(5, -87, -86));
    cardImages.push(new CardImage(6, -87, -132));
    cardImages.push(new CardImage(7, -133, -132));
    cardImages.push(new CardImage(8, -133, -86));
    cardImages.push(new CardImage(9, -180, -86));
    cardImages.push(new CardImage(10, -180, -132));

    return cardImages;
  }

  _startGame(level) {

    if(this.state.inProgress) {
      let restart = window.confirm("Game already in progress. Do you want to start again?");
      if (!restart) {
        return;
      }
    }

    const cardNumbersPerLevel = [8, 12, 18];
    
    this.setState({
      canFlip: true,
      cardsFlipped: 0,
      cardsMatched: 0,
      inProgress: true,
      level: level,
      restart: !this.state.restart,
      selectedCardImages: this._assignImagesToCards(cardNumbersPerLevel[level])
    }, () => {
      // only way to prevent ghost image dragging in Firefox
      let imgs = document.getElementsByTagName('img');
      for (let i = 0; i < imgs.length; i++) {
          imgs[i].onmousedown = (e) => e.preventDefault();
      }
    });
  }

  _assignImagesToCards = (cardsNumber) => {

      // Randomly choose cardsNumber/2 icons from 10 available
      let selectedImages = sampleSize(this.state.cardImages, cardsNumber/2);
      // Create corresponding pair for each array member
      selectedImages = selectedImages.concat(selectedImages);

      return shuffle(selectedImages);
   }

  _processFlippedCard(selectedCardImage, currentCard) {

    let cardsFlipped = this._increaseCardCount();
    if (cardsFlipped % 2 === 0) {

      this.setState({canFlip: false});

      // If a match
      if (this.state.selectedCardImages[this.state.firstCardInPair.props.id]['cardNumber'] === selectedCardImage.cardNumber) {
        this.state.firstCardInPair.setState({ match: true});
        currentCard.setState({ match: true });

        // Game finished
        if (this._increaseMatchCount() === this.state.selectedCardImages.length / 2) {
          this._finishGame(cardsFlipped);
        }

        setTimeout(() => { // fade match formatting
          this.state.firstCardInPair.setState({ match: false});
          currentCard.setState({ match: false });
          this.setState({canFlip: true});
        }, 1200);

      } else {

        setTimeout(() => {
          this.state.firstCardInPair.setState({ cardVisible: false});
          currentCard.setState({ cardVisible: false });
          }, 1300);

        setTimeout(() => {
          this.setState({canFlip: true});
          // Reset coords to stop cheating!
          this.state.firstCardInPair.setState({ imageInlineStyles: {left: 0, top: 0} });
          currentCard.setState({ imageInlineStyles: {left: 0, top: 0} });
          }, 1700);
      }

    } else {
      this.setState({firstCardInPair: currentCard});
    }
  }

  _increaseCardCount = () => {

    let count = this.state.cardsFlipped + 1;

    this.setState({
      cardsFlipped: count
    });

    return count;
  }

  _increaseMatchCount = () => {

    let count = this.state.cardsMatched + 1;

    this.setState({
      cardsMatched: count
    });

    return count;
  }

  _finishGame = (cardsFlipped) => {

    let turns = Math.floor(cardsFlipped / 2);
    let level = this.state.level;
    let successMessage = 'You finished with a score of';
    let bestScores = this.state.bestScores;
    if (bestScores.length) { // Only record best scores if local storage supported
      let bestScore = +bestScores[level];
      if (isNaN(bestScore) || turns < bestScore) {
        successMessage = 'You got a new best score of';
        window.localStorage.setItem('pairs_level_' + level, turns);
        bestScores[level] = turns;
        this.setState({bestScores: bestScores});
      } else if (turns === bestScore) {
        successMessage = 'You finished with an equal-best score of';
      }
    }
    this.setState({inProgress: false, successMessage});
  }

  render() {
    const cards = [];
    let turns = Math.floor(this.state.cardsFlipped / 2);
    let successMsgStyle = !this.state.inProgress && this.state.cardsMatched ? {opacity: 1} : {opacity: 0};

    for (let i = 0; i < this.state.selectedCardImages.length; i += 1) {
      cards.push(<Cards 
        key={i} 
        id={i}
        canFlip={this.state.canFlip}
        level={this.state.level}
        selectedCardImages={this.state.selectedCardImages} 
        spriteSheetUrl={spriteSheetUrl}
        processFlippedCard={this._processFlippedCard.bind(this)}
        restart={this.state.restart} />);
    };
    return (
      <div>
        <header>
          <h2>Pairs Game using React</h2>
          {this.state.bestScores.length && <p className="scores">Best Scores: Easy: {this.state.bestScores[0]}, Medium: {this.state.bestScores[1]}, Hard: {this.state.bestScores[2]}</p>}
          <h4>Select difficulty</h4>
          <span className="difficulties">
            <button onClick={this._startGame.bind(this, 0)}>Easiest</button>
            <button onClick={this._startGame.bind(this, 1)}>Mediumest</button>
            <button onClick={this._startGame.bind(this, 2)}>Hardest</button>
          </span>
          <p style={successMsgStyle}>Success! {this.state.successMessage} {turns}! Hit a button to play again.</p>
        </header>
        <section className="game">{cards}</section>
        <footer>
          {this.state.inProgress && <p>Turns taken: {turns}</p>}
        </footer>
      </div>
    );
  }
}

export default Game;
