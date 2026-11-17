import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';
import './heart.css';
import './atmosphere.css';
import './stationery.css';
import './delivery.css';
import './birthday.css';
import './music.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
