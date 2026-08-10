import { useEffect, useState } from 'react';
import { getNotificationPreferences, saveNotificationPreferences } from '../services/platformData';

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<Awaited<ReturnType<typeof getNotificationPreferences>>>({ categories: ['Bookings', 'Maintenance', 'Compliance', 'Announcements'], channels: ['Email', 'In-app', 'SMS'] });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const data = await getNotificationPreferences();
      setPreferences(data);
    })();
  }, []);

  const toggleCategory = (category: 'Bookings' | 'Maintenance' | 'Compliance' | 'Announcements') => {
    setPreferences((current) => ({
      ...current,
      categories: current.categories.includes(category) ? current.categories.filter((item) => item !== category) : [...current.categories, category],
    }));
  };

  const toggleChannel = (channel: 'Email' | 'In-app' | 'SMS') => {
    setPreferences((current) => ({
      ...current,
      channels: current.channels.includes(channel) ? current.channels.filter((item) => item !== channel) : [...current.channels, channel],
    }));
  };

  const handleSave = async () => {
    await saveNotificationPreferences(preferences);
    setSaved(true);
  };

  return (
    <div className="page-grid">
      <div className="panel-card">
        <h2>Notification preferences</h2>
        <p>Choose which updates you receive and through which channels.</p>
        {saved && <div className="success-pill">Preferences saved.</div>}
        <div className="filter-row">
          <div>
            <h3>Categories</h3>
            {(['Bookings', 'Maintenance', 'Compliance', 'Announcements'] as const).map((category) => (
              <label key={category} className="checkbox-row">
                <input type="checkbox" checked={preferences.categories.includes(category)} onChange={() => toggleCategory(category)} />
                <span>{category}</span>
              </label>
            ))}
          </div>
          <div>
            <h3>Channels</h3>
            {(['Email', 'In-app', 'SMS'] as const).map((channel) => (
              <label key={channel} className="checkbox-row">
                <input type="checkbox" checked={preferences.channels.includes(channel)} onChange={() => toggleChannel(channel)} />
                <span>{channel}</span>
              </label>
            ))}
          </div>
        </div>
        <button className="primary-btn" onClick={() => void handleSave()}>Save preferences</button>
      </div>
    </div>
  );
}
