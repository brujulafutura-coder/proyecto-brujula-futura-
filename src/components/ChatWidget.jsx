import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { enviarMensajeChat } from '../services/api';
import './components.css';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: '¡Hola! Soy el Orientador Vocacional Virtual de Brújula Futura. ¿En qué te puedo ayudar hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input.trim();
    setInput('');
    
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Enviar historial completo al backend
      const res = await enviarMensajeChat(userText, messages);
      setMessages([...newMessages, { role: 'model', content: res.reply }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'model', content: 'Error del servidor: ' + e.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        className="chat-fab"
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle size={28} />
      </motion.button>

      {/* Ventana del Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Cabecera */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">
                  <Bot size={20} />
                </div>
                <div>
                  <h4>Orientador Virtual</h4>
                  <span>En línea</span>
                </div>
              </div>
              <button className="chat-close" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Mensajes */}
            <div className="chat-body">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'user' : 'model'}`}>
                  {msg.role === 'model' && <Bot size={14} className="bubble-icon" />}
                  <div className="bubble-content">
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {line.replace(/\*\*(.*?)\*\*/g, '$1')} {/* Simple bold cleanup */}
                        <br />
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-bubble model">
                  <Bot size={14} className="bubble-icon" />
                  <div className="bubble-content">
                    <Loader2 size={16} className="spin-icon" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <input
                type="text"
                placeholder="Pregunta sobre carreras..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={!input.trim() || isLoading}>
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
