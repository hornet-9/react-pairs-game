import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App from '../components/App';
import Card from '../components/Card';

configure({ adapter: new Adapter() });

describe('On first page load', () => {
	let wrapper;
	beforeEach(() => {
		wrapper = shallow(<App/>);
	});
	const testGameSetUp = (level) => {
		wrapper.find('button').at(level).simulate('click');
		expect(wrapper.state().canFlip).toBe(true);
		expect(wrapper.state().inProgress).toBe(true);
		expect(wrapper.state().cardsFlipped).toBe(0);
		expect(wrapper.state().cardsMatched).toBe(0);
		expect(wrapper.state().level).toBe(level);
		expect(wrapper.state().selectedCardImages).toHaveLength(wrapper.instance().cardNumbersPerLevel[level]);
	};

	test('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<App />, div);
	});
	test('renders header text and buttons', () => {
		expect(wrapper.find('header').first().contains(<h1>Pairs Game using React</h1>)).toBe(true);
		expect(wrapper.find('header button')).toHaveLength(3);
	});
	test('game isn\'t in progress', () => {
		expect(wrapper.state().inProgress).toBe(false);
	});
	test('best scores are displayed if local storage', () => {
		expect(wrapper.find('.scores')).toHaveLength(0);
		wrapper.setState({bestScores: [10, 15, 21]});
		expect(wrapper.find('.scores').first().contains(<p className="scores">Best Scores: Easy: 10, Medium: 15, Hard: 21</p>)).toBe(true);
	});
	test('doesn\'t render footer text', () => {
		expect(wrapper.find('footer').first().contains(<p>Turns taken: 0</p>)).toBe(false);
	});
	test('success text not visible', () => {
		expect(wrapper.find('.success-text').prop('style').opacity).toBe(0);
	});
	test('card image objects created from spritesheet', () => {
		expect(wrapper.state().cardImages).toHaveLength(10);
		expect(wrapper.state().cardImages[Math.floor(Math.random() * 10)].x).toBeDefined();
		expect(wrapper.state().cardImages[Math.floor(Math.random() * 10)].y).toBeDefined();
		expect(wrapper.state().cardImages[Math.floor(Math.random() * 10)].cardNumber).toBeDefined();
	});
	test('clicking first level button starts game by correctly setting state', () => {
		testGameSetUp(0);
	});
	test('clicking second level button starts game by correctly setting state', () => {
		testGameSetUp(1);
	});
	test('clicking third level button starts game by correctly setting state', () => {
		testGameSetUp(2);
	});
});

describe('On game start', () => {
	const testDealCards = (level) => {
		const wrapper = mount(<App/>);
		wrapper.instance().cardNumbersPerLevel = [2, 14, 20];
		wrapper.find('button').at(level).simulate('click');
		expect(wrapper.find('section .card')).toHaveLength(wrapper.instance().cardNumbersPerLevel[level]);
	};
	const testCardSpacing = (level) => {
		const wrapper = shallow(<Card level={level}/>);
		const cardSpacing = wrapper.state().cardSpacing;
		expect(wrapper.find('.card-block').first().prop('style').width).toBe(cardSpacing[level]);
	};
	test('correct number of Card components created', () => {
		testDealCards(0);
		testDealCards(1);
		testDealCards(2);
	});
	test('initial card visibility is false and without a match', () => {
		const wrapper = shallow(<Card />);
		expect(wrapper.state().cardVisible).toBe(false);
		expect(wrapper.state().match).toBe(false);
	});
	test('cards correctly spaced depending on level', () => {
		testCardSpacing(0);
		testCardSpacing(1);
		testCardSpacing(2);
	});
	test('spriteSheet defined', () => {
		const wrapper = mount(<App />);
		wrapper.find('button').first().simulate('click');
		const card = wrapper.find('.card').first();
		card.find('.spritesheet').prop('src');
		expect(card.find('img.spritesheet').prop('src')).toBeDefined();
	});
});

describe('On clicking a card', () => {
	test('increase cards flipped by one', () => {
		const wrapper = mount(<App />);
		expect(wrapper.state().cardsFlipped).toBe(0);
		wrapper.find('button').first().simulate('click');
		const card = wrapper.find('.card').first();
		card.simulate('click');
		expect(wrapper.state().cardsFlipped).toBe(1);
	});
});

describe('On clicking second card', () => {
	let wrapper;
	let card1;
	beforeEach(() => {
		wrapper = shallow(<App/>);

	});
	const clickFirstCard = () => {
		wrapper.find('button').first().simulate('click');
		wrapper.setState({cardsFlipped: 1});
		card1 = wrapper.find('Card').at(0).dive();
		wrapper.setState({firstCardInPair: card1.instance()});
	}
	const clickSecondCard = () => {
		const card2 = wrapper.find('Card').at(1).dive();
		card2.find('.card').simulate('click');	
	}
	test('cannot immediately flip again', () => {
		clickFirstCard();
		expect(wrapper.state().canFlip).toBe(true);
		card1.find('.card').simulate('click');
		expect(wrapper.state().canFlip).toBe(false);
	});
	test('if all cards matched, set in progress = false', () => {
		wrapper.instance().cardNumbersPerLevel = [2, 0, 0];
		clickFirstCard();
		clickSecondCard();
		expect(wrapper.state().inProgress).toBe(false);
	});
	test('renders footer text with correct turns', () => {
		clickFirstCard();
		clickSecondCard();
		expect(wrapper.update().find('footer').first().contains(<p>Turns taken: 1</p>)).toBe(true);
	});
});

describe('On finishing game', () => {
	let wrapper;
	beforeEach(() => {
		wrapper = shallow(<App/>);
	});
	test('success message correct', () => {
		wrapper.setState({level: 2, bestScores: [0, 0, 12]});
		const cardsFlipped = 24;
		wrapper.instance()._finishGame(cardsFlipped);
		expect(wrapper.state().successMessage).toEqual('You finished with an equal-best score of');
	});
	test('success text visible', () => {
		wrapper.setState({cardsMatched: 2});
		wrapper.instance()._finishGame(10);
		expect(wrapper.find('.success-text').prop('style').opacity).toBe(1);
	});
});
