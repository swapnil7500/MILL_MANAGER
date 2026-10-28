// ============================================================
// Everything shown on the About Us page and in the footer lives
// in this one file. To change a rate, a phone number or a line
// of text, edit it here. Nothing else needs to change.
// ============================================================

export const MILL = {
  name: 'Gupta Atta Chakki',
  owner: 'Suresh Gupta',
  phones: ['8765947151', '9305821170'], // 10-digit numbers, no spaces
  address: 'Village & Post Dariba, Rae Bareli',
  taglineHi: 'सभी प्रकार का काम उचित दर पर किया जाता है',
  taglineEn: 'All kinds of work are done at fair rates',
  closingHi: 'सेवा का अवसर दीजिए',
  closingEn: 'Give us the opportunity to serve you',
  closingSubHi: 'आपका विश्वास ही हमारी पूँजी है',
};

export const QUOTE = {
  hi: 'जैसा अन्न, वैसा मन',
  en: 'As the grain, so the mind.',
};

export const ABOUT = [
  {
    en: 'Gupta Atta Chakki is a family-run flour mill and mustard oil extraction unit at Village & Post Dariba, Rae Bareli. We grind wheat, rice, gram, bajra, maize and all kinds of spices, and we press mustard into oil for our local customers.',
    hi: 'गुप्ता आटा चक्की एक पारिवारिक आटा-चक्की व सरसों तेल पेराई केंद्र है, जो गाँव व पोस्ट दरीबा, रायबरेली में स्थित है। यहाँ गेहूँ, चावल, चना, बाजरा, मक्का और हर प्रकार के मसालों की पिसाई तथा सरसों की पेराई की जाती है।',
  },
  {
    en: 'Every order is recorded date-wise, and you can now check the status of your work, pending or done, on this website with your phone number.',
    hi: 'हर काम तारीख़ के अनुसार दर्ज किया जाता है, और अब आप अपने काम की स्थिति इस वेबसाइट पर अपने फ़ोन नंबर से देख सकते हैं।',
  },
];

export const SERVICES = [
  {
    id: 'flour-mill',
    title: 'Flour Mill',
    hi: 'आटा चक्की',
    en: 'Wheat, rice, gram, bajra, maize and all kinds of spices are ground at the mill.',
    textHi: 'गेहूँ, चावल, चना, बाजरा, मक्का और हर प्रकार के मसालों की पिसाई।',
    image: '/items/flour.svg',
  },
  {
    id: 'oil-extraction',
    title: 'Oil Extraction',
    hi: 'तेल पेराई',
    en: 'Bring your mustard and get it pressed into oil.',
    textHi: 'अपनी सरसों लाइए और तेल निकलवाइए।',
    image: '/items/oil.svg',
  },
];

// Charges for the work, per kg of the customer's own grain
export const SERVICE_ITEMS = [
  { id: 'wheat', name: 'Wheat', hi: 'गेहूँ', rate: 2, kind: 'work', image: '/items/wheat.svg' },
  { id: 'rice', name: 'Rice', hi: 'चावल', rate: 5, kind: 'work', image: '/items/rice.svg' },
  { id: 'gram', name: 'Gram', hi: 'चना', rate: 5, kind: 'work', image: '/items/gram.svg' },
  { id: 'bajra', name: 'Bajra', hi: 'बाजरा', rate: 5, kind: 'work', image: '/items/bajra.svg' },
  { id: 'makka', name: 'Makka (Maize)', hi: 'मक्का', rate: 5, kind: 'work', image: '/items/makka.svg' },
  { id: 'mustard', name: 'Mustard', hi: 'सरसों (पेराई)', rate: 4, kind: 'work', image: '/items/mustard.svg' },
  { id: 'spices', name: 'Spices (all types)', hi: 'सभी प्रकार के मसाले', rate: 20, kind: 'work', image: '/items/spices.svg' },
];

// Ready products, price per kg
export const PRODUCT_ITEMS = [
  { id: 'flour', name: 'Flour (Atta)', hi: 'आटा', rate: 35, kind: 'product', image: '/items/flour.svg' },
  { id: 'oil', name: 'Mustard Oil', hi: 'सरसों का तेल', rate: 210, kind: 'product', image: '/items/oil.svg' },
];

export const formatPhone = (p) => `+91 ${p.slice(0, 5)} ${p.slice(5)}`;