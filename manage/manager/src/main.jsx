import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { loadTheme } from 'office-ui-fabric-react';
import { FluentProvider } from '@fluentui/react-components';
import 'office-ui-fabric-react/dist/css/fabric.css';
import './index.css';

// กำหนด theme พร้อมกับการใช้ฟอนต์ Kanit
const theme = {
  palette: {
    themePrimary: '#fd6e2B',
    themeLighterAlt: '#fff9f6',
    themeLighter: '#ffe7dd',
    themeLight: '#fed3bf',
    themeTertiary: '#fda77f',
    themeSecondary: '#fd7f44',
    themeDarkAlt: '#e36227',
    themeDark: '#c05321',
    themeDarker: '#8d3d18',
    neutralLighterAlt: '#f8f8f8',
    neutralLighter: '#f4f4f4',
    neutralLight: '#eaeaea',
    neutralQuaternaryAlt: '#dadada',
    neutralQuaternary: '#d0d0d0',
    neutralTertiaryAlt: '#c8c8c8',
    neutralTertiary: '#beb2d1',
    neutralSecondary: '#8672a3',
    neutralPrimaryAlt: '#594378',
    neutralPrimary: '#473366',
    neutralDark: '#36274e',
    black: '#281d39',
    white: '#fff',
    bodyBackground: '#fff',
    bodyText: '#473366',
  },
  fonts: {
    // small: {
    //   fontSize: '12px',
    //   fontFamily: 'Kanit, sans-serif',
    // },
    // medium: {
    //   fontSize: '14px',
    //   fontFamily: 'Kanit, sans-serif',
    // },
    // large: {
    //   fontSize: '18px',
    //   fontFamily: 'Kanit, sans-serif',
    // },
    // xLarge: {
    //   fontSize: '24px',
    //   fontFamily: 'Kanit, sans-serif',
    // },
  },
};

// ใช้ theme ใหม่พร้อมกับฟอนต์ Kanit
loadTheme(theme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Fabric>
      <App />
    </Fabric>
  </StrictMode>,
);