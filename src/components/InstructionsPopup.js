import React from "react";

const InstructionsPopup = ({ setIsPopupOpen }) => {
  return (
    <div
      className="popup-overlay"
      role="dialog"
      aria-labelledby="popup-header"
      aria-modal="true"
    >
      <div className="popup-content">
        <button
          className="close-btn"
          aria-label="Close"
          onClick={() => setIsPopupOpen(false)}
        >
          &times;
        </button>

        <h3 id="popup-header">Instructions</h3>
        <section className="popup-body">
          <article>
            <p>
              Write an essay (around 250 words) on the selected topic using the chatbot. The final output should read naturally and be indistinguishable from human writing. On the left side of the screen, you’ll see a human-written essay, you can use that as a reference for style, structure, and content.
            </p>
            <p>
              Your goal is to guide the chatbot to produce a polished, error-free version. You may give up to <strong>8 prompts</strong> per chat session, and you can reset and start a new session as many times as needed.
            </p>
            <p>
              Direct copy-pasting from the reference essay is not allowed, instead, use prompts to get the AI-generated essay.
            </p>
            <p>
              You can only ask the chatbot to write or update the essay, yes-or-no type questions or information verification is not allowed. 
            </p>
          </article>
        </section>
      </div>
    </div>
  );
};

export default InstructionsPopup;
