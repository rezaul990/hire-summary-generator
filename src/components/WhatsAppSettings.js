import React, { useState, useEffect } from 'react';
import { AREAS } from '../config/supabaseClient';
import {
  saveWhatsAppConfigToFirebase,
  subscribeWhatsAppConfig
} from '../config/firebase';
import './WhatsAppSettings.css';

function WhatsAppSettings() {
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [recipients, setRecipients] = useState([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeWhatsAppConfig((data) => {
      if (data) {
        setGlobalEnabled(data.enabled !== undefined ? data.enabled : true);
        setRecipients(data.recipients && data.recipients.length > 0 ? data.recipients : [
          { id: String(Date.now()), label: '', phone: '', area: '', enabled: true }
        ]);
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleAddRecipient = () => {
    setRecipients(prev => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        label: '',
        phone: '',
        area: '',
        enabled: true
      }
    ]);
    setSaved(false);
    setError('');
  };

  const handleRemoveRecipient = (id) => {
    if (recipients.length === 1) {
      // If only one, just clear fields rather than leaving empty list
      setRecipients([{ id: String(Date.now()), label: '', phone: '', area: '', enabled: true }]);
    } else {
      setRecipients(prev => prev.filter(r => r.id !== id));
    }
    setSaved(false);
    setError('');
  };

  const handleRecipientChange = (id, field, value) => {
    setRecipients(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, [field]: value };
      }
      return r;
    }));
    setSaved(false);
    setError('');
  };

  const validate = () => {
    if (!globalEnabled) return '';

    const activeList = recipients.filter(r => r.enabled);
    if (activeList.length === 0) {
      return 'Please enable at least one recipient rule, or disable master switch.';
    }

    for (let i = 0; i < activeList.length; i++) {
      const r = activeList[i];
      const phone = (r.phone || '').trim();
      if (!phone) {
        return `Row #${i + 1}: Phone number is required.`;
      }
      if (!/^880\d{10}$/.test(phone)) {
        return `Row #${i + 1} (+${phone || '...'}): Must be a valid BD number (880 + 10 digits, e.g. 8801712345678).`;
      }
      if (!r.area) {
        return `Row #${i + 1}: Please select an area for recipient +${phone}.`;
      }
    }
    return '';
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    try {
      setSaving(true);
      setError('');
      await saveWhatsAppConfigToFirebase({
        enabled: globalEnabled,
        recipients
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (e) {
      setError(e.message || 'Failed to save to Firebase');
    } finally {
      setSaving(false);
    }
  };

  const activeCount = recipients.filter(r => r.enabled && r.phone && r.area).length;

  return (
    <div className="wa-settings-wrapper">
      {/* ── Header toggle ───────────────────────────────────── */}
      <button
        className="wa-settings-toggle"
        onClick={() => setIsOpen(o => !o)}
        title="WhatsApp Multi-Area & Multi-Number Settings"
      >
        <span className="wa-toggle-icon">📱</span>
        <div className="wa-toggle-info">
          <span className="wa-toggle-label">WhatsApp Report Dispatcher (Firebase)</span>
          <span className="wa-toggle-sub">
            {activeCount > 0 ? `${activeCount} Area/Number target(s) configured` : 'Configure numbers & areas'}
          </span>
        </div>
        <span
          className="wa-badge"
          style={{ background: globalEnabled && activeCount > 0 ? '#25d366' : '#888' }}
        >
          {loading ? '⏳ Syncing...' : (globalEnabled && activeCount > 0 ? `● ${activeCount} ACTIVE` : '○ OFF')}
        </span>
        <span className="wa-chevron">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* ── Expanded panel ────────────────────────────────────── */}
      {isOpen && (
        <div className="wa-settings-panel">
          <div className="wa-panel-header">
            <div>
              <h4>📱 WhatsApp Multi-Area & Number Dispatcher</h4>
              <p className="wa-panel-desc">
                Configure multiple phone numbers with their assigned areas. On every upload, each number will receive its dedicated area report automatically.
              </p>
            </div>

            {/* Master On/Off Switch */}
            <div className="wa-master-toggle">
              <label className="wa-toggle-switch">
                <input
                  type="checkbox"
                  checked={globalEnabled}
                  onChange={e => {
                    setGlobalEnabled(e.target.checked);
                    setSaved(false);
                  }}
                />
                <span className="wa-slider" />
              </label>
              <span className="wa-toggle-text">
                {globalEnabled ? 'Master: Enabled' : 'Master: Disabled'}
              </span>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#666', fontSize: '0.82rem' }}>
              ⏳ Loading settings from Firebase Realtime Database...
            </div>
          ) : (
            <>
              {/* Recipients list */}
              <div className={`wa-recipients-list ${!globalEnabled ? 'wa-field-disabled' : ''}`}>
                {recipients.map((rec, index) => (
                  <div key={rec.id} className={`wa-recipient-card ${!rec.enabled ? 'wa-card-disabled' : ''}`}>
                    <div className="wa-card-header">
                      <div className="wa-card-title">
                        <span className="wa-card-index">#{index + 1}</span>
                        <input
                          type="text"
                          className="wa-label-input"
                          placeholder={`Label (e.g. Incharge name, Designation)`}
                          value={rec.label || ''}
                          onChange={e => handleRecipientChange(rec.id, 'label', e.target.value)}
                        />
                      </div>
                      <div className="wa-card-actions">
                        <label className="wa-row-toggle" title="Enable/Disable this number">
                          <input
                            type="checkbox"
                            checked={rec.enabled}
                            onChange={e => handleRecipientChange(rec.id, 'enabled', e.target.checked)}
                          />
                          <span className="wa-slider-small" />
                        </label>
                        <button
                          type="button"
                          className="wa-btn-delete"
                          onClick={() => handleRemoveRecipient(rec.id)}
                          title="Remove this target"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="wa-card-body">
                      {/* Phone input */}
                      <div className="wa-field-col">
                        <label className="wa-col-label">📞 WhatsApp Number (BD)</label>
                        <div className="wa-input-row">
                          <span className="wa-prefix">+</span>
                          <input
                            type="tel"
                            className="wa-input"
                            placeholder="8801686691046"
                            value={rec.phone || ''}
                            onChange={e => handleRecipientChange(rec.id, 'phone', e.target.value.replace(/\D/g, '').slice(0, 13))}
                            maxLength={13}
                          />
                        </div>
                      </div>

                      {/* Area dropdown */}
                      <div className="wa-field-col">
                        <label className="wa-col-label">🗺️ Target Area Report</label>
                        <select
                          className="wa-select"
                          value={rec.area || ''}
                          onChange={e => handleRecipientChange(rec.id, 'area', e.target.value)}
                        >
                          <option value="">— Select Area —</option>
                          {AREAS.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {rec.enabled && rec.phone && rec.area && (
                      <div className="wa-card-summary">
                        ⚡ Will receive: <strong>{rec.area}</strong> Report on <strong>+{rec.phone}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add recipient button */}
              <div className="wa-add-bar">
                <button
                  type="button"
                  className="wa-btn-add"
                  onClick={handleAddRecipient}
                  disabled={!globalEnabled}
                >
                  ➕ Add Another Number & Area
                </button>
              </div>

              {/* Error box */}
              {error && <div className="wa-error">⚠️ {error}</div>}

              {/* Saved success box */}
              {saved && <div className="wa-success">✅ All recipient rules saved to Firebase Cloud!</div>}

              {/* Action buttons */}
              <div className="wa-actions">
                <button
                  className="wa-btn wa-btn-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? '⏳ Saving to Firebase...' : '💾 Save All Configurations'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default WhatsAppSettings;
