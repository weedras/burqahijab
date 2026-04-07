import type { Product, Collection, Category, Testimonial } from '@/types';

export const categories: Category[] = [
  { id: 'cat-1', name: 'Abayas', slug: 'abayas', description: 'Premium abayas for every occasion', parentId: null,
    children: [
      { id: 'cat-1a', name: 'Open Abaya', slug: 'open-abaya', description: 'Flowing open-front designs', parentId: 'cat-1' },
      { id: 'cat-1b', name: 'Closed Abaya', slug: 'closed-abaya', description: 'Classic closed-front styles', parentId: 'cat-1' },
      { id: 'cat-1c', name: 'Butterfly Abaya', slug: 'butterfly-abaya', description: 'Dramatic butterfly sleeve designs', parentId: 'cat-1' },
      { id: 'cat-1d', name: 'Kimono Abaya', slug: 'kimono-abaya', description: 'Wide-sleeve kimono inspired', parentId: 'cat-1' },
    ]
  },
  { id: 'cat-2', name: 'Hijabs', slug: 'hijabs', description: 'Premium hijabs in every style', parentId: null,
    children: [
      { id: 'cat-2a', name: 'Jersey', slug: 'jersey-hijabs', description: 'Soft stretchy jersey fabric', parentId: 'cat-2' },
      { id: 'cat-2b', name: 'Chiffon', slug: 'chiffon-hijabs', description: 'Light and airy chiffon', parentId: 'cat-2' },
      { id: 'cat-2c', name: 'Silk', slug: 'silk-hijabs', description: 'Luxurious silk hijabs', parentId: 'cat-2' },
      { id: 'cat-2d', name: 'Instant', slug: 'instant-hijabs', description: 'Slip-on instant hijabs', parentId: 'cat-2' },
    ]
  },
  { id: 'cat-3', name: 'Accessories', slug: 'accessories', description: 'Complete your look', parentId: null,
    children: [
      { id: 'cat-3a', name: 'Pins & Brooches', slug: 'pins-brooches', description: 'Decorative hijab pins', parentId: 'cat-3' },
      { id: 'cat-3b', name: 'Underscarves', slug: 'underscarves', description: 'Foundation underscarves', parentId: 'cat-3' },
      { id: 'cat-3c', name: 'Bags', slug: 'bags', description: 'Matching bags', parentId: 'cat-3' },
      { id: 'cat-3d', name: 'Jewelry', slug: 'jewelry', description: 'Modest jewelry pieces', parentId: 'cat-3' },
    ]
  },
];

export const collections: Collection[] = [
  {
    id: 'col-1', name: 'Ramadan Edit 2026', slug: 'ramadan-edit',
    description: 'Embrace the blessed month with our curated collection of luxurious abayas and hijabs, designed for prayer, reflection, and celebration.',
    image: '/images/collections/ramadan-edit.png', featured: true
  },
  {
    id: 'col-2', name: 'Wedding Collection', slug: 'wedding-collection',
    description: 'Make your special day unforgettable with our bridal abayas — adorned with pearls, crystals, and handcrafted embroidery.',
    image: '/images/collections/wedding-collection.png', featured: true
  },
  {
    id: 'col-3', name: 'Everyday Essentials', slug: 'everyday-essentials',
    description: 'Comfort meets elegance in our everyday collection — versatile abayas and hijabs designed for the modern woman.',
    image: '/images/collections/everyday-essentials.png', featured: true
  },
  {
    id: 'col-4', name: 'New Arrivals', slug: 'new-arrivals',
    description: 'Be the first to discover our latest additions — fresh styles, new fabrics, and trending designs.',
    image: '/images/collections/new-arrivals.png', featured: true
  },
  {
    id: 'col-5', name: 'Best Sellers', slug: 'best-sellers',
    description: 'Our most loved pieces, chosen by thousands of women across the world.',
    image: '/images/collections/new-arrivals.png', featured: false
  },
  {
    id: 'col-6', name: 'Travel Collection', slug: 'travel-collection',
    description: 'Wrinkle-free, lightweight abayas perfect for your journeys — look impeccable wherever you go.',
    image: '/images/collections/everyday-essentials.png', featured: false
  },
];

export const products: Product[] = [
  {
    id: 'prod-1', name: 'Royal Chiffon Open Abaya', slug: 'royal-chiffon-open-abaya',
    description: 'Crafted from premium flowing chiffon with a subtle gold trim at the cuffs, this open abaya exudes effortless elegance. The A-line silhouette drapes beautifully, making it perfect for both special occasions and everyday wear. Features invisible side pockets and French seam finishing throughout.',
    fabricCare: '100% Premium Chiffon | 80 GSM | Made in Pakistan\nCare: Hand wash cold, hang dry. Low iron if needed. Do not bleach.',
    shipReturn: 'Pakistan: 3-5 business days (Free over PKR 3,000)\nInternational: 7-14 business days\nEasy 14-day returns. Items must be unworn with tags attached.',
    price: 4500, salePrice: 3200, currency: 'PKR',
    images: ['/images/products/abaya-1a.png', '/images/products/abaya-1b.png', '/images/products/abaya-1.png'],
    isNew: true, isBestSeller: true, isFeatured: true,
    occasion: 'Daily', fabric: 'Chiffon',
    colors: ['#000000', '#1A1A1A', '#2D2D2D', '#1A4B5C'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.8, reviewCount: 47, stockCount: 24
  },
  {
    id: 'prod-2', name: 'Emerald Caligraphy Crepe Abaya', slug: 'emerald-calligraphy-crepe-abaya',
    description: 'A masterpiece of modest fashion — this deep emerald green abaya features intricate Arabic calligraphy embroidery in gold thread along the sleeves and hem. Made from luxurious crepe fabric that falls perfectly, this piece is a celebration of Islamic art and modern design.',
    fabricCare: '100% Premium Crepe | 120 GSM | Made in Pakistan\nCare: Dry clean recommended. Steam iron on low heat.',
    shipReturn: 'Pakistan: 3-5 business days (Free over PKR 3,000)\nInternational: 7-14 business days\nEasy 14-day returns.',
    price: 7500, salePrice: null, currency: 'PKR',
    images: ['/images/products/abaya-2a.png', '/images/products/abaya-2.png'],
    isNew: true, isBestSeller: false, isFeatured: true,
    occasion: 'Eid', fabric: 'Crepe',
    colors: ['#065F46', '#000000', '#1A1A1A'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.9, reviewCount: 32, stockCount: 12
  },
  {
    id: 'prod-3', name: 'Minimal Beige Nida Abaya', slug: 'minimal-beige-nida-abaya',
    description: 'The quintessential everyday abaya — clean lines, premium Nida matte fabric, and invisible side pockets. This abaya is designed for the woman who values comfort without compromising on style. The relaxed A-line fit suits all body types beautifully.',
    fabricCare: '100% Premium Nida Matte | 140 GSM | Made in Pakistan\nCare: Machine wash cold, gentle cycle. Tumble dry low. Iron on medium heat.',
    shipReturn: 'Pakistan: 3-5 business days (Free over PKR 3,000)\nInternational: 7-14 business days\nEasy 14-day returns.',
    price: 3500, salePrice: 2800, currency: 'PKR',
    images: ['/images/products/abaya-3a.png', '/images/products/abaya-3.png'],
    isNew: false, isBestSeller: true, isFeatured: false,
    occasion: 'Daily', fabric: 'Nida',
    colors: ['#F5F0EB', '#E5DDD5', '#000000'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.7, reviewCount: 89, stockCount: 45
  },
  {
    id: 'prod-4', name: 'Midnight Butterfly Abaya', slug: 'midnight-butterfly-abaya',
    description: 'Make a statement with our dramatic butterfly abaya — featuring wide, flowing sleeves with delicate lace detailing at the edges. The midnight black silk chiffon fabric catches the light beautifully, creating an ethereal silhouette that commands attention.',
    fabricCare: '100% Silk Chiffon Blend | 90 GSM | Made in Pakistan\nCare: Hand wash cold or dry clean. Do not wring. Hang dry. Low steam iron.',
    shipReturn: 'Pakistan: 3-5 business days (Free over PKR 3,000)\nInternational: 7-14 business days\nEasy 14-day returns.',
    price: 6500, salePrice: null, currency: 'PKR',
    images: ['/images/products/abaya-4a.png', '/images/products/abaya-4.png'],
    isNew: true, isBestSeller: false, isFeatured: true,
    occasion: 'Wedding', fabric: 'Chiffon',
    colors: ['#000000', '#1A1A1A', '#2D2D2D'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.6, reviewCount: 28, stockCount: 15
  },
  {
    id: 'prod-5', name: 'Dusty Rose Jersey Hijab', slug: 'dusty-rose-jersey-hijab',
    description: 'Our bestselling jersey hijab in a stunning dusty rose — the perfect balance of comfort and elegance. The premium stretch fabric ensures a secure fit all day while maintaining a beautiful drape. Pairs beautifully with both black and beige abayas.',
    fabricCare: '95% Premium Jersey, 5% Spandex | Made in Turkey\nCare: Machine wash cold. Tumble dry low. No ironing needed.',
    shipReturn: 'Pakistan: 3-5 business days (Free over PKR 3,000)\nInternational: 7-14 business days\nEasy 14-day returns.',
    price: 1200, salePrice: 899, currency: 'PKR',
    images: ['/images/products/hijab-1a.png', '/images/products/hijab-1.png'],
    isNew: true, isBestSeller: true, isFeatured: false,
    occasion: 'Daily', fabric: 'Jersey',
    colors: ['#D4A5A5', '#FAF8F5', '#000000', '#1A4B5C'],
    sizes: ['One Size'],
    rating: 4.8, reviewCount: 156, stockCount: 120
  },
  {
    id: 'prod-6', name: 'Ivory Silk Gold Border Hijab', slug: 'ivory-silk-gold-border-hijab',
    description: 'Luxury redefined — this ivory white silk hijab features an exquisite gold border pattern that adds a touch of regal elegance to any outfit. The natural silk fabric has a beautiful sheen and feels incredibly soft against the skin. Perfect for special occasions.',
    fabricCare: '100% Natural Silk | Made in China\nCare: Dry clean only. Store wrapped in tissue. Avoid direct sunlight.',
    shipReturn: 'Pakistan: 3-5 business days (Free over PKR 3,000)\nInternational: 7-14 business days\nEasy 14-day returns.',
    price: 3500, salePrice: null, currency: 'PKR',
    images: ['/images/products/hijab-2a.png', '/images/products/hijab-2.png'],
    isNew: false, isBestSeller: false, isFeatured: true,
    occasion: 'Wedding', fabric: 'Silk',
    colors: ['#FAF8F5', '#F5F0EB', '#000000'],
    sizes: ['One Size'],
    rating: 4.9, reviewCount: 34, stockCount: 30
  },
  {
    id: 'prod-7', name: 'Charcoal Instant Hijab', slug: 'charcoal-instant-hijab',
    description: 'Ready in seconds — our instant hijab features a built-in cap that stays securely in place all day. The premium jersey fabric is breathable and comfortable, making it ideal for busy days. No pins needed!',
    fabricCare: '95% Premium Jersey, 5% Spandex | Made in Turkey\nCare: Machine wash cold. Tumble dry low.',
    shipReturn: 'Pakistan: 3-5 business days (Free over PKR 3,000)\nInternational: 7-14 business days\nEasy 14-day returns.',
    price: 1500, salePrice: 1199, currency: 'PKR',
    images: ['/images/products/hijab-3a.png', '/images/products/hijab-3.png'],
    isNew: true, isBestSeller: true, isFeatured: false,
    occasion: 'Daily', fabric: 'Jersey',
    colors: ['#2D2D2D', '#000000', '#1A1A1A', '#6B6B6B'],
    sizes: ['One Size'],
    rating: 4.5, reviewCount: 78, stockCount: 90
  },
  {
    id: 'prod-8', name: 'Burgundy Luxe Chiffon Hijab', slug: 'burgundy-luxe-chiffon-hijab',
    description: 'Rich, regal, and refined — this deep burgundy chiffon hijab is a statement piece. The lightweight fabric has a delicate sheen that catches the light, creating an elegant drape. Perfect for Eid celebrations and formal occasions.',
    fabricCare: '100% Premium Chiffon | Made in Pakistan\nCare: Hand wash cold. Hang dry. Low iron with cloth barrier.',
    shipReturn: 'Pakistan: 3-5 business days (Free over PKR 3,000)\nInternational: 7-14 business days\nEasy 14-day returns.',
    price: 1800, salePrice: null, currency: 'PKR',
    images: ['/images/products/hijab-4a.png', '/images/products/hijab-4.png'],
    isNew: false, isBestSeller: false, isFeatured: false,
    occasion: 'Eid', fabric: 'Chiffon',
    colors: ['#7F1D1D', '#000000', '#C9A96E'],
    sizes: ['One Size'],
    rating: 4.7, reviewCount: 45, stockCount: 60
  },
  {
    id: 'prod-9', name: 'Navy Kimono Embroidered Abaya', slug: 'navy-kimono-embroidered-abaya',
    description: 'Where Japanese design meets Islamic modesty — this navy blue kimono abaya features wide sleeves with subtle geometric embroidery. The contemporary design is perfect for the fashion-forward woman who appreciates cultural fusion.',
    fabricCare: '100% Premium Crepe | 120 GSM | Made in Pakistan\nCare: Dry clean recommended. Steam iron on low.',
    shipReturn: 'Pakistan: 3-5 business days (Free over PKR 3,000)\nInternational: 7-14 business days\nEasy 14-day returns.',
    price: 5800, salePrice: 4500, currency: 'PKR',
    images: ['/images/products/abaya-5a.png', '/images/products/abaya-5.png'],
    isNew: true, isBestSeller: false, isFeatured: true,
    occasion: 'Office', fabric: 'Crepe',
    colors: ['#1A4B5C', '#000000', '#2D2D2D'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.7, reviewCount: 22, stockCount: 18
  },
  {
    id: 'prod-10', name: 'Lavender Coord Set with Hijab', slug: 'lavender-coord-set-with-hijab',
    description: 'A perfectly coordinated modest outfit — this soft lavender abaya comes with a matching hijab, creating a complete look that requires no styling effort. Features delicate embroidery on the cuffs and hem with a subtle sheen fabric.',
    fabricCare: 'Abaya: 100% Premium Crepe | Hijab: 100% Chiffon\nCare: Hand wash cold separately. Hang dry. Low iron.',
    shipReturn: 'Pakistan: 3-5 business days (Free over PKR 3,000)\nInternational: 7-14 business days\nEasy 14-day returns.',
    price: 6200, salePrice: null, currency: 'PKR',
    images: ['/images/products/abaya-6a.png', '/images/products/abaya-6.png'],
    isNew: true, isBestSeller: false, isFeatured: false,
    occasion: 'Travel', fabric: 'Crepe',
    colors: ['#D4A5A5', '#000000', '#FAF8F5'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.8, reviewCount: 19, stockCount: 20
  },
  {
    id: 'prod-11', name: 'Gold Pearl Hijab Pin Set', slug: 'gold-pearl-hijab-pin-set',
    description: 'Elevate your hijab styling with our premium gold-plated hijab pins featuring delicate pearl accents. This set of 6 pins in varying sizes allows you to create different looks — from casual elegance to formal sophistication.',
    fabricCare: 'Gold-plated brass with freshwater pearls\nCare: Avoid contact with water and perfume. Store in included pouch.',
    shipReturn: 'Pakistan: 3-5 business days (Free over PKR 3,000)\nInternational: 7-14 business days\nEasy 14-day returns.',
    price: 1500, salePrice: 999, currency: 'PKR',
    images: ['/images/products/accessory-1a.png', '/images/products/accessory-1.png'],
    isNew: true, isBestSeller: true, isFeatured: false,
    occasion: 'Daily', fabric: null,
    colors: ['#C9A96E', '#FAF8F5'],
    sizes: ['One Size'],
    rating: 4.9, reviewCount: 112, stockCount: 80
  },
  {
    id: 'prod-12', name: 'Premium Cotton Underscarve Cap', slug: 'premium-cotton-underscarve-cap',
    description: 'The foundation of every perfect hijab style — our seamless underscarve cap is made from premium cotton jersey that stays comfortable all day. The no-slip design ensures your hijab stays in place without clips or pins.',
    fabricCare: '95% Premium Cotton, 5% Spandex | Made in Turkey\nCare: Machine wash cold. Tumble dry low.',
    shipReturn: 'Pakistan: 3-5 business days (Free over PKR 3,000)\nInternational: 7-14 business days\nEasy 14-day returns.',
    price: 600, salePrice: null, currency: 'PKR',
    images: ['/images/products/accessory-2a.png', '/images/products/accessory-2.png'],
    isNew: false, isBestSeller: true, isFeatured: false,
    occasion: 'Daily', fabric: 'Cotton',
    colors: ['#000000', '#F5F0EB', '#2D2D2D', '#D4A5A5'],
    sizes: ['One Size'],
    rating: 4.6, reviewCount: 203, stockCount: 200
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 'test-1', author: 'Ayesha Khan', location: 'Dubai, UAE',
    text: 'The quality of BurqaHijab abayas is unmatched. I ordered the Emerald Calligraphy Abaya for Eid and received so many compliments. The embroidery is exquisite and the fabric feels incredibly luxurious.',
    rating: 5, photoUrl: null
  },
  {
    id: 'test-2', author: 'Fatima Al-Rashid', location: 'Riyadh, Saudi Arabia',
    text: 'I have been searching for the perfect everyday abaya for years. The Minimal Beige Nida is exactly what I needed — comfortable, elegant, and the quality is outstanding. Already ordered my second one!',
    rating: 5, photoUrl: null
  },
  {
    id: 'test-3', author: 'Sarah Mahmood', location: 'London, UK',
    text: 'The shipping to the UK was surprisingly fast and the packaging was beautiful. The Dusty Rose Jersey Hijab is my new go-to — it matches everything and stays in place all day. Love this brand!',
    rating: 5, photoUrl: null
  },
  {
    id: 'test-4', author: 'Maryam Noor', location: 'Karachi, Pakistan',
    text: 'BurqaHijab has transformed my wardrobe. Their abayas are modern yet modest, and the quality speaks for itself. The customer service is also exceptional — they helped me find my perfect size.',
    rating: 4, photoUrl: null
  },
  {
    id: 'test-5', author: 'Zainab Ahmed', location: 'New York, USA',
    text: 'As someone who values both style and modesty, BurqaHijab is a dream come true. The Butterfly Abaya in midnight black is stunning — I wore it to a wedding and felt like royalty. Highly recommend!',
    rating: 5, photoUrl: null
  },
];

// Product-collection mapping
export const productCollections: Record<string, string[]> = {
  'col-1': ['prod-1', 'prod-2', 'prod-4', 'prod-8', 'prod-9'], // Ramadan
  'col-2': ['prod-2', 'prod-4', 'prod-6', 'prod-10'], // Wedding
  'col-3': ['prod-3', 'prod-5', 'prod-7', 'prod-12'], // Everyday
  'col-4': ['prod-1', 'prod-2', 'prod-4', 'prod-5', 'prod-7', 'prod-9', 'prod-10', 'prod-11'], // New Arrivals
  'col-5': ['prod-1', 'prod-3', 'prod-5', 'prod-7', 'prod-11', 'prod-12'], // Best Sellers
  'col-6': ['prod-3', 'prod-5', 'prod-7', 'prod-10'], // Travel
};

// Product-category mapping
export const productCategories: Record<string, string[]> = {
  'cat-1': ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-9', 'prod-10'], // Abayas
  'cat-1a': ['prod-1'], // Open Abaya
  'cat-1b': ['prod-2', 'prod-3'], // Closed Abaya
  'cat-1c': ['prod-4'], // Butterfly Abaya
  'cat-1d': ['prod-9'], // Kimono Abaya
  'cat-2': ['prod-5', 'prod-6', 'prod-7', 'prod-8'], // Hijabs
  'cat-2a': ['prod-5', 'prod-7'], // Jersey
  'cat-2b': ['prod-8'], // Chiffon
  'cat-2c': ['prod-6'], // Silk
  'cat-2d': ['prod-7'], // Instant
  'cat-3': ['prod-11', 'prod-12'], // Accessories
  'cat-3a': ['prod-11'], // Pins
  'cat-3b': ['prod-12'], // Underscarves
};
