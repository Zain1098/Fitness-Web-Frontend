import React from 'react'
import styled from 'styled-components'

export default function PricingCard({
  badge,
  tier = 'Free',
  price = '$0',
  unit = 'month',
  description = '',
  features = [],
  cta = 'Get Started',
  onClick
}){
  return (
    <StyledWrapper>
      <div className="card-container">
        <div className="title-card">
          <p>{badge}</p>
          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24">
            <path fill="currentColor" d="M10.277 16.515c.005-.11.187-.154.24-.058c.254.45.686 1.111 1.177 1.412c.49.3 1.275.386 1.791.408c.11.005.154.186.058.24c-.45.254-1.111.686-1.412 1.176s-.386 1.276-.408 1.792c-.005.11-.187.153-.24.057c-.254-.45-.686-1.11-1.176-1.411s-1.276-.386-1.792-.408c-.11-.005-.153-.187-.057-.24c.45-.254 1.11-.686 1.411-1.177c.301-.49.386-1.276.408-1.791m8.215-1c-.008-.11-.2-.156-.257-.062c-.172.283-.421.623-.697.793s-.693.236-1.023.262c-.11.008-.155.2-.062.257c.283.172.624.42.793.697s.237.693.262 1.023c.009.11.2.155.258.061c.172-.282.42-.623.697-.792s.692-.237 1.022-.262c.11-.009.156-.2.062-.258c-.283-.172-.624-.42-.793-.697s-.236-.692-.262-1.022M14.704 4.002l-.242-.306c-.937-1.183-1.405-1.775-1.95-1.688c-.545.088-.806.796-1.327 2.213l-.134.366c-.149.403-.223.604-.364.752c-.143.148-.336.225-.724.38l-.353.141l-.248.1c-1.2.48-1.804.753-1.881 1.283c-.082.565.49 1.049 1.634 2.016l.296.25c.325.275.488.413.58.6c.094.187.107.403.134.835l.024.393c.093 1.52.14 2.28.634 2.542s1.108-.147 2.336-.966l.318-.212c.35-.233.524-.35.723-.381c.2-.032.402.024.806.136l.368.102c1.422.394 2.133.591 2.52.188c.388-.403.196-1.14-.19-2.613l-.099-.381c-.11-.419-.164-.628-.134-.835s.142-.389.365-.752l.203-.33c.786-1.276 1.179-1.914.924-2.426c-.254-.51-.987-.557-2.454-.648l-.379-.024c-.417-.026-.625-.039-.806-.135c-.18-.096-.314-.264-.58-.6m-5.869 9.324C6.698 14.37 4.919 16.024 4.248 18c-.752-4.707.292-7.747 1.965-9.637c.144.295.332.539.5.73c.35.396.852.82 1.362 1.251l.367.31l.17.145c.005.064.01.14.015.237l.03.485c.04.655.08 1.294.178 1.805" />
          </svg>
        </div>
        <div className="card-content">
          <p className="title">{tier}</p>
          <p className="plain"><span>{price}</span><span>/ {unit}</span></p>
          <p className="description">{description}</p>
          <button className="card-btn" onClick={onClick}>{cta}</button>
          <div className="card-separate"><div className="separate" /><p>FEATURES</p><div className="separate" /></div>
          <div className="card-list-features">
            {features?.map((f, i) => (
              <div className="option" key={i}>
                <svg viewBox="0 0 24 24" height={14} width={14} xmlns="http://www.w3.org/2000/svg">
                  <g strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" fill="none">
                    <rect rx={4} y={3} x={3} height={18} width={18} />
                    <path d="m9 12l2.25 2L15 10" />
                  </g>
                </svg>
                <p>{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  .card-container {
    width: 280px;
    background: linear-gradient(to top right,#975af4,#2f7cf8 40%,#78aafa 65%,#934cff 100%);
    padding: 4px; border-radius: 32px; display: flex; flex-direction: column;
    box-shadow: 0 26px 60px rgba(0,200,255,.18);
  }
  .title-card { display:flex; align-items:center; padding:16px 18px; justify-content:space-between; color:#fff; }
  .title-card p { color:#fff; font-size: 12px; font-weight: 700; font-style: italic; text-shadow: 2px 2px 6px #2975ee; }
  .card-content { width:100%; background-color:#161a20; border-radius:30px; color:#838383; font-size:12px; padding:18px; display:flex; flex-direction:column; gap:12px; }
  .card-content .title { font-weight:600; color:#bab9b9; }
  .card-content .plain { display:flex; align-items:baseline; gap:6px; }
  .card-content .plain :nth-child(1){ font-size:36px; color:#fff; line-height:1; }
  .card-content .description{ color:#9fb3c8; line-height:1.5; }
  .card-btn { background: linear-gradient(4deg,#975af4,#2f7cf8 40%,#78aafa 65%,#934cff 100%); padding:8px; border:none; width:100%; border-radius:8px; color:rgba(255,255,255,0.8); font-size:12px; transition: all .3s; cursor:pointer; box-shadow: inset 0 2px 4px rgba(255,255,255,0.6); }
  .card-btn:hover { color:#ffffff; text-shadow:0 0 8px #fff; transform: scale(1.03); }
  .card-btn:active { transform: scale(1); }
  .card-separate { display:flex; gap:8px; align-items:center; width:100%; font-size:10px; color: rgb(131,131,131,0.6); }
  .card-separate .separate { flex:1; height:1px; background-color: rgb(131,131,131,0.5); }
  .card-list-features { color:#bab9b9; display:flex; flex-direction:column; gap:6px; }
  .card-list-features .option { display:flex; gap:8px; align-items:center; padding:4px 0; }
  .card-list-features .option svg { flex-shrink:0; }
  .card-list-features .option p { margin:0; line-height:1.4; }
`