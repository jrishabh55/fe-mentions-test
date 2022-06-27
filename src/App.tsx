import './App.css';

import Mention, { MentionProps } from './components/Mention';

const mentions: MentionProps['mentions'] = [
  {
    data: ['@Rishabh', '@Anoop', '@Ritika'],
    symbol: '@'
  },
  {
    data: ['#javascript', '#reactJs', '@typescript'],
    symbol: '#'
  }
];

function App() {
  return (
    <div className="flex justify-center">
      <Mention mentions={mentions} />
    </div>
  );
}

export default App;
