import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your AI assistant. Need place recommendations?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text, mood: new URLSearchParams(window.location.search).get("mood") })
      });
      const data = await res.json();
      
      setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
    } catch (err) {
      setMessages((prev) => [...prev, { text: "Sorry, I'm having trouble connecting to the server.", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`} 
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle size={28} color="white" />
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h4>AI Assistant</h4>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="message bot typing">Typing...</div>}
          </div>
          
          <form className="chatbot-input" onSubmit={sendMessage}>
            <input 
              type="text" 
              placeholder="Ask for suggestions..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
            />
            <button type="submit" disabled={!input.trim() || loading}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
