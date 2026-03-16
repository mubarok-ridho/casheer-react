import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../contexts/AuthContext';

interface QRModalProps { onClose: () => void; }

export const QRModal: React.FC<QRModalProps> = ({ onClose }) => {
  const { tenant } = useAuth();
  const qrRef = useRef<HTMLDivElement>(null);
  const menuUrl = `${window.location.origin}/menu/${tenant?.id}`;

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 480;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 480);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 40, 20, 320, 320);
      ctx.fillStyle = '#555'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
      ctx.fillText(menuUrl, 200, 380);
      const link = document.createElement('a');
      link.download = `qr-menu-${tenant?.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(menuUrl);
    alert('Link disalin!');
  };

  return (
    <>
      <style>{`@keyframes qrIn{from{opacity:0;transform:scale(.95) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}.qr-box{animation:qrIn .25s cubic-bezier(0.23,1,0.32,1) both}`}</style>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
        <div className="qr-box" onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:20,padding:'28px 28px 24px',width:'100%',maxWidth:360,textAlign:'center',boxShadow:'0 24px 64px rgba(0,0,0,.22)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <div>
              <h3 style={{fontSize:16,fontWeight:700,color:'#1e281a',margin:0}}>QR Code Menu</h3>
              <p style={{fontSize:12,color:'#86977a',margin:'3px 0 0'}}>Scan untuk lihat menu</p>
            </div>
            <button onClick={onClose} style={{border:'none',background:'#f0f0f0',borderRadius:'50%',width:32,height:32,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          </div>
          <div ref={qrRef} style={{display:'inline-block',padding:16,background:'#fff',borderRadius:16,border:'2px solid #e8f0e4',marginBottom:16}}>
            <QRCodeSVG value={menuUrl} size={200} bgColor="#ffffff" fgColor="#1a2b19" level="M"/>
          </div>
          <div style={{background:'#f4f0e8',borderRadius:10,padding:'8px 12px',marginBottom:20,fontSize:11,color:'#666',wordBreak:'break-all',lineHeight:1.4}}>{menuUrl}</div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={handleCopy} style={{flex:1,padding:'11px 0',border:'1.5px solid #217093',borderRadius:10,background:'#fff',color:'#217093',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>🔗 Salin Link</button>
            <button onClick={handleDownload} style={{flex:1,padding:'11px 0',border:'none',borderRadius:10,background:'linear-gradient(135deg,#217093,#4eb8dd)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 12px rgba(33,112,147,.3)'}}>⬇️ Download</button>
          </div>
        </div>
      </div>
    </>
  );
};
