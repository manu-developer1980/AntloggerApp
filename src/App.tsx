import { Router } from './app/router';
import { Providers } from './app/providers';

function App() {
  return (
    <Providers>
      <Router />
    </Providers>
  );
}

export default App;