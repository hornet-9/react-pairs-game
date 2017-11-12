import React, { Component } from 'react';
import logo from '../assets/logo.svg';

class Cards extends Component { // ONLY HAVE STUFF IN HERE THAT RELATES TO SINGLE CARD

  constructor() {
    super();
    this.state = {
      cardVisible: false,
      match: false,
      imageInlineStyles: null
    }
  }

  _flipCard() {

    // Don't flip same card / more that 2 at once
    if(!this.props.canFlip || this.state.cardVisible) {
      return;
    }
    
    let selectedCardImage = this.props.selectedCardImages[this.props.id];
    
    this.setState({ cardVisible: true,  imageInlineStyles: {left: selectedCardImage.x + 'px', top: selectedCardImage.y + 'px'}});

    let cardsFlipped = this.props.increaseCardCount();
    if (cardsFlipped % 2 === 0) {

      this.props.setCanFlip(false);

      // If a match
      if (this.props.selectedCardImages[this.props.firstCardInPair.props.id]['cardNumber'] === selectedCardImage.cardNumber) {
        this.props.firstCardInPair.setState({ match: true});
        this.setState({ match: true });

        // Game finished
        if (this.props.increaseMatchCount() === this.props.selectedCardImages.length / 2) {
          this.props.finishGame();
        }

        setTimeout(() => { // fade match formatting
          this.props.firstCardInPair.setState({ match: false});
          this.setState({ match: false });
          this.props.setCanFlip(true);
        }, 1200);

      } else {

        setTimeout(() => {
          this.props.firstCardInPair.setState({ cardVisible: false});
          this.setState({ cardVisible: false });
          }, 1300);

        setTimeout(() => {
          this.props.setCanFlip(true);
          // Reset coords to stop cheating!
          this.props.firstCardInPair.setState({ imageInlineStyles: {left: 0, top: 0} });
          this.setState({ imageInlineStyles: {left: 0, top: 0} });
          }, 1700);
      }

    } else {
      this.props.retainReferenceToFirstCardInPair(this);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.restart !== this.props.restart) {
      this.setState({cardVisible: false});
    }
  }

  render() {

    let level = this.props.level;
    let cardBlockWidth = level === 2 ? 16 : level === 1 ? 21 : 25;

    let cardBlockStyle = {
      width: cardBlockWidth + '%'
    }

    return (
      <div className="card-block" style={cardBlockStyle}>
        <div className={this.state.match ? 'card flipped match' : this.state.cardVisible ? 'card flipped' : 'card'} onClick={this._flipCard.bind(this)}>
        {this.props.image}
            <img src={logo} className="App-logo" alt="logo" draggable="false" />
            <div className="mask">
              <img src={this.props.spriteSheetUrl} className="spritesheet" alt="hidden" draggable="false" style={this.state.imageInlineStyles}/>
            </div>
        </div>
      </div>
    );
  }
}

export default Cards;
