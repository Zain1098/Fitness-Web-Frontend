import React from 'react'
import styled from 'styled-components'

export default function SwitchBilling({ checked=false, onChange }){
  return (
    <StyledWrapper>
      <div className="container">
        <input type="checkbox" name="checkbox" id="checkbox" checked={checked} onChange={e=>onChange?.(e.target.checked)} />
        <label htmlFor="checkbox" className="label"></label>
      </div>
      <div className="legend">
        <span style={{ color: checked ? 'var(--ff-muted)' : 'var(--ff-text)' }}>Monthly</span>
        <span style={{ color: checked ? 'var(--ff-text)' : 'var(--ff-muted)' }}>Annual</span>
      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  display:flex; flex-direction:column; align-items:center; gap:8px;
  .label { height:60px; width:120px; background-color:#ffffff; border-radius:30px; box-shadow: inset 0 0 5px 4px rgba(255,255,255,1), inset 0 0 20px 1px rgba(0,0,0,0.488), 10px 20px 30px rgba(0,0,0,0.096), inset 0 0 0 3px rgba(0,0,0,0.3); display:flex; align-items:center; cursor:pointer; position:relative; transition: transform .4s; }
  .label:hover { transform: perspective(100px) rotateX(5deg) rotateY(-5deg); }
  #checkbox:checked ~ .label:hover { transform: perspective(100px) rotateX(-5deg) rotateY(5deg); }
  #checkbox { display:none; }
  #checkbox:checked ~ .label::before { left:70px; background-color:#000000; background-image: linear-gradient(315deg,#000000 0%,#414141 70%); transition:.4s; }
  .label::before { position:absolute; content:""; height:40px; width:40px; border-radius:50%; background-color:#000000; background-image: linear-gradient(130deg,#757272 10%,#ffffff 11%,#726f6f 62%); left:10px; box-shadow: 0 2px 1px rgba(0,0,0,0.3), 10px 10px 10px rgba(0,0,0,0.3); transition:.4s; }
  .legend { display:flex; gap:14px; font-size:12px; }
`