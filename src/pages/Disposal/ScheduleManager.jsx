import { useState, useEffect } from 'react';
import { Download, List, CalendarDays, MapPin, Truck, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useDisposal } from '../../components/Disposal/DisposalContext';
import { completePickup } from '../../services/api';
import './ScheduleManager.css';

const ScheduleManager = () => {
  const { todaysRoute, acceptedRequests, stats, refresh } = useDisposal();
  const [viewMode, setViewMode] = useState('list');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [completing, setCompleting] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const today = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (year, month) => new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDay(currentYear, currentMonth);

  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const scheduledDays = {};
  if (isCurrentMonth) {
    scheduledDays[today.getDate()] = todaysRoute.length;
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const handleComplete = async (stop) => {
    try {
      setCompleting(stop.id);
      await completePickup(stop.id);
      await refresh();
    } catch (err) {
      console.error('Complete failed:', err);
      alert('Failed to mark as complete. Try again.');
    } finally {
      setCompleting(null);
    }
  };

  const inProgressCount = todaysRoute.filter(s => s.status === 'In Progress').length;
  const upcomingCount = todaysRoute.filter(s => s.status === 'Upcoming').length;

  // Use acceptedRequests directly if todaysRoute is empty
  const scheduleList = todaysRoute.length > 0 ? todaysRoute : acceptedRequests.map(r => ({
    id: r.rawId,
    generator: r.generator,
    address: r.location,
    time: r.date,
    wasteType: r.wasteType,
    status: 'Upcoming',
  }));

  return (
    <div className="schedule-manager-page">

      {/* STATS STRIP */}
      <div className="dashboard-card schedule-stats-strip">
        <div className="schedule-stat">
          <span className="schedule-stat-number">{scheduleList.length}</span>
          <span className="schedule-stat-label">Total Stops</span>
        </div>
        <div className="schedule-stat-divider"></div>
        <div className="schedule-stat">
          <span className="schedule-stat-number schedule-stat-blue">{inProgressCount}</span>
          <span className="schedule-stat-label">In Progress</span>
        </div>
        <div className="schedule-stat-divider"></div>
        <div className="schedule-stat">
          <span className="schedule-stat-number schedule-stat-gray">{upcomingCount}</span>
          <span className="schedule-stat-label">Upcoming</span>
        </div>
        <div className="schedule-stat-divider"></div>
        <div className="schedule-stat">
          <span className="schedule-stat-number schedule-stat-green">{acceptedRequests.length}</span>
          <span className="schedule-stat-label">Accepted</span>
        </div>
      </div>

      {/* TOP CONTROLS */}
      <div className="dashboard-card controls-bar">
        <div className="controls-left">
          <div className="segmented-control">
            <button
              className={`segment-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
              List
            </button>
            <button
              className={`segment-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays size={16} />
              Calendar
            </button>
          </div>
        </div>
        <button className="btn btn-primary btn-sm export-route-btn">
          <Download size={16} />
          Export Route
        </button>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="dashboard-card schedule-list-card">
          <div className="card-header">
            <h2>
              Today's Schedule — {today.toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric'
              })}
            </h2>
            <span className="pickup-count-badge">{scheduleList.length} pickups</span>
          </div>

          <div className="schedule-list">
            {scheduleList.length === 0 && (
              <div className="empty-state-inline">
                <Truck size={32} />
                <p>No pickups scheduled. Accept incoming requests to add them here.</p>
              </div>
            )}

            {scheduleList.map((stop, idx) => (
              <div key={stop.id} className="schedule-item">
                <div className="schedule-time-col">
                  <span className="schedule-time">{stop.time}</span>
                  <span className={`schedule-status-dot status-dot-upcoming`}></span>
                </div>
                <div className="schedule-info-col">
                  <div className="schedule-info-header">
                    <h4>{stop.generator}</h4>
                    <span className="route-status status-upcoming">
                      {stop.status}
                    </span>
                  </div>
                  <div className="schedule-info-details">
                    <span><MapPin size={13} /> {stop.address}</span>
                    <span><Truck size={13} /> {stop.wasteType}</span>
                  </div>
                  {/* COMPLETE BUTTON */}
                  <button
                    className="action-btn-accept"
                    style={{ marginTop: '10px', width: 'fit-content' }}
                    disabled={completing === stop.id}
                    onClick={() => handleComplete(stop)}
                  >
                    <CheckCircle2 size={15} />
                    <span>
                      {completing === stop.id ? 'Completing...' : 'Mark as Completed'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="dashboard-card calendar-card">
          <div className="calendar-header">
            <div className="calendar-nav">
              <button className="calendar-nav-btn" onClick={prevMonth}>
                <ChevronLeft size={20} />
              </button>
              <h2>{monthNames[currentMonth]} {currentYear}</h2>
              <button className="calendar-nav-btn" onClick={nextMonth}>
                <ChevronRight size={20} />
              </button>
            </div>
            {!isCurrentMonth && (
              <button className="today-btn" onClick={goToToday}>Today</button>
            )}
          </div>

          <div className="calendar-grid">
            {dayNames.map(d => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="calendar-cell empty"></div>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const isToday = isCurrentMonth && day === today.getDate();
              const pickupCount = scheduledDays[day] || 0;
              return (
                <div
                  key={day}
                  className={`calendar-cell ${isToday ? 'today' : ''} ${pickupCount > 0 ? 'has-pickups' : ''}`}
                >
                  <span className="cell-day">{day}</span>
                  {pickupCount > 0 && (
                    <span className="cell-dot-group">
                      <span className="cell-dot"></span>
                      <span className="cell-count">{pickupCount}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot legend-dot-today"></span>
              <span>Today</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot-pickup"></span>
              <span>Scheduled Pickups</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ScheduleManager;