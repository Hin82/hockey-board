import Board from './components/Board/Board';
import BottomToolbar from './components/Toolbar/BottomToolbar';
import { useBoardPersistence } from './hooks/useBoardPersistence';

function App() {
  useBoardPersistence();

  return (
    <div className="w-full h-full flex flex-col bg-slate-900">
      <Board />
      <BottomToolbar />
    </div>
  );
}

export default App;
