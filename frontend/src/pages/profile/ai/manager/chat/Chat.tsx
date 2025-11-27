import styles from "./Chat.module.css"

export function Chat() {

  return (
    <div className={`${styles.chat}`}>
      <div className="chat-wrap">
      </div>

      <div className={`${styles.chatButton} bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700`}>
        Open
      </div>
    </div>
  )
}