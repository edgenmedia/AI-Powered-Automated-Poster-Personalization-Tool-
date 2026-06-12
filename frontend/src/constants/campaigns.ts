export interface Campaign {
  label: string;
  value: string;
}

export interface CampaignCategory {
  category: string;
  campaigns: Campaign[];
}

export const CAMPAIGN_CATEGORIES: CampaignCategory[] = [
  {
    category: "Festival & Celebration",
    campaigns: [
      { label: "Diwali Wealth Creation", value: "Create a Diwali Wealth Creation Campaign." },
      { label: "Post-Diwali Smart Investment", value: "Create a Post-Diwali Smart Investment Campaign." },
      { label: "Ugadi Prosperity & New Beginnings", value: "Create a Ugadi Prosperity & New Beginnings Campaign." },
      { label: "Sankranti Family Legacy Investment", value: "Create a Sankranti Family Legacy Investment Campaign." },
      { label: "Dussehra Victory & Growth", value: "Create a Dussehra Victory & Growth Campaign." },
      { label: "Raksha Bandhan Secure Future", value: "Create a Raksha Bandhan Secure Future Campaign." },
      { label: "Ganesh Chaturthi Auspicious Investment", value: "Create a Ganesh Chaturthi Auspicious Investment Campaign." },
      { label: "Christmas Family Happiness", value: "Create a Christmas Family Happiness Campaign." },
      { label: "New Year Wealth Building", value: "Create a New Year Wealth Building Campaign." }
    ]
  },
  {
    category: "Family-Oriented",
    campaigns: [
      { label: "Family Legacy Investment", value: "Create a Family Legacy Investment Campaign." },
      { label: "Dream Home for Future Generations", value: "Create a Dream Home for Future Generations Campaign." },
      { label: "Children's Future Security", value: "Create a Children's Future Security Campaign." },
      { label: "Three-Generation Family Wealth", value: "Create a Three-Generation Family Wealth Campaign." },
      { label: "Family Happiness & Community Living", value: "Create a Family Happiness & Community Living Campaign." },
      { label: "Parents' Pride Investment", value: "Create a Parents' Pride Investment Campaign." }
    ]
  },
  {
    category: "Luxury & Lifestyle",
    campaigns: [
      { label: "Luxury Township Lifestyle", value: "Create a Luxury Township Lifestyle Campaign." },
      { label: "Premium Living Destination", value: "Create a Premium Living Destination Campaign." },
      { label: "Resort-Style Community", value: "Create a Resort-Style Community Campaign." },
      { label: "Modern Elite Neighborhood", value: "Create a Modern Elite Neighborhood Campaign." },
      { label: "Green Luxury Living", value: "Create a Green Luxury Living Campaign." },
      { label: "High-End Investment Destination", value: "Create a High-End Investment Destination Campaign." }
    ]
  },
  {
    category: "Investment Focused",
    campaigns: [
      { label: "Smart Investor's Choice", value: "Create a Smart Investor's Choice Campaign." },
      { label: "Future Appreciation Investment", value: "Create a Future Appreciation Investment Campaign." },
      { label: "Land Banking Wealth", value: "Create a Land Banking Wealth Campaign." },
      { label: "High-Growth Corridor Investment", value: "Create a High-Growth Corridor Investment Campaign." },
      { label: "Golden Opportunity Investment", value: "Create a Golden Opportunity Investment Campaign." },
      { label: "Millionaire Plot Investment", value: "Create a Millionaire Plot Investment Campaign." },
      { label: "Wealth Multiplication", value: "Create a Wealth Multiplication Campaign." },
      { label: "Secure Asset Creation", value: "Create a Secure Asset Creation Campaign." }
    ]
  },
  {
    category: "Infrastructure & Growth",
    campaigns: [
      { label: "Emerging Growth Corridor", value: "Create an Emerging Growth Corridor Campaign." },
      { label: "Future City Development", value: "Create a Future City Development Campaign." },
      { label: "Next Infrastructure Boom", value: "Create a Next Infrastructure Boom Campaign." },
      { label: "Smart City Expansion", value: "Create a Smart City Expansion Campaign." },
      { label: "Regional Growth Hub", value: "Create a Regional Growth Hub Campaign." },
      { label: "Fastest Developing Area", value: "Create a Fastest Developing Area Campaign." }
    ]
  },
  {
    category: "Emotional & Aspirational",
    campaigns: [
      { label: "From Dreams To Reality", value: "Create a From Dreams To Reality Campaign." },
      { label: "Build Your Legacy", value: "Create a Build Your Legacy Campaign." },
      { label: "Place Where Dreams Take Shape", value: "Create a Place Where Dreams Take Shape Campaign." },
      { label: "Future Starts Here", value: "Create a Future Starts Here Campaign." },
      { label: "Gift Your Family A Better Tomorrow", value: "Create a Gift Your Family A Better Tomorrow Campaign." },
      { label: "Foundation For Generations", value: "Create a Foundation For Generations Campaign." }
    ]
  },
  {
    category: "High-Converting Premium Concepts",
    campaigns: [
      { label: "Own Tomorrow Today", value: "Create a \"Own Tomorrow Today\" Campaign." },
      { label: "The Address Of Future Success", value: "Create a \"The Address Of Future Success\" Campaign." },
      { label: "Where Wealth Meets Lifestyle", value: "Create a \"Where Wealth Meets Lifestyle\" Campaign." },
      { label: "Invest Once, Prosper Forever", value: "Create a \"Invest Once, Prosper Forever\" Campaign." },
      { label: "The Smart Money Is Moving Here", value: "Create a \"The Smart Money Is Moving Here\" Campaign." },
      { label: "Before The Market Discovers It", value: "Create a \"Before The Market Discovers It\" Campaign." },
      { label: "Tomorrow's Landmark, Today's Investment", value: "Create a \"Tomorrow's Landmark, Today's Investment\" Campaign." },
      { label: "Secure Land, Secure Legacy", value: "Create a \"Secure Land, Secure Legacy\" Campaign." }
    ]
  },
  {
    category: "Trending / News-Based",
    campaigns: [
      { label: "IPL Victory Celebration Investment", value: "Create an IPL Victory Celebration Investment Campaign." },
      { label: "Record Market Growth Investment", value: "Create a Record Market Growth Investment Campaign." },
      { label: "Rising India Infrastructure", value: "Create a Rising India Infrastructure Campaign." },
      { label: "Digital India Smart Investment", value: "Create a Digital India Smart Investment Campaign." },
      { label: "New Economic Growth Wave", value: "Create a New Economic Growth Wave Campaign." },
      { label: "Made In India Prosperity", value: "Create a Made In India Prosperity Campaign." }
    ]
  }
];
