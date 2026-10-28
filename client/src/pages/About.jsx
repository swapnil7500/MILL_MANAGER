import { useState } from 'react';
import {
  MILL,
  QUOTE,
  ABOUT,
  SERVICES,
  SERVICE_ITEMS,
  PRODUCT_ITEMS,
  formatPhone,
} from '../data/mill';
import { PhoneIcon, QuoteIcon } from '../components/Icons';

const ALL_ITEMS = [...SERVICE_ITEMS, ...PRODUCT_ITEMS];

function SectionTitle({ children }) {
  return (
    <h2 className="sec-title">
      <span>{children}</span>
    </h2>
  );
}

function RateCard({ item, active, onSelect }) {
  return (
    <div
      className={`rate-card${active ? ' active' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={() => onSelect(item.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item.id);
        }
      }}
    >
      <img src={item.image} alt={item.name} loading="lazy" />
      <div className="rate-info">
        <div className="rate-hi">{item.hi}</div>
        <div className="rate-name">{item.name}</div>
      </div>
      <div className="rate-chip">
        ₹{item.rate}
        <span>/ kg</span>
      </div>
    </div>
  );
}

export default function About() {
  const [selected, setSelected] = useState(ALL_ITEMS[0].id);
  const [kg, setKg] = useState('');

  const item = ALL_ITEMS.find((i) => i.id === selected);
  const weight = Number(kg);
  const amount = weight > 0 ? Math.round(weight * item.rate * 100) / 100 : 0;

  return (
    <div className="about">
      {/* ---------- Intro ---------- */}
      <section className="about-hero">
        <div className="hero-text">
          <h1>हमारा प्रतिष्ठान</h1>
          <div className="hero-rule" />

          {ABOUT.map((p, i) => (
            <div key={i} className="about-text">
              <p className="hi">{p.hi}</p>
              <p className="en">{p.en}</p>
            </div>
          ))}

          <div className="hero-actions">
            {MILL.phones.map((phone) => (
              <a key={phone} className="call-btn" href={`tel:+91${phone}`}>
                <PhoneIcon />
                <span>{formatPhone(phone)}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <img src="/items/flour.svg" alt="" />
          <img src="/items/wheat.svg" alt="" className="big" />
          <img src="/items/oil.svg" alt="" />
        </div>
      </section>

      <div className="tagline-banner">
        <div className="tagline-hi">{MILL.taglineHi}</div>
        <div className="tagline-en">{MILL.taglineEn}</div>
      </div>

      {/* ---------- Quote ---------- */}
      <section className="quote-card">
        <QuoteIcon className="quote-icon" width={36} height={36} />
        <div className="quote-hi">{QUOTE.hi}</div>
        <div className="quote-en">{QUOTE.en}</div>
      </section>

      {/* ---------- Services ---------- */}
      <section>
        <SectionTitle>हमारी सेवाएँ</SectionTitle>
        <div className="service-grid">
          {SERVICES.map((s) => (
            <div key={s.id} className={`service-card service-${s.id}`}>
              <img src={s.image} alt={s.title} />
              <div>
                <h3>
                  {s.hi} <span className="en">· {s.title}</span>
                </h3>
                <p className="hi">{s.textHi}</p>
                <p className="en">{s.en}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Work charges ---------- */}
      <section className="band band-rates">
        <SectionTitle>पिसाई एवं पेराई की दरें</SectionTitle>
        <p className="section-note">
          प्रति किलो दर। किसी वस्तु पर टैप करें, नीचे उसकी राशि का अनुमान देख सकते हैं.
          <span className="en"> (Charge per kg. Tap an item to use it in the calculator below.)</span>
        </p>
        <div className="rate-grid">
          {SERVICE_ITEMS.map((i) => (
            <RateCard key={i.id} item={i} active={i.id === selected} onSelect={setSelected} />
          ))}
        </div>
      </section>

      {/* ---------- Products ---------- */}
      <section className="band band-products">
        <SectionTitle>हमारे उत्पाद</SectionTitle>
        <p className="section-note">
          तैयार आटा और सरसों का तेल, प्रति किलो भाव.
          <span className="en"> (Ready flour and mustard oil, price per kg.)</span>
        </p>
        <div className="rate-grid">
          {PRODUCT_ITEMS.map((i) => (
            <RateCard key={i.id} item={i} active={i.id === selected} onSelect={setSelected} />
          ))}
        </div>
      </section>

      {/* ---------- Calculator ---------- */}
      <section className="calc" aria-live="polite">
        <SectionTitle>अपनी राशि का अनुमान लगाएँ</SectionTitle>
        <div className="calc-grid">
          <div>
            <label htmlFor="calc-item">वस्तु (Item)</label>
            <select id="calc-item" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <optgroup label="पिसाई / पेराई शुल्क">
                {SERVICE_ITEMS.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.hi} - ₹{i.rate}/kg
                  </option>
                ))}
              </optgroup>
              <optgroup label="उत्पाद">
                {PRODUCT_ITEMS.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.hi} - ₹{i.rate}/kg
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label htmlFor="calc-kg">वज़न किलो में (Weight in kg)</label>
            <input
              id="calc-kg"
              type="number"
              min="0"
              step="0.5"
              inputMode="decimal"
              value={kg}
              onChange={(e) => setKg(e.target.value)}
              placeholder="जैसे 25"
            />
          </div>
        </div>

        <div className="calc-result">
          {weight > 0 ? (
            <>
              <div className="calc-sum">
                {weight} kg × ₹{item.rate} = <strong>₹{amount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="calc-note">
                {item.kind === 'work' ? 'पिसाई / पेराई शुल्क' : 'भाव'} · {item.hi}
              </div>
            </>
          ) : (
            <div className="calc-note">वज़न दर्ज करें, अनुमानित राशि यहाँ दिखेगी।</div>
          )}
        </div>
        <p className="calc-note">
          यह केवल अनुमान है। अंतिम राशि चक्की पर तय की जाएगी।
          <span className="en"> (Estimate only. The final amount is confirmed at the mill.)</span>
        </p>
      </section>

      {/* ---------- Accepted items ---------- */}
      <section className="band band-accept">
        <SectionTitle>स्वीकार की जाने वाली वस्तुएँ</SectionTitle>
        <div className="chips">
          {SERVICE_ITEMS.map((i) => (
            <span key={i.id} className="chip">
              <span className="tick">✓</span> {i.hi} <span className="en">({i.name})</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}