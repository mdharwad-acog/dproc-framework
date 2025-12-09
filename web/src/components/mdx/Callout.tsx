import React from 'react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  children: React.ReactNode;
}

export const Callout = ({ type = 'info', title, children }: CalloutProps) => (
  <div className={`callout callout-${type}`}>
    <div className="callout-icon">
      {type === 'warning' ? '⚠️' : type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}
    </div>
    <div className="callout-content">
      {title && <div className="callout-title">{title}</div>}
      <div className="callout-body">{children}</div>
    </div>
  </div>
);
