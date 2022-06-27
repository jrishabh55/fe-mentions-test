import './App.css';

import Mention from './components/Mention';

function App() {
  return (
    <div className="flex justify-center">
      <Mention
        mentions={[
          {
            data: ['@Rishabh', '@Anoop', '@Ritika'],
            symbol: '@'
          },
          {
            data: ['#javascript', '#reactJs', '@typescript'],
            symbol: '#'
          }
        ]}
      />
    </div>
  );
}

export default App;
