import { ArrowLeft, Search } from 'lucide-react';
import { statusLabel } from './AdminUtils.js';
import '../admin/view/AdminUi.css';

export function BackLink({ onClick, children = 'Назад' }) {
  return (
    <button className="dAdminBackLink" type="button" onClick={onClick}>
      <ArrowLeft size={16} />
      {children}
    </button>
  );
}

export function SearchBox({ value, onChange, placeholder = 'Търсене…', wide = false }) {
  return (
    <label className={`dAdminSearchBox ${wide ? 'dAdminSearchBox--wide' : ''}`}>
      <Search size={17} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function FilterTabs({ value, onChange, items }) {
  return (
    <div className="dAdminFilterRow" role="tablist" aria-label="Филтри">
      {items.map((item) => (
        <button
          key={item.value}
          className={value === item.value ? 'is-active' : ''}
          type="button"
          onClick={() => onChange(item.value)}
        >
          {item.label}
          {typeof item.count === 'number' && <span>{item.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function StatusBadge({ status, tone }) {
  const resolvedTone = tone || (
    ['high', 'cancelled', 'deleted'].includes(status)
      ? 'danger'
      : ['new', 'pending', 'waiting_for_lawyer', 'draft'].includes(status)
        ? 'warning'
        : ['confirmed', 'completed', 'visible', 'published', 'lawyer_joined'].includes(status)
          ? 'success'
          : 'neutral'
  );

  return (
    <span className={`dAdminStatus dAdminStatus--${resolvedTone}`}>
      {statusLabel(status)}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, text, compact = false, action }) {
  return (
    <div className={`dAdminEmptyState ${compact ? 'dAdminEmptyState--compact' : ''}`}>
      {Icon && <span className="dAdminEmptyState__icon"><Icon size={22} /></span>}
      <div>
        <strong>{title}</strong>
        {text && <span>{text}</span>}
      </div>
      {action}
    </div>
  );
}

export function TextField({ label, value, onChange, type = 'text', placeholder = '', className = '' }) {
  return (
    <label className={`dAdminField ${className}`}>
      <span>{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={(event) => {
          const nextValue = type === 'number'
            ? (event.target.value === '' ? '' : Number(event.target.value))
            : event.target.value;
          onChange(nextValue);
        }}
        placeholder={placeholder}
      />
    </label>
  );
}

export function TextAreaField({ label, value, onChange, rows = 4, placeholder = '', className = '' }) {
  return (
    <label className={`dAdminField ${className}`}>
      <span>{label}</span>
      <textarea
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
      />
    </label>
  );
}

export function SelectField({ label, value, onChange, children, className = '' }) {
  return (
    <label className={`dAdminField ${className}`}>
      <span>{label}</span>
      <select value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

export function ToggleField({ label, description, checked, onChange }) {
  return (
    <label className="dAdminSettingToggle">
      <span>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
      />
      <i aria-hidden="true" />
    </label>
  );
}
