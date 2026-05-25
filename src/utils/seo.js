// SEO utility functions and constants

export const SITE_CONFIG = {
  name: 'MealSection',
  title: 'MealSection - University Food Delivery Made Easy',
  description: 'Order delicious meals from your campus vendors with MealSection. Fast delivery, exclusive deals, and the best food options for students.',
  url: 'https://mealsection.com', // Update with your actual domain
  image: 'https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true',
  twitterHandle: '@mealsection',
  keywords: [
    'food delivery',
    'university meals',
    'campus food',
    'student food delivery',
    'online food ordering',
    'meal delivery service',
    'campus vendors',
    'quick bites',
    'fast food delivery',
    'student discounts'
  ]
};

export const generateMetaTags = ({
  title = SITE_CONFIG.title,
  description = SITE_CONFIG.description,
  keywords = SITE_CONFIG.keywords,
  image = SITE_CONFIG.image,
  url = SITE_CONFIG.url,
  type = 'website',
  author = SITE_CONFIG.name,
  canonical,
  noindex = false
}) => {
  const fullTitle = title.includes(SITE_CONFIG.name) ? title : `${title} | ${SITE_CONFIG.name}`;
  
  return {
    title: fullTitle,
    meta: [
      // Basic Meta Tags
      { name: 'description', content: description },
      { name: 'keywords', content: Array.isArray(keywords) ? keywords.join(', ') : keywords },
      { name: 'author', content: author },
      { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' },
      
      // Open Graph / Facebook
      { property: 'og:type', content: type },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: canonical || url },
      { property: 'og:site_name', content: SITE_CONFIG.name },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: SITE_CONFIG.twitterHandle },
      { name: 'twitter:creator', content: SITE_CONFIG.twitterHandle },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      
      // Mobile Meta Tags
      { name: 'theme-color', content: '#ffffff' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: SITE_CONFIG.name },
    ],
    link: canonical ? [{ rel: 'canonical', href: canonical }] : []
  };
};

// Page-specific SEO configurations
export const PAGE_SEO = {
  home: {
    title: 'MealSection - University Food Delivery Made Easy',
    description: 'Order delicious meals from your campus vendors with MealSection. Fast delivery, exclusive deals, and the best food options for students.',
    keywords: ['university food delivery', 'campus meals', 'student food ordering', 'online meal delivery', 'campus vendors']
  },
  vendors: {
    title: 'Browse Vendors - Find Your Favorite Campus Restaurants',
    description: 'Discover amazing food vendors on your campus. Browse menus, check ratings, and order from the best restaurants near you.',
    keywords: ['campus vendors', 'university restaurants', 'food vendors', 'campus dining', 'restaurant listings']
  },
  meals: {
    title: 'Browse Meals - Delicious Food at Your Fingertips',
    description: 'Explore a wide variety of meals from your favorite campus vendors. From quick bites to full meals, find what you crave.',
    keywords: ['meal menu', 'food options', 'campus meals', 'meal ordering', 'food delivery menu']
  },
  cart: {
    title: 'Your Cart - Review Your Order',
    description: 'Review your cart and complete your order. Fast, secure checkout for campus food delivery.',
    keywords: ['shopping cart', 'order review', 'checkout', 'food cart']
  },
  checkout: {
    title: 'Checkout - Complete Your Order',
    description: 'Securely complete your food order with fast delivery to your campus location.',
    keywords: ['checkout', 'payment', 'order completion', 'secure payment']
  },
  profile: {
    title: 'My Profile - Manage Your Account',
    description: 'Manage your MealSection account, view order history, and update your preferences.',
    keywords: ['user profile', 'account settings', 'order history', 'manage account']
  },
  orders: {
    title: 'My Orders - Track Your Food Delivery',
    description: 'View and track all your orders. Monitor delivery status and order history in real-time.',
    keywords: ['order tracking', 'delivery status', 'order history', 'my orders']
  },
  wallet: {
    title: 'My Wallet - Manage Your Balance',
    description: 'Check your wallet balance, add funds, and manage your MealSection payment methods.',
    keywords: ['wallet', 'balance', 'payment methods', 'add funds']
  },
  promotions: {
    title: 'Promotions & Deals - Save on Your Favorite Meals',
    description: 'Discover exclusive promotions, flash deals, and special offers on campus food delivery.',
    keywords: ['promotions', 'deals', 'discounts', 'special offers', 'food deals']
  },
  contact: {
    title: 'Contact Us - Get Help & Support',
    description: 'Need help? Contact MealSection support team for assistance with orders, payments, and more.',
    keywords: ['contact', 'support', 'help', 'customer service']
  },
  login: {
    title: 'Login - Access Your Account',
    description: 'Login to your MealSection account to order food, track deliveries, and manage your profile.',
    keywords: ['login', 'sign in', 'account access'],
    noindex: true
  },
  signup: {
    title: 'Sign Up - Join MealSection Today',
    description: 'Create your MealSection account and start ordering delicious meals from campus vendors.',
    keywords: ['sign up', 'register', 'create account', 'join'],
    noindex: true
  }
};

// Generate structured data (JSON-LD)
export const generateStructuredData = (type, data) => {
  const baseData = {
    '@context': 'https://schema.org',
  };

  switch (type) {
    case 'organization':
      return {
        ...baseData,
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        logo: SITE_CONFIG.image,
        description: SITE_CONFIG.description,
        sameAs: [
          // Add your social media URLs here
          'https://twitter.com/mealsection',
          'https://facebook.com/mealsection',
          'https://instagram.com/mealsection'
        ]
      };

    case 'website':
      return {
        ...baseData,
        '@type': 'WebSite',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        description: SITE_CONFIG.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_CONFIG.url}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };

    case 'restaurant':
      return {
        ...baseData,
        '@type': 'Restaurant',
        ...data
      };

    case 'product':
      return {
        ...baseData,
        '@type': 'Product',
        ...data
      };

    case 'breadcrumb':
      return {
        ...baseData,
        '@type': 'BreadcrumbList',
        itemListElement: data.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url
        }))
      };

    default:
      return baseData;
  }
};
