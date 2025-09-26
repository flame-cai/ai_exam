import { useState, useEffect, useRef } from 'react';
import logo from '../logo.svg';
import InstructionsPopup from './InstructionsPopup';
import html2pdf from 'html2pdf.js';

const TuringChat = (prop) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showSubmitPopup, setShowSubmitPopup] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [session, setSession] = useState(prop.session || {});

  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() !== "" && messages.length < 16) {
      const newMessages = [...messages, { role: 'user', content: inputMessage }];
      setMessages(newMessages);
      setInputMessage("");
      setIsThinking(true); // ✅ Start thinking state
      
      console.log('Sending messages:', newMessages); // Debug log
      console.log('Token:', prop.token ? 'Present' : 'Missing'); // Debug log
      console.log('About to fetch from:', "https://asia-south1-ppt-tts.cloudfunctions.net/ai-quiz1/chat"); // Debug log

      
      // Using /chat endpoint as per API documentation
      fetch("https://asia-south1-ppt-tts.cloudfunctions.net/ai-quiz1/chat",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${prop.token}`
          },
          // body: JSON.stringify({ messages: newMessages })
          
          body: JSON.stringify({ 
            ...session, 
            messages: newMessages 
          })
        }
      )
      .then(response => {
        console.log('Response status:', response.status); // Debug log
        console.log('Response headers:', response.headers); // Debug log
        return response.text().then(text => {
          console.log('Raw response:', text); // Debug log
          try {
            const data = JSON.parse(text);
            console.log('Parsed response data:', data); // Debug log
            if (response.ok) {
              setMessages(messages => [...messages, data]);
            } else {
              console.error('API Error:', data);
              alert(`Error: ${data.error || data.response || 'Unknown error'}`);
            }
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Response text was:', text);
            alert('Server returned invalid response format');
          }
        });
      })
      .catch(error => {
        console.error('Network Error:', error);
        alert('Network error occurred. Please try again.');
      })
      .finally(() => setIsThinking(false)); // ✅ Stop thinking after response
    }
  };

  const submitExam = () => {   
    console.log('Submit button clicked'); // Debug log
    html2pdf().from(document.getElementById('messages')).set({
      pagebreak: {
        avoid: 'span, div'
      },
      filename: prop.email.split('@')[0] + '.pdf'
    }).save(); 
    fetch("https://asia-south1-ppt-tts.cloudfunctions.net/ai-quiz1/submit",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${prop.token}`
        },
        body: JSON.stringify(session)
      }
    )
    .then(response => {
      console.log('Submit response status:', response.status); // Debug log
      return response.json().then(data => {
        console.log('Submit response data:', data); // Debug log
        console.log('Submit data properties:', Object.keys(data)); // Debug log
        console.log('Reattempt value:', data.reattempt, 'Type:', typeof data.reattempt); // Debug log
        console.log('Feedbacks:', data.feedbacks); // Debug log for practice mode
        if (response.ok) {
          // Check if it's an "Already Submitted" or "Max Attempts Reached" response
          if (data.response === "Already Submitted" || data.response === "Max Attempts Reached") {
            alert(data.response);
            return; // Don't show popup for these cases
          }
          
          // Show popup for both exam and practice mode results
          setSubmitResult(data);
          setShowSubmitPopup(true);
          console.log('Popup should show now'); // Debug log
        } else {
          if (data.response === "Already Submitted" || data.response === "Max Attempts Reached") {
            alert(data.response);
          } else {
            console.error('Submit API Error:', data);
            alert(`Submit Error: ${data.error || 'Unknown error'}`);
          }
        }
      });
    })
    .catch(error => {
      console.error('Submit Error:', error);
      alert('Submit failed. Please try again.');
    })
  };

  const endExam = () => {
    console.log('End exam clicked'); // Debug log
    fetch("https://asia-south1-ppt-tts.cloudfunctions.net/ai-quiz1/end",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${prop.token}`
        }
      }
    )
    .then(response => {
      console.log('End exam response:', response.status); // Debug log
      return response.json().then(data => {
        console.log('End exam data:', data); // Debug log
        if (response.ok) {
          prop.setProgress(1); // Go to completion
        } else {
          console.error('End exam error:', data);
          alert(`End exam error: ${data.error || 'Unknown error'}`);
        }
      });
    })
    .catch(error => {
      console.error('End exam network error:', error);
      alert('Failed to end exam. Please try again.');
    })
  };

  const handleReattempt = () => {
    console.log('Reattempt clicked'); // Debug log
    setShowSubmitPopup(false);
    setSubmitResult(null);
    setMessages([]); // Clear chat for new attempt
  };

  // const submitConsent = (value) => {
  //   fetch("https://asia-south1-ppt-tts.cloudfunctions.net/ai-quiz1/submit_consent",
  //     {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${prop.token}`
  //       },
  //       body: JSON.stringify({turing: value})
  //     }
  //   )
  //   .then(response => response.json()
  //     .then(data => {
  //       if (response.ok) {
  //         // Consent submitted successfully
  //         console.log('Consent submitted:', value);
  //       } else {
  //         console.error('Consent error:', data);
  //         alert(`Consent error: ${data.error || 'Unknown error'}`);
  //       }
  //     })
  //   )
  //   .catch(error => {
  //     console.error('Consent network error:', error);
  //   })
  // };

  return (
    <div className="wrapper-column">
      
      <div className="wrapper-row-top">
        <div className="reference-wrapper">
         
          <h4>Reference</h4>
          <span dangerouslySetInnerHTML={{ __html: session.reference || "" }}></span>
        </div>
        <div className="chat-wrapper">
          <div>
            Your goal is to write an essay on "Marie Curie"
          </div>
          <div  onClick={() => setIsPopupOpen(true)}>
              Click here to read the Instructions
          </div>

          {isPopupOpen && (
          <InstructionsPopup setIsPopupOpen={setIsPopupOpen} />
          )}
          <div id="messages" className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.role}-row`}>
                {msg.role === 'assistant' && (
                  <>
                    <div className="profile-picture-wrapper left">
                      <img src={logo} alt={`${msg.role} profile picture`} className={`profile-picture ${msg.role}-profile-picture`} />
                    </div>
                    <div className={`message ${msg.role}-msg`}>
                      <span>{msg.content}</span>
                    </div>
                  </>
                )}
                {msg.role !== 'assistant' && (
                  <>
                    <div className={`message ${msg.role}-msg`}>
                      <span>{msg.content}</span>
                    </div>
                    <div className="profile-picture-wrapper right">
                      <img src={prop.picture} alt={`${msg.role} profile picture`} className={`profile-picture ${msg.role}-profile-picture`} />
                    </div>
                  </>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="message-row assistant-row">
                <div className="profile-picture-wrapper left">
                  <img src={logo} alt="assistant profile picture" className="profile-picture assistant-profile-picture" />
                </div>
                <div className="message assistant-msg">
                  <div className="thinking-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="input-wrapper">
            <button className="new" onClick={() => { setMessages([]); }}>
              New Chat
            </button>&nbsp;
            {messages.length < 16 ? (
              <>
                <textarea
                  className="input"
                  value={inputMessage}
                  rows={4}
                  maxLength={250}
                  onDrop={(e) => e.preventDefault()}
                  onDragOver={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  onDrag={(e) => e.preventDefault()}
                  onDragEnd={(e) => e.preventDefault()}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder=" Type your message..."
                />&nbsp;
                <pre
                  style={{
                    display: "block",
                    bottom: "1vmin",
                    right: "12vmin",
                    fontSize: "12px",
                    color: "white",
                    pointerEvents: "none",
                  }}
                >
                  {250 - inputMessage.length} / {250}<br></br>character(s)<br></br>remaining
                </pre>&nbsp;
                <button className="send" onClick={sendMessage}>
                  Send
                </button>
              </>
            ) : (
              <div className="chat-limit-message">
                Chat limit exceeded. Start a new chat.
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="wrapper-row-bottom">
        <div className="submit-wrapper" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <button className="submit" type="submit" onClick={async () => {
            if (messages.length < 2) {
              alert("No Chat / Response to Submit.");
            } else {
              const lastAimessage = messages.slice().reverse().find(msg=> msg.role === "assistant")
              let confirmMessage = "Are you sure you want to submit? \n" +
              "By submitting, you acknowledge that you will not have the opportunity to make changes or resubmit."
              
              if (lastAimessage && lastAimessage.content.length < 100) {
                confirmMessage = "The AI's final response is less than 100 characters.\n" +
                "Are you sure you still want to submit?"
              }
              // const userConfirmed = window.confirm(
              //   "Are you sure you want to submit? \n\n" +
              //   "By submitting, you acknowledge that you will not have the opportunity to make changes or resubmit."
              // );
              const userConfirmed = window.confirm(confirmMessage);
              if (userConfirmed) {
                submitExam();
              }
            }
          }}>Submit</button>
        </div>
      </div>

      {/* Submit Result Popup */}
      {showSubmitPopup && submitResult && (
        <div className="popup-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="popup-content" style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ color: '#333', marginBottom: '20px' }}>
              {submitResult.feedbacks ? 'Practice Result' : 'Successfully submitted'}
            </h3>

            <div style={{ marginBottom: '20px', color: '#666' }}>
              {/* ✅ Practice Mode - Show Score + Feedbacks */}
              {submitResult.feedbacks && (
                <>
                  

                  {/* Feedbacks */}
                  {submitResult.feedbacks.length > 0 && (
                    <div style={{ marginTop: '20px', textAlign: 'left' }}>
                      <h4 style={{ color: '#333', marginBottom: '10px' }}>Feedback:</h4>
                      <div
                        style={{
                          backgroundColor: '#f8f9fa',
                          padding: '15px',
                          borderRadius: '5px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                        }}
                      >
                        {submitResult.feedbacks.map((feedback, index) => (
                          <div
                            key={index}
                            style={{
                              marginBottom: '10px',
                              padding: '8px',
                              backgroundColor: 'white',
                              borderRadius: '3px',
                              border: '1px solid #e9ecef',
                            }}
                          >
                            <small style={{ color: '#6c757d' }}>
                              Feedback {index + 1}:
                            </small>
                            <p style={{ margin: '5px 0 0 0', color: '#495057' }}>
                              {feedback}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ❌ Exam Mode - Don't show score here */}
              {!submitResult.feedbacks && submitResult.reattempt === 1 && (
                <>
                  <p>
                    <strong>New Max Marks if Reattempted:</strong>{" "}
                    {submitResult.new_max_marks || 'N/A'}
                  </p>
                  <p>
                    <strong>Attempts Left:</strong>{" "}
                    {submitResult.max_attempts - submitResult.attempts || 'N/A'}
                  </p>
                </>
              )}
            </div>

            {/* Debug info */}
            {/* <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
              Debug: {submitResult.feedbacks ? 'Practice Mode' : 'Exam Mode'} | reattempt = {JSON.stringify(submitResult.reattempt)}
            </div> */}

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              {/* Practice Mode - Only OK button */}
              {submitResult.feedbacks ? (
                <button 
                  onClick={() => {
                    setShowSubmitPopup(false);
                    setSubmitResult(null);
                    setMessages([]); 
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  OK
                </button>
              ) : (
                /* Exam Mode - End/Reattempt buttons */
                <>
                  <button 
                    onClick={endExam}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    End Exam
                  </button>
                  
                  {submitResult.reattempt === 1 && (
                    <button 
                      onClick={handleReattempt}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Reattempt
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TuringChat;