import React from 'react';

const PageHeader = ({ title, subtitle, icon, actions }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {icon && (
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
          background: 'var(--primary-glow)',
          border: '1px solid rgba(236, 72, 153, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          {icon}
        </div>
      )}
      <div>
        <h1 style={{
          fontSize: '22px', fontWeight: '800',
          color: 'var(--text-main)', margin: 0, lineHeight: 1.2
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: '4px 0 0', textTransform: 'capitalize' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {actions && (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {actions}
      </div>
    )}
  </div>
);

export default PageHeader;
