import React, { useState } from "react";
import styles from "./Chat.module.css"
import { MessageCircle, Send } from "lucide-react";
import { useSendMessageMutation } from "../../../../../store/ai/manager/managerApi";

export function Chat() {
  const [ sendMessage ] = useSendMessageMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    const response = await sendMessage({ message }).unwrap();
    console.log("RESPONSE ", response);
    setMessage("");
  }

  return (
    <div className={`${styles.chat}`}>
      { isOpen &&
        <div className={`${styles.chatWrapper}`}>
          <div className={`${styles.chatWrapperTitle} bg-blue-600`}>
              Hello, I'm your AI assistant. 👋
          </div>

          <div className={`${styles.chatWrapperMessages}`}>
            <div className={`${styles.chatWrapperMessage}`}>
                Me
            </div>

            <div className={`${styles.chatWrapperMessage} ${styles.ai}`}>
                AI
            </div>
          </div>

          <div className={`${styles.chatWrapperAction}`}>
            <textarea
              className={styles.chatTextarea}
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            ></textarea>

            <button
              className={styles.chatSendButton}
              onClick={handleSend}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      }

      <div
        onClick={toggleChat}
        className={`${styles.chatButton} bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700`}
      >
        <MessageCircle className="w-6 h-6" />
      </div>
    </div>
  )
}