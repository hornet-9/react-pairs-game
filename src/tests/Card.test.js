import React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App from '../components/App';

configure({ adapter: new Adapter() });

let wrapper;
beforeEach(() => {
	wrapper = shallow(<App/>);

});
const start = () => {
	wrapper.find('button').first().simulate('click');
}

describe('On clicking a card', () => {
	let card;
	const clickCard = () => {
		card = wrapper.find('Card').first().dive();
		card.find('.card').simulate('click');
	}
	test('card becomes visible', () => {
		start();
		clickCard();
		expect(card.state().cardVisible).toBe(true);
	});
	test('spriteSheet positioned', () => {
		start();
		clickCard();
		expect(card.state().imageInlineStyles.left).toBeDefined();
		expect(card.state().imageInlineStyles.top).toBeDefined();
	});	
	test('card set as first card in pair', () => {
		expect(Object.keys(wrapper.state().firstCardInPair)).toHaveLength(0);
		start();
		clickCard();
		expect(wrapper.state().firstCardInPair.props.id).toBe(card.instance().props.id);
	});	
});

describe('On clicking second card', () => {
	test('if both cards have same card number, set both as matched', () => {
		expect(wrapper.state().cardsMatched).toBe(0);
		wrapper.instance().cardNumbersPerLevel = [2, 0, 0];
		start();
		wrapper.setState({cardsFlipped: 1});
		const card1 = wrapper.find('Card').at(0).dive();
		wrapper.setState({firstCardInPair: card1.instance()});
		const card2 = wrapper.find('Card').at(1).dive();
		card2.find('.card').simulate('click');
		expect(card1.state().match).toBe(true);
		expect(card2.state().match).toBe(true);
		expect(wrapper.state().cardsMatched).toBe(1);
	});
	test('if can\'t flip, card visibility remains false', () => {
		start();
		expect(wrapper.state().canFlip).toBe(true);
		wrapper.setState({canFlip: false});
		const card = wrapper.find('Card').at(0).dive();
		card.find('.card').simulate('click');
		expect(card.state().cardVisible).toBe(false);
	});
});