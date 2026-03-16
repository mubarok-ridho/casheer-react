import React from 'react';
import { Menu } from '../../types';
import { formatCurrency } from '../../utils/format';

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const SlashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);
const TagIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

interface MenuCardProps {
  menu: Menu;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleAvailability?: () => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ menu, onEdit, onDelete, onToggleAvailability }) => {
  const available = menu.is_available;

  return (
    <div style={{
      background: 'white', borderRadius: '16px', overflow: 'hidden',
      border: `1.5px solid ${available ? 'rgba(0,0,0,0.07)' : 'rgba(232,96,74,0.2)'}`,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      opacity: available ? 1 : 0.85,
      transition: 'all 0.2s',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      {/* Image */}
      <div style={{ position: 'relative', height: '160px', background: '#f0ede8', overflow: 'hidden' }}>
        {menu.images?.[0] ? (
          <img src={menu.images[0].image_url} alt={menu.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: available ? 'none' : 'grayscale(30%)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🍽️</div>
        )}

        {/* Status badge */}
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700',
          background: available ? 'rgba(91,140,90,0.92)' : 'rgba(232,96,74,0.92)',
          color: 'white', backdropFilter: 'blur(4px)',
        }}>
          {available ? <CheckIcon /> : <SlashIcon />}
          {available ? 'Tersedia' : 'Habis'}
        </div>

        {/* Overlay "HABIS" watermark */}
        {!available && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.25)',
          }}>
            <div style={{
              padding: '6px 16px', border: '2px solid rgba(255,255,255,0.8)', borderRadius: '6px',
              color: 'white', fontSize: '14px', fontWeight: '800', letterSpacing: '0.12em',
              transform: 'rotate(-12deg)', textTransform: 'uppercase',
            }}>Habis</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ marginBottom: '8px' }}>
          <h3 style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '700', color: '#2a2420' }}>{menu.name}</h3>
          {menu.description && (
            <p style={{ margin: 0, fontSize: '12px', color: '#8a8278', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {menu.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {menu.category && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f0ede8', color: '#6b6560', borderRadius: '100px', padding: '3px 10px', fontSize: '11px', fontWeight: '600' }}>
              <TagIcon /> {menu.category.name}
            </span>
          )}
          {menu.variations && menu.variations.length > 0 && (
            <span style={{ background: '#e8f5fb', color: '#4AA8D8', borderRadius: '100px', padding: '3px 10px', fontSize: '11px', fontWeight: '600' }}>
              {menu.variations.length} variasi
            </span>
          )}
        </div>

        <p style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '800', color: '#5B8C5A', letterSpacing: '-0.01em' }}>
          {formatCurrency(menu.base_price)}
        </p>

        {/* Action buttons */}
        {(onEdit || onDelete || onToggleAvailability) && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Toggle availability — most prominent */}
            {onToggleAvailability && (
              <button onClick={onToggleAvailability} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                padding: '8px 0', borderRadius: '9px', border: 'none', cursor: 'pointer',
                fontSize: '12px', fontWeight: '700', transition: 'all 0.15s',
                background: available ? '#fdecea' : '#ebf4eb',
                color: available ? '#E8604A' : '#5B8C5A',
              }}>
                {available ? <><SlashIcon /> Set Habis</> : <><CheckIcon /> Set Tersedia</>}
              </button>
            )}

            {/* Edit */}
            {onEdit && (
              <button onClick={onEdit} style={{
                width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '9px', border: '1.5px solid #e8e4dc', background: 'white', cursor: 'pointer',
                color: '#6b6560', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f5f2ed'; (e.currentTarget as HTMLButtonElement).style.color = '#2a2420'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.color = '#6b6560'; }}
              >
                <EditIcon />
              </button>
            )}

            {/* Delete */}
            {onDelete && (
              <button onClick={onDelete} style={{
                width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '9px', border: '1.5px solid #fdecea', background: '#fdecea', cursor: 'pointer',
                color: '#E8604A', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f8d5d0'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fdecea'; }}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};