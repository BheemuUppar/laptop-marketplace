export const STORE_INFO = {
  name: 'iPro Technologies Used Laptops Store',
  shortName: 'iPro Technologies',
  tagline: 'Refurbished & Used Laptops in HSR Layout',
  address: '1825, 13th Cross Rd, Vanganahalli, 1st Sector, HSR Layout',
  city: 'Bengaluru, Karnataka',
  phones: ['9123503135', '6363725585'],
  phone: '+91 91235 03135',
  phoneSecondary: '+91 63637 25585',
  whatsapp: '919123503135',
  email: 'contact@iprotechnologies.in',
  businessHours: [
    { day: 'Monday - Sunday', open: '10:30 AM', close: '8:00 PM' },
  ],
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.939655778093!2d77.6484697!3d12.915473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1501facb8911%3A0x19e2b64ac18e7889!2siPro%20Technologies%20Used%20Laptops%20Store!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin',
  mapDirectionsUrl: 'https://www.google.com/maps/place/iPro+Technologies+Used+Laptops+Store/@12.915473,77.6484697,17z/data=!4m6!3m5!1s0x3bae1501facb8911:0x19e2b64ac18e7889!8m2!3d12.915473!4d77.6484697!16s%2Fg%2F11tsqt9mws',
  latitude: 12.915473,
  longitude: 77.6484697,
  googleMapsUrl:
    'https://www.google.com/maps/place/iPro+Technologies+Used+Laptops+Store/@12.915473,77.6484697,17z/data=!4m6!3m5!1s0x3bae1501facb8911:0x19e2b64ac18e7889!8m2!3d12.915473!4d77.6484697!16s%2Fg%2F11tsqt9mws',
  googlePlaceId: '0x3bae1501facb8911:0x19e2b64ac18e7889',
  googleRating: 4.8,
  instagramUrl: 'https://www.instagram.com/',
  youtubeChannelUrl: 'https://www.youtube.com/',
};

/** Optional logos for brand cards — names come from Masters API */
export const BRAND_LOGOS: Record<string, string> = {
  dell: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg',
  hp: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg',
  lenovo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg',
  apple: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  macbook: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  asus: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg',
  acer: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Acer_2011.svg',
  msi: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Micro-Star_International_logo.svg',
};

export const DEFAULT_BRAND_LOGO =
  'https://upload.wikimedia.org/wikipedia/commons/9/95/Generic_Laptop_sticker.svg';

/** @deprecated Use MasterService — kept empty for backward compatibility */
export const BRANDS: { id: string; name: string; logo: string; slug: string }[] = [];

/** @deprecated Use MasterService */
export const FILTER_OPTIONS = {
  brands: [] as string[],
  processors: [] as string[],
  ram: [] as string[],
  storage: [] as string[],
  conditions: [] as string[],
};

/** Fallback when API is unavailable; manage photos/videos in Admin → Gallery */
export const GALLERY_IMAGES: { src: string; alt: string }[] = [];

export const YOUTUBE_VIDEOS: { videoId: string; title: string }[] = [];

export const FAQ_ITEMS = [
  { question: 'Do laptops come with warranty?', answer: 'Yes, warranty is available on refurbished laptops. Warranty duration depends on the specific model — ask our team for details on the laptop you are interested in.' },
  { question: 'Can RAM be upgraded?', answer: 'Yes, we offer RAM upgrade services on compatible models. Visit our store in HSR Layout to discuss upgrade options.' },
  { question: 'Can SSD be upgraded?', answer: 'Yes, SSD upgrades are available. Our team can help you choose the right storage capacity for your needs.' },
  { question: 'Do you provide delivery?', answer: 'Contact us on WhatsApp or call us to enquire about delivery options in Bengaluru and nearby areas.' },
  { question: 'Can I visit the store before buying?', answer: 'Absolutely! We encourage store visits at our HSR Layout location. You can inspect laptops in person before making a decision.' },
  { question: 'What brands do you carry?', answer: 'We stock refurbished laptops from Dell, HP, Lenovo, Apple/MacBook, and Asus. Inventory changes regularly — browse our current stock or visit the store.' },
];

export const TRUST_BADGES = [
  { icon: 'verified', title: 'Warranty Available', description: 'On refurbished laptops' },
  { icon: 'science', title: 'Quality Checked', description: 'Tested before sale' },
  { icon: 'store', title: 'Physical Store', description: 'HSR Layout, Bengaluru' },
  { icon: 'savings', title: 'Affordable Pricing', description: 'Quality used laptops' },
  { icon: 'support_agent', title: 'Expert Guidance', description: 'Help choosing the right laptop' },
];

export const WHY_CHOOSE_US = [
  { icon: 'verified_user', title: 'Refurbished & Used Laptops', description: 'Quality pre-owned laptops from trusted brands at affordable prices.' },
  { icon: 'support_agent', title: 'Warranty Support', description: 'Warranty available on select models — ask us for details.' },
  { icon: 'payments', title: 'Affordable Pricing', description: 'Get premium laptops at a fraction of the new price.' },
  { icon: 'storefront', title: 'Visit Our Store', description: 'Hands-on inspection at our HSR Layout store in Bengaluru.' },
  { icon: 'memory', title: 'Upgrade Options', description: 'RAM and SSD upgrades available on compatible models.' },
  { icon: 'psychology', title: 'Expert Guidance', description: 'Our team helps you find the right laptop for your needs and budget.' },
];

