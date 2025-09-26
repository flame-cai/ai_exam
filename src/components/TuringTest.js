import { useState } from 'react';
import logo from '../logo.svg';
import TuringChat from './TuringChat';

const TuringTest = (prop) => {
  const [progress, setProgress] = useState(0); // Always start at 0 since we're removing review
  const [ai_response, setAIResponse] = useState('');

  const renderBody = () => {
    if (progress === 0) {
      return (
        <TuringChat 
          token={prop.token} 
          email={prop.data.email} 
          name={prop.data.name}
          picture={prop.data.picture} 
          // reference={prop.data.session?.reference || ''} 
          session={prop.data.session || {}}
          setProgress={setProgress} 
          setAIResponse={setAIResponse}
        />
      );
    } else if (progress === 1) {
      return (
        <div className="completion-message">
          <h4>
            Your submission has been recorded successfully.
            <br /><br />
            The Turing Test has been completed. You may now close this tab.
          </h4>
        </div>
      );
    }
  };

  return (
    <main>
      <header className="header">
        <div className="banner">
          <img src={logo} className="logo" alt="logo" />&nbsp;
          <h2>Turing Test</h2>
        </div>
        <div className="user">
          <div className="name">{prop.data.name || 'Demo User'}</div>
          <div className="email">[{prop.data.email || 'demo.user@email.com'}]</div>
        </div>
      </header>
      <div className="body">
        {renderBody()}
      </div>
      <footer className="footer">
        <p>Made with ❤️</p>
      </footer>
    </main>
  );
};

export default TuringTest;