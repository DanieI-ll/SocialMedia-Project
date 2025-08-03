import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Notifications.module.css';

interface Notification {
  _id: string;
  type: 'like' | 'comment' | 'follow';
  fromUser: { username: string; avatar?: string };
  postId?: { description: string; image?: string };
  createdAt: string;
  read: boolean;
}

function timeAgo(date: string) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return months + (months === 1 ? ' m' : ' m');
  if (weeks > 0) return weeks + (weeks === 1 ? ' w' : ' w');
  if (days > 0) return days + (days === 1 ? ' d' : ' d');
  if (hours > 0) return hours + (hours === 1 ? ' h' : ' h');
  if (minutes > 0) return minutes + (minutes === 1 ? ' min' : ' min');
  return 'just now';
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function fetchNotifications() {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getMessage = (n: Notification) => {
    switch (n.type) {
      case 'like':
        return 'liked your photo.';
      case 'comment':
        return 'commented on your photo.';
      case 'follow':
        return 'started following you.';
      default:
        return 'sent you a notification.';
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h4 className={styles.headerTitle}>New</h4>
      </div>
      <ul className={styles.notifications}>
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <li key={n._id} className={`${styles.item} ${n.read ? styles.read : styles.unread}`}>
              <img src={n.fromUser.avatar || '/default-avatar.png'} alt={n.fromUser.username} className={styles.avatar} />
              <div className={styles.content}>
                <p className={styles.lineBlock}>
                  <strong className={styles.username}>{n.fromUser.username}</strong> {getMessage(n)}
                  <span className={styles.date}>{timeAgo(n.createdAt)}</span>
                </p>
              </div>
              {n.postId?.image && <img src={n.postId.image} alt="post" className={styles.postImage} />}
              <button onClick={() => deleteNotification(n._id)} className={styles.deleteBtn}>
                ✕
              </button>
            </li>
          ))
        ) : (
          <p>No notifications</p>
        )}
      </ul>
    </div>
  );
}
