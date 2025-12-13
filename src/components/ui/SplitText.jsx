export default function SplitText({ text = '', className = '', wordDelay = 0.04, charDelay = 0.01 }){
  const words = String(text).split(' ')
  let accDelay = 0
  return (
    <span className={`split-text ${className}`}>
      {words.map((w, wi) => (
        <span key={`w-${wi}`} style={{ display:'inline-block', whiteSpace:'nowrap' }}>
          {Array.from(w).map((c, ci) => {
            const delay = (accDelay += charDelay)
            return (
              <span key={`c-${wi}-${ci}`} className="split-char" style={{ animationDelay: `${delay}s` }}>{c}</span>
            )
          })}
          <span aria-hidden="true"> </span>
          {(() => { accDelay += wordDelay; return null })()}
        </span>
      ))}
    </span>
  )
}