import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface MenuImage    { id: number; image_url: string; is_primary: boolean; }
interface MenuVariation { id: number; name: string; option: string; price: number; }
interface Category     { id: number; name: string; }
interface MenuItem {
  id: number; name: string; description: string;
  base_price: number; prep_time: number; is_available: boolean;
  category: Category | null; images: MenuImage[]; variations: MenuVariation[];
}

const API_BASE = import.meta.env.VITE_MENU_SERVICE_URL || 'http://localhost:3002';
const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const DetailModal: React.FC<{ item: MenuItem; onClose: () => void }> = ({ item, onClose }) => {
  const primary = item.images?.find(i => i.is_primary) ?? item.images?.[0];
  return (
    <>
      <style>{`@keyframes mIn{from{opacity:0;transform:translateY(32px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}.pm-modal{animation:mIn .28s cubic-bezier(0.23,1,0.32,1) both}`}</style>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',zIndex:100,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
        <div className="pm-modal" onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto',paddingBottom:32}}>
          {primary
            ? <img src={primary.image_url} alt={item.name} style={{width:'100%',height:220,objectFit:'cover',borderRadius:'20px 20px 0 0'}}/>
            : <div style={{width:'100%',height:160,borderRadius:'20px 20px 0 0',background:'linear-gradient(135deg,#e8f5e9,#c8e6c9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48}}>🍽️</div>
          }
          <div style={{padding:'20px 20px 0'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div>
                <h2 style={{margin:'0 0 4px',fontSize:20,fontWeight:700,color:'#1a1a1a'}}>{item.name}</h2>
                {item.category && <span style={{fontSize:11,fontWeight:600,color:'#5B8C5A',background:'#e8f5e4',padding:'2px 8px',borderRadius:20}}>{item.category.name}</span>}
              </div>
              <button onClick={onClose} style={{border:'none',background:'#f0f0f0',borderRadius:'50%',width:32,height:32,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</button>
            </div>
            <div style={{fontSize:22,fontWeight:800,color:'#217093',margin:'12px 0 8px'}}>{fmt(item.base_price)}</div>
            {item.description && <p style={{fontSize:14,color:'#666',lineHeight:1.6,margin:'0 0 16px'}}>{item.description}</p>}
            {item.prep_time > 0 && <div style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#888',marginBottom:16}}>⏱ Estimasi {item.prep_time} menit</div>}
            {item.variations?.length > 0 && (
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'#444',marginBottom:10,textTransform:'uppercase',letterSpacing:'.05em'}}>Variasi</div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {item.variations.map(v => (
                    <div key={v.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#f9f9f9',borderRadius:10,padding:'10px 14px'}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:600,color:'#1a1a1a'}}>{v.name}</div>
                        {v.option && <div style={{fontSize:12,color:'#888',marginTop:2}}>{v.option}</div>}
                      </div>
                      <div style={{fontSize:14,fontWeight:700,color:'#217093'}}>{v.price > 0 ? `+${fmt(v.price)}` : 'Included'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const MenuCard: React.FC<{ item: MenuItem; onClick: () => void }> = ({ item, onClick }) => {
  const primary = item.images?.find(i => i.is_primary) ?? item.images?.[0];
  return (
    <div onClick={onClick} style={{background:'#fff',borderRadius:16,boxShadow:'0 2px 12px rgba(0,0,0,.07)',overflow:'hidden',cursor:'pointer',transition:'transform .18s,box-shadow .18s'}}
      onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(-3px)';(e.currentTarget as HTMLDivElement).style.boxShadow='0 8px 24px rgba(0,0,0,.12)'}}
      onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(0)';(e.currentTarget as HTMLDivElement).style.boxShadow='0 2px 12px rgba(0,0,0,.07)'}}>
      <div style={{position:'relative',height:140,background:'#f0f4ef',overflow:'hidden'}}>
        {primary
          ? <img src={primary.image_url} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,background:'linear-gradient(135deg,#e8f5e9,#c8e6c9)'}}>🍽️</div>
        }
        {item.variations?.length > 0 && (
          <div style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,.55)',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 7px',borderRadius:20}}>{item.variations.length} variasi</div>
        )}
      </div>
      <div style={{padding:'12px 14px'}}>
        <div style={{fontSize:14,fontWeight:700,color:'#1a1a1a',marginBottom:4,lineHeight:1.3}}>{item.name}</div>
        {item.description && <div style={{fontSize:12,color:'#888',lineHeight:1.4,marginBottom:8,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{item.description}</div>}
        <div style={{fontSize:15,fontWeight:800,color:'#217093'}}>{fmt(item.base_price)}</div>
      </div>
    </div>
  );
};

export const PublicMenu: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [menus,      setMenus]      = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab,  setActiveTab]  = useState<number>(0);
  const [selected,   setSelected]   = useState<MenuItem | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    fetch(`${API_BASE}/public/menu/${tenantId}`)
      .then(r => r.json())
      .then(data => { setMenus(data.menus ?? []); setCategories(data.categories ?? []); setLoading(false); })
      .catch(() => { setError('Gagal memuat menu.'); setLoading(false); });
  }, [tenantId]);

  const filtered = menus.filter(m => {
    const matchCat    = activeTab === 0 || m.category?.id === activeTab;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}body{background:#f4f0e8;font-family:'DM Sans',sans-serif}
        .pm-tab{padding:8px 16px;border-radius:20px;border:none;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .18s,color .18s}
        .pm-tab.active{background:#217093;color:#fff}.pm-tab:not(.active){background:#fff;color:#555}
        .pm-search{width:100%;padding:11px 16px 11px 40px;border:1.5px solid #e0dbd2;border-radius:12px;font-size:14px;color:#1a1a1a;background:#fff;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s}
        .pm-search:focus{border-color:#217093}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .pm-grid>*{animation:fadeUp .3s ease both}
        .pm-grid>*:nth-child(2){animation-delay:.04s}.pm-grid>*:nth-child(3){animation-delay:.08s}
        .pm-grid>*:nth-child(4){animation-delay:.12s}.pm-grid>*:nth-child(5){animation-delay:.16s}
      `}</style>
      <div style={{minHeight:'100vh',background:'#f4f0e8',paddingBottom:40}}>
        <div style={{background:'linear-gradient(135deg,#1a2b19 0%,#2d4a2c 100%)',padding:'32px 20px 24px',textAlign:'center',position:'sticky',top:0,zIndex:10,boxShadow:'0 2px 16px rgba(0,0,0,.18)'}}>
          <div style={{fontSize:28,marginBottom:6}}>🍽️</div>
          <h1 style={{color:'#fff',fontSize:20,fontWeight:800,margin:'0 0 4px'}}>Menu Kami</h1>
          <p style={{color:'rgba(255,255,255,.6)',fontSize:13,margin:0}}>Tap item untuk lihat detail & variasi</p>
        </div>
        <div style={{maxWidth:480,margin:'0 auto',padding:'0 16px'}}>
          <div style={{position:'relative',margin:'16px 0 12px'}}>
            <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',fontSize:15,pointerEvents:'none',color:'#aaa'}}>🔍</span>
            <input className="pm-search" placeholder="Cari menu..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          {categories.length > 0 && (
            <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:8,marginBottom:16,scrollbarWidth:'none'}}>
              <button className={`pm-tab${activeTab===0?' active':''}`} onClick={()=>setActiveTab(0)}>Semua</button>
              {categories.map(cat=>(
                <button key={cat.id} className={`pm-tab${activeTab===cat.id?' active':''}`} onClick={()=>setActiveTab(cat.id)}>{cat.name}</button>
              ))}
            </div>
          )}
          {loading && <div style={{textAlign:'center',padding:'60px 0',color:'#888'}}><div style={{fontSize:32,marginBottom:12}}>⏳</div><div style={{fontSize:14}}>Memuat menu...</div></div>}
          {error   && <div style={{textAlign:'center',padding:'40px 20px',background:'#fff',borderRadius:16,color:'#c06050'}}><div style={{fontSize:32,marginBottom:8}}>😕</div><div style={{fontSize:14}}>{error}</div></div>}
          {!loading && !error && filtered.length === 0 && (
            <div style={{textAlign:'center',padding:'60px 0',color:'#888'}}>
              <div style={{fontSize:40,marginBottom:12}}>🍽️</div>
              <div style={{fontSize:15,fontWeight:600,color:'#444',marginBottom:4}}>{search?'Menu tidak ditemukan':'Belum ada menu tersedia'}</div>
            </div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <div className="pm-grid" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
              {filtered.map(item=><MenuCard key={item.id} item={item} onClick={()=>setSelected(item)}/>)}
            </div>
          )}
          {!loading && <div style={{textAlign:'center',marginTop:32,fontSize:12,color:'#aaa',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>🌿 Powered by MODU</div>}
        </div>
      </div>
      {selected && <DetailModal item={selected} onClose={()=>setSelected(null)}/>}
    </>
  );
};
