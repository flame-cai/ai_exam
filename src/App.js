
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import logo from './logo.svg';
import './App.css';
import TuringTest from './components/TuringTest';
import DataAnalyzer from './components/DataAnalyzer';

function App() {
  const [mode, setMode] = useState(null);
  const [topics, setTopics] = useState([]);
  const [token, setToken] = useState(null);
  useEffect(() => {

    console.clear();

    fetch("https://asia-south1-ppt-tts.cloudfunctions.net/ai-quiz1/mode")
    .then(res => res.json())
    .then(data => {
      if (data.mode) {
        setMode(data.mode);
      }
    })
    .catch(err => {
      console.error("Failed to fetch mode:", err);
    });
    console.log("%cWARNING", "color: red; font-size: 50px; font-weight: bold;");
    console.log(
        "%c##############################\n" +
        "Unauthorized Access Prohibited\n" +
        "##############################\n" +
        "This console is intended for use by authorized personnel only. " +
        "If you have been instructed to enter or execute any code here to manipulate or bypass examination controls, " +
        "please be advised that such actions are strictly prohibited and will be treated as a violation of the examination code of conduct.\n\n" +
        "Unauthorized activity will result in immediate disqualification from the examination, " +
        "and further disciplinary or legal actions may follow.\n",
        "font-size: 16px; color: white; background-color: black; padding: 6px;"
    );
    console.log(
        "%cMonitoring and Logging Notice:\n" +
        "----------------------------------\n" +
        "All actions in this console are monitored and logged. " +
        "Any attempts to interfere with the system will be detected and recorded.\n",
        "font-size: 14px; color: yellow; background-color: black; padding: 4px;"
    );

    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
    document.addEventListener('cut', function(e) {
      e.preventDefault();
    });
    document.addEventListener('copy', function(e) {
      e.preventDefault();
    });
    document.addEventListener('paste', function(e) {
      e.preventDefault();
    });
    document.addEventListener('touchstart', function(e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    });
    document.addEventListener('beforeinput', function(e) {
      if (e.inputType === 'historyUndo' || e.inputType === 'historyRedo') {
        e.preventDefault();
      }
    });
    function isMacOS() {
      if (navigator.userAgentData) {
        return navigator.userAgentData.platform === 'macOS';
      } else {
        return /Macintosh|MacIntel|MacPPC|Mac68K|iPhone|iPad|iPod/.test(navigator.userAgent);
      }
    }
    document.addEventListener('keydown', function(e) {
      const isMac = isMacOS();
      if ((!isMac && e.ctrlKey && e.key === 'a') || (isMac && e.metaKey && e.key === 'a')) {
        e.preventDefault();
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
      if (isMac && e.metaKey && e.altKey && e.key === 'I') {
        e.preventDefault();
      }
      if (isMac && e.metaKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
      }
    });

    const scriptId = 'google-client-script';

    const handleCredentialResponse = (response) => {
      const token = response.credential;
      setToken(token);
      fetch("https://asia-south1-ppt-tts.cloudfunctions.net/ai-quiz1/login",
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          }
        }
      )
      .then(response => response.json()
        .then(data => {
          if (response.ok) {
            // Get Mode AFTER login using the token

            
            fetch("https://asia-south1-ppt-tts.cloudfunctions.net/ai-quiz1/mode", {
              method: 'GET',
              headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
              }
            })
              .then(res => res.json())
              .then(modeData => {
                if (modeData.mode) {
                  setMode(modeData.mode);
                }
              })
              .catch(err => {
                console.error("Failed to fetch mode:", err);
              });

            setTopics(data.topics || []); // Store topics from login response

            const handleTopicSelect = async (topic) => {
              try {
                const res = await fetch("https://asia-south1-ppt-tts.cloudfunctions.net/ai-quiz1/topic", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                  },
                  body: JSON.stringify({ topic })
                });

                const result = await res.json();

                console.log("Reference received:", result.reference);

                const root = createRoot(document.getElementById("main"));
                // Create payload with all necessary data from login response plus new topic data
                const payload = { 
                  email: data.email,
                  name: data.name,
                  picture: data.picture,
                  topics: data.topics,
                  session: {
                    ...data.session,
                    topic: topic,
                    reference: result.reference
                  }
                };
                //root.render(<TuringTest token={token} data={payload} />);
                root.render(<TuringTest 
                            token={token} 
                            data={payload} 
                            onBack={() => {
                              // re-render topic selection
                              window.location.reload();
                              const buttons = createRoot(document.getElementById("google-button"));
                              buttons.render(
                                <div>
                                  {data.topics.map((topic) => (
                                    <button
                                      key={topic}
                                      className="app-button"
                                      onClick={() => handleTopicSelect(topic)}
                                    >
                                      {topic}
                                    </button>
                                  ))}
                                </div>
                              );

                              // clear main div
                              document.getElementById("main").innerHTML = `
                                <h1>AI for Non - STEM</h1>
                                <h2 style="color:#d6d4d4">Current Mode: ${mode}</h2>
                                <img src="${logo}" class="App-logo" alt="logo" />
                                <br />
                                <div id="google-button"></div>
                              `;
                            }} 
                          />)
              } catch (err) {
                console.error("Failed to set topic:", err);
              }
            };

            // Render topic buttons
            const buttons = createRoot(document.getElementById("google-button"));
            buttons.render(
              <div>
                {data.topics.map((topic) => (
                  <button
                    key={topic}
                    className="app-button"
                    onClick={() => handleTopicSelect(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            );

          } else {
            document.getElementById("main").innerHTML = `<h1 style="color: red;">${data.error}</h1>`;
          }
        })
      )
      .catch(error => {
        console.error('Error:', error);
      })
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      document.head.appendChild(script);
    }

    window.onGoogleLibraryLoad = () => {
      google.accounts.id.initialize({
        client_id: '1066118926351-dskshp8i64e3e4i5rr76h85rfbhh5cc0.apps.googleusercontent.com',
        auto_select: true,
        callback: handleCredentialResponse,
        context: "use",
        itp_support: true,
        hd: 'flame.edu.in',
        use_fedcm_for_prompt: true,
      });
      google.accounts.id.prompt();
      google.accounts.id.renderButton(
        document.getElementById("google-button"),
        {
          text: 'continue_with',
          theme: "filled_black",
          shape: 'pill',
        }
      );
    };
  }, []);

  return (
    <div id="main" className="App">
      <h1>AI for Non - STEM</h1>
      {mode && <h2 style={{ color: '#d6d4d4' }}>Current Mode: {mode}</h2>}

      <img src={logo} className="App-logo" alt="logo" />
      <br />
      <div id="google-button"></div>
    </div>
  );
}

export default App;