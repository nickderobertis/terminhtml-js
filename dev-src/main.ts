import './style.css';
import '../src/termynal.css';
import { TerminHTML } from '../src/terminhtml';

function runTerminHTMLApp() {
  new TerminHTML('#terminhtml-ansi', { initNow: true });
}

runTerminHTMLApp();
