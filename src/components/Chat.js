import { useState, useEffect, useRef } from 'react';
import logo from '../logo.svg';
import html2pdf from 'html2pdf.js';

const Chat = (prop) => {
  const [messages, setMessages] = useState(prop.messages);
  const [inputMessage, setInputMessage] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    setIsChecked(false);
    if (inputMessage.trim() !== "" && messages.length < 16) {
      setMessages([...messages, { role: 'user', content: inputMessage }]);
      setInputMessage("");
      fetch("https://asia-south1-ppt-tts.cloudfunctions.net/ai-quiz1/chat",
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${prop.token}`
          },
          body: JSON.stringify({ messages: [...messages, { role: 'user', content: inputMessage }] })
        }
      )
      .then(response => response.json()
        .then(data => {
          if (response.ok) {
            setMessages(messages => [...messages, data]);
          } else {
            document.getElementById("main").innerHTML = `<h1 style="color: red;">${data.error}</h1>`;
          }
        })
      )
      .catch(error => {
        console.error('Error:', error);
      })
    }
  };

  const submitExam = () => {
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
          'Authorization': `Bearer ${prop.token}`
        }
      }
    )
    .then(response => response.json()
      .then(data => {
        if (response.ok) {
          prop.setProgress(1);
          prop.setAIResponse(data.ai_response);
        } else {
          document.getElementById("main").innerHTML = `<h1 style="color: red;">${data.error}</h1>`;
        }
      })
    )
    .catch(error => {
      console.error('Error:', error);
    })
  };

  return (
    <div className="wrapper-column">
      <div className="wrapper-row-top">
        <div className="reference-wrapper">
          <h4>Reference</h4>
          <span dangerouslySetInnerHTML={{ __html: prop.user_response }}></span>
        </div>
        <div className="chat-wrapper">
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
            <div ref={messagesEndRef} />
          </div>
          <div className="input-wrapper">
            <button className="new" onClick={() => { setMessages([]); setIsChecked(false); }}>
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
        <div className="confirm-wrapper">
          <input type="checkbox" id="confirm" name="confirm" value="confirm" checked={isChecked} onChange={() => setIsChecked(!isChecked)}></input>&nbsp;
          <label for="confirm">I acknowledge that by submitting my exam, I will not have the opportunity to resubmit.</label>
        </div>
        <div className="submit-wrapper">
          <button className="submit" type="submit" onClick={() => {
            if (messages.length < 2) {
              alert("No Chat / Response to Submit.");
            } else if (!isChecked) {
              alert("Please check the acknowledgement box before submitting.");
            } else {
              submitExam();
            }
          }}>Submit Exam</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
