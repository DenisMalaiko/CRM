import React, { useState } from "react";
import styles from "./Chat.module.css"
import { MessageCircle, Send } from "lucide-react";
import { useAppDispatch } from "../../../../../store/hooks";

import { MessagesRoles } from "../../../../../enum/MessagesRoles";

import { useSelector } from "react-redux";
import { useSendMessageMutation, useCreateSessionMutation, useGetSessionsMutation } from "../../../../../store/ai/manager/managerApi";
import { RootState } from "../../../../../store";
import { setCurrentSession, setSessions, } from "../../../../../store/ai/manager/managerSlice";

export function Chat() {
  const dispatch = useAppDispatch();

  const [ sendMessage ] = useSendMessageMutation();
  const [ createSession ] = useCreateSessionMutation();
  const [ getSessions ] = useGetSessionsMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    const session = await createSession().unwrap();
    dispatch(setCurrentSession(session.data));

    const sessions = await getSessions().unwrap();
    dispatch(setSessions(sessions.data));

    const data = {
      sessionId: session.data.id,
      role: MessagesRoles.User,
      message: message
    };

    const response = await sendMessage({ data }).unwrap();

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