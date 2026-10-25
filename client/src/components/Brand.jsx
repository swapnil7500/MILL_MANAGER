export default function Brand({ onDark = false, small = false }) {
  return (
    <div className={`brand-block${onDark ? ' on-dark' : ''}${small ? ' small' : ''}`}>
      <img src="/favicon.svg" alt="" className="brand-emblem" />
      <div className="brand-name">Gupta Atta Chakki</div>
      <div className="brand-hindi">गुप्ता आटा चक्की</div>
      <div className="brand-tag">Flour Mill · Mustard Oil Extraction</div>
    </div>
  );
}