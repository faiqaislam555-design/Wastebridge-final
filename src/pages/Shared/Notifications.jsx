import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  AlertTriangle, 
  Star, 
  Bell, 
  MoreVertical,
  Check,
  PlusCircle,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Notifications.css';

const Notifications = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('All');

  // Generator specific notifications
  const generatorNotifications = [
    { id: 1, type: 'Pickups', title: 'Pickup Confirmed', message: 'EcoCycle Lahore confirmed your Apr 28 pickup.', time: '2 hours ago', read: false, icon: <CheckCircle size={20} />, color: '#16a34a', bg: '#f0fdf4' },
    { id: 2, type: 'Certificates', title: 'Certificate Ready', message: 'Download your compliance certificate for Apr 22 pickup.', time: '5 hours ago', read: false, icon: <FileText size={20} />, color: '#2563eb', bg: '#eff6ff' },
    { id: 3, type: 'Invoices', title: 'Invoice Due', message: 'Invoice #1042 of ₨4,800 is due in 3 days.', time: 'Yesterday', read: false, icon: <AlertTriangle size={20} />, color: '#d97706', bg: '#fffbeb' },
    { id: 4, type: 'Pickups', title: 'Pickup Cancelled', message: 'GreenHaul Co cancelled Apr 20 pickup.', time: 'Yesterday', read: true, icon: <XCircle size={20} />, color: '#dc2626', bg: '#fef2f2' },
    { id: 5, type: 'System', title: 'New Match Found', message: '2 new operators now serve your area.', time: '2 days ago', read: true, icon: <Star size={20} />, color: '#0d9488', bg: '#f0fdfa' },
  ];

  // Operator specific notifications
  const operatorNotifications = [
    { id: 1, type: 'Pickups', title: 'New Pickup Request', message: 'Green Bites Restaurant requested a pickup for Apr 30.', time: '1 hour ago', read: false, icon: <PlusCircle size={20} />, color: '#2563eb', bg: '#eff6ff' },
    { id: 2, type: 'Invoices', title: 'Payment Received', message: 'Payment of ₨12,500 received for Invoice #884.', time: '4 hours ago', read: false, icon: <CreditCard size={20} />, color: '#16a34a', bg: '#f0fdf4' },
    { id: 3, type: 'System', title: 'New Review Alert', message: 'A generator left a 5-star review for your last pickup.', time: '6 hours ago', read: false, icon: <MessageSquare size={20} />, color: '#d97706', bg: '#fffbeb' },
    { id: 4, type: 'Pickups', title: 'Pickup Reminder', message: 'Pickup scheduled at Pearl Continental in 2 hours.', time: 'Today', read: true, icon: <Bell size={20} />, color: '#4b5563', bg: '#f3f4f6' },
  ];

  const [notifications, setNotifications] = useState(
    currentUser?.role === 'operator' ? operatorNotifications : generatorNotifications
  );

  const tabs = ['All', 'Pickups', 'Certificates', 'Invoices', 'System'];

  const filteredNotifications = activeTab === 'All' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="header-top">
          <h1>All Notifications</h1>
          <button className="mark-all-btn" onClick={markAllAsRead}>
            Mark all as read
          </button>
        </div>

        <div className="filter-tabs">
          {tabs.map(tab => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="item-left">
                <div 
                  className="icon-circle" 
                  style={{ backgroundColor: notification.bg, color: notification.color }}
                >
                  {notification.icon}
                </div>
              </div>
              <div className="item-middle">
                <div className="message-content">
                  <span className="title">{notification.title}</span>
                  <p className="message">{notification.message}</p>
                  <span className="time">{notification.time}</span>
                </div>
              </div>
              <div className="item-right">
                {!notification.read && (
                  <button 
                    className="mark-read-btn"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-notifications">
            <Bell size={48} />
            <p>No notifications in this category.</p>
          </div>
        )}
      </div>

      <div className="load-more-container">
        <button className="load-more-btn">
          Load older notifications
        </button>
      </div>
    </div>
  );
};

export default Notifications;
