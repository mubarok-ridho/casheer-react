import React, { useState } from 'react';
import { Menu } from '../../types';
import { formatCurrency } from '../../utils/format';

// ── Icons ──────────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const SlashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);
const TagIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const LeafIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

interface MenuCardProps {
  menu: Menu;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleAvailability?: () => void;
  onSetIngredients?: () => void; // Enhanced mode
}

export const MenuCard: React.FC<MenuCardProps> = ({
  menu, onEdit, onDelete, onToggleAvailability, onSetIngredients,
}) => {
  const [hovered, setHovered] = useState(false);
  const available = menu.is_available;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        borderRadius: '18px',
        overflow: 'hidden',
        border: `1.5px solid ${hovered ? '#c8ddc8' : available ? 'rgba(0,0,0,0.07)' : 'rgba(232,96,74,0.15)'}`,
        boxShadow: hovered
          ? '0 8px 32px rgba(91,140,90,0.14)'
          : '0 2px 12px rgba(0,0,0,0.05)',
        opacity: available ? 1 : 0.82,
        transition: 'all 0.22s ease',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Image ── */}
      <div style={{ position: 'relative', height: '155px', background: 'linear-gradient(135deg,#f0ede8,#e8e4dc)', overflow: 'hidden' }}>
        {menu.images?.[0] ? (
          <img
            src={menu.images[0].image_url}
            alt={menu.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              filter: available ? 'none' : 'grayscale(40%) brightness(0.9)',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.35s ease',
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px' }}>🍽️</div>
        )}

        {/* Gradient overlay bawah */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.28))' }} />

        {/* Status badge */}
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '4px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: '800',
          background: available ? 'rgba(91,140,90,0.95)' : 'rgba(232,96,74,0.95)',
          color: 'white', backdropFilter: 'blur(6px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          letterSpacing: '0.03em',
        }}>
          {available ? <CheckIcon /> : <SlashIcon />}
          {available ? 'Tersedia' : 'Habis'}
        </div>

        {/* Variasi badge */}
        {menu.variations && menu.variations.length > 0 && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(74,168,216,0.92)', color: 'white',
            borderRadius: '100px', padding: '3px 9px', fontSize: '10px', fontWeight: '700',
            backdropFilter: 'blur(4px)',
          }}>
            {menu.variations.length} variasi
          </div>
        )}

        {/* Harga di bawah image */}
        <div style={{
          position: 'absolute', bottom: '10px', left: '12px',
          fontSize: '15px', fontWeight: '800', color: 'white',
          textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          letterSpacing: '-0.01em',
        }}>
          {formatCurrency(menu.base_price)}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '12px 14px 14px' }}>

        {/* Nama + kategori */}
        <div style={{ marginBottom: '10px' }}>
          <h3 style={{
            margin: '0 0 3px', fontSize: '14px', fontWeight: '700', color: '#2a2420',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {menu.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {menu.category && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                background: '#f5f2ed', color: '#6b6560',
                borderRadius: '100px', padding: '2px 9px', fontSize: '10px', fontWeight: '600',
              }}>
                <TagIcon /> {menu.category.name}
              </span>
            )}
            {menu.description && (
              <p style={{
                margin: 0, fontSize: '11px', color: '#9a9288',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                maxWidth: '140px',
              }}>
                {menu.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Action buttons ── */}
        {(onEdit || onDelete || onToggleAvailability || onSetIngredients) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>

            {/* Row 1: Toggle + Edit + Delete */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {onToggleAvailability && (
                <button
                  onClick={onToggleAvailability}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    padding: '7px 0', borderRadius: '9px', border: 'none', cursor: 'pointer',
                    fontSize: '11px', fontWeight: '700', transition: 'all 0.15s',
                    background: available ? '#fdecea' : '#ebf4eb',
                    color: available ? '#E8604A' : '#5B8C5A',
                  }}
                >
                  {available ? <><SlashIcon /> Set Habis</> : <><CheckIcon /> Set Tersedia</>}
                </button>
              )}
              {onEdit && (
                <button
                  onClick={onEdit}
                  title="Edit menu"
                  style={{
                    width: '34px', height: '34px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '9px', border: '1.5px solid #e8e4dc',
                    background: 'white', cursor: 'pointer', color: '#6b6560',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#f5f2ed';
                    (e.currentTarget as HTMLButtonElement).style.color = '#2a2420';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8c4bc';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'white';
                    (e.currentTarget as HTMLButtonElement).style.color = '#6b6560';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#e8e4dc';
                  }}
                >
                  <EditIcon />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  title="Hapus menu"
                  style={{
                    width: '34px', height: '34px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '9px', border: '1.5px solid #fdecea',
                    background: '#fef6f5', cursor: 'pointer', color: '#E8604A',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fdecea'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fef6f5'; }}
                >
                  <TrashIcon />
                </button>
              )}
            </div>

            {/* Row 2: Bahan Baku — hanya kalau enhanced mode */}
            {onSetIngredients && (
              <button
                onClick={onSetIngredients}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '7px 0', borderRadius: '9px', cursor: 'pointer',
                  fontSize: '11px', fontWeight: '700', transition: 'all 0.15s',
                  border: '1.5px solid #c8ddc8',
                  background: '#f4faf4', color: '#5B8C5A',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#ebf4eb';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#5B8C5A';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#f4faf4';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8ddc8';
                }}
              >
                <LeafIcon /> Atur Bahan Baku
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
