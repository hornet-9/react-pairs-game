import React, { Component } from 'react';
import logo from '../assets/logo.svg';

class Cards extends Component {

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

    this.props.processFlippedCard(selectedCardImage, this);
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
            <img src={this.props.spriteSheetUrl} className="spritesheet" alt="hidden" draggable="false" style={this.state.imageInlineStyles} />
          </div>
        </div>
      </div>
    );
  }
}

export default Cards;
