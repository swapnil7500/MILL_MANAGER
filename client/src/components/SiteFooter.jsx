import { MILL, formatPhone } from '../data/mill';
import { PinIcon, PhoneIcon, UserIcon } from './Icons';

export default function SiteFooter() {
  return (
    <footer className="mill-footer">
      <div className="footer-quote">
        <div className="footer-quote-hi">{MILL.closingHi}</div>
        <div className="footer-quote-en">{MILL.closingEn}</div>
        <div className="footer-quote-sub">{MILL.closingSubHi}</div>
      </div>

      <div className="footer-grid">
        <div className="footer-col">
          <h4>{MILL.name}</h4>
          <p>{MILL.taglineHi}</p>
          <p className="footer-dim">Flour Mill · Mustard Oil Extraction</p>
        </div>

        <div className="footer-col">
          <h4>Address</h4>
          <p className="footer-line">
            <PinIcon />
            <span>{MILL.address}</span>
          </p>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <p className="footer-line">
            <UserIcon />
            <span>Owner: {MILL.owner}</span>
          </p>
          {MILL.phones.map((phone) => (
            <a key={phone} className="footer-call" href={`tel:+91${phone}`}>
              <PhoneIcon />
              <span>{formatPhone(phone)}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} {MILL.name}
      </div>
    </footer>
  );
}