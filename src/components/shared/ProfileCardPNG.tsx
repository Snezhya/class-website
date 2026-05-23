import React from 'react';
import { type Member } from '../../data/initialData';

interface ProfileCardPNGProps {
  member: Member;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

const STATUS_COLOR: Record<string, string> = {
  active: '#22c55e',
  away: '#eab308',
  offline: '#64748b',
};

export const ProfileCardPNG: React.FC<ProfileCardPNGProps> = ({ member, cardRef }) => (
  <div
    ref={cardRef}
    style={{
      position: 'fixed',
      left: '-9999px',
      top: 0,
      width: '560px',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1526 50%, #0a1020 100%)',
      border: '1px solid #1e3a5f',
      borderRadius: '20px',
      overflow: 'hidden',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#fff',
    }}
  >
    {/* Top accent bar */}
    <div style={{ height: '4px', background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)' }} />

    {/* Header */}
    <div style={{ padding: '28px 28px 0 28px', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img
          src={member.image}
          alt={member.name}
          crossOrigin="anonymous"
          style={{ width: '88px', height: '88px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #1e3a5f', background: '#0a0f1e' }}
        />
        <div style={{
          position: 'absolute', bottom: -4, right: -4,
          width: '18px', height: '18px', borderRadius: '50%',
          background: STATUS_COLOR[member.status] ?? '#64748b',
          border: '3px solid #0a0f1e',
        }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#3b82f6', fontFamily: 'monospace', marginBottom: '6px', textTransform: 'uppercase' }}>
          {member.isCore ? '◆ CORE_CLASS_COUNCIL' : '○ GENERAL_ROSTER'}
        </div>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {member.name}
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
          NIS: {member.nis} · {member.role}
        </p>
        <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0d1f3c', border: '1px solid #1e3a5f', borderRadius: '6px', padding: '3px 10px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: STATUS_COLOR[member.status] ?? '#64748b' }} />
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {member.status}
          </span>
        </div>
      </div>
    </div>

    {/* Divider */}
    <div style={{ margin: '20px 28px 0', height: '1px', background: 'linear-gradient(90deg, #1e3a5f, transparent)' }} />

    {/* Terminal inspect block */}
    <div style={{ margin: '16px 28px 0', background: '#060d18', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '8px 14px', background: '#0a1525', borderBottom: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['#ef4444','#f59e0b','#22c55e'].map(c => (
            <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
          ))}
        </div>
        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#475569', marginLeft: '6px' }}>
          profile_inspect.sh --target="{member.name.replace(/\s+/g, '_')}"
        </span>
        <div style={{ marginLeft: 'auto', width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
      </div>
      <div style={{ padding: '14px 16px', fontSize: '11px', fontFamily: 'monospace', lineHeight: '1.9', color: '#22c55e' }}>
        <div style={{ color: '#94a3b8' }}>$ bash ./profile_inspect.sh --target="{member.name.replace(/\s+/g, '_')}"</div>
        <div style={{ color: '#3b82f6' }}>[INFO] Locating registry NIS: {member.nis}... Found.</div>
        <div style={{ color: '#3b82f6' }}>[INFO] Querying directory for: '{member.role}'...</div>
        <div style={{ color: '#1e3a5f' }}>──────────────────────────────────────────────</div>
        <div><span style={{ color: '#475569' }}>NAME       : </span>{member.name}</div>
        <div><span style={{ color: '#475569' }}>NIS        : </span>{member.nis}</div>
        <div><span style={{ color: '#475569' }}>HIERARCHY  : </span>{member.isCore ? 'CORE_CLASS_COUNCIL' : 'GENERAL_ROSTER'}</div>
        <div><span style={{ color: '#475569' }}>ROLE       : </span>{member.role}</div>
        <div><span style={{ color: '#475569' }}>STATUS     : </span><span style={{ color: STATUS_COLOR[member.status] }}>{member.status.toUpperCase()}</span></div>
        <div><span style={{ color: '#475569' }}>BIO        : </span><span style={{ color: '#cbd5e1' }}>"{member.bio}"</span></div>
        <div><span style={{ color: '#475569' }}>SKILLS     : </span><span style={{ color: '#a78bfa' }}>[{member.skills.join(', ')}]</span></div>
        <div style={{ color: '#1e3a5f' }}>──────────────────────────────────────────────</div>
        <div style={{ color: '#22c55e' }}>[SUCCESS] Shell profile printed. System daemon waiting...</div>
      </div>
    </div>

    {/* Skills row */}
    <div style={{ margin: '16px 28px 0', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {member.skills.map(skill => (
        <span key={skill} style={{ fontSize: '10px', fontFamily: 'monospace', color: '#a78bfa', background: '#1a1040', border: '1px solid #312e81', borderRadius: '6px', padding: '3px 10px', letterSpacing: '0.05em' }}>
          {skill}
        </span>
      ))}
    </div>

    {/* Footer */}
    <div style={{ margin: '20px 0 0', padding: '14px 28px', background: '#060d18', borderTop: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#1e3a5f', letterSpacing: '0.15em' }}>XI TJKT 1 · SMKN 1 BOYOLALI</span>
      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#1e3a5f', letterSpacing: '0.1em' }}>profile_inspect_output.png</span>
    </div>
  </div>
);
