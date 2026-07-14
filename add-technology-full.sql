-- ============================================
-- ADD TECHNOLOGY CATEGORY
-- ============================================

INSERT OR IGNORE INTO reliable_categories (name, slug, description, icon, display_order) 
VALUES ('Technology', 'technology', 'Technology products, software, AI, and tech innovations', '💻', 2);

-- ============================================
-- ADD TECHNOLOGY SUBCATEGORIES
-- ============================================

INSERT OR IGNORE INTO reliable_subcategories (category_id, name, slug, description, display_order) 
SELECT (SELECT id FROM reliable_categories WHERE slug = 'technology'), 'Consumer Technology', 'consumer-technology', 'Consumer electronics and tech products', 1
UNION ALL
SELECT (SELECT id FROM reliable_categories WHERE slug = 'technology'), 'Software and Applications', 'software-applications', 'Software, apps, and operating systems', 2
UNION ALL
SELECT (SELECT id FROM reliable_categories WHERE slug = 'technology'), 'Artificial Intelligence', 'artificial-intelligence', 'AI models, applications, and machine learning', 3
UNION ALL
SELECT (SELECT id FROM reliable_categories WHERE slug = 'technology'), 'Internet and Web Technology', 'internet-web-technology', 'Web, browsers, and internet infrastructure', 4
UNION ALL
SELECT (SELECT id FROM reliable_categories WHERE slug = 'technology'), 'Cloud and Enterprise Technology', 'cloud-enterprise-technology', 'Cloud computing, SaaS, and DevOps', 5
UNION ALL
SELECT (SELECT id FROM reliable_categories WHERE slug = 'technology'), 'Developer Technology', 'developer-technology', 'Programming, frameworks, and dev tools', 6
UNION ALL
SELECT (SELECT id FROM reliable_categories WHERE slug = 'technology'), 'Gaming Technology', 'gaming-technology', 'Gaming hardware, games, and esports', 7
UNION ALL
SELECT (SELECT id FROM reliable_categories WHERE slug = 'technology'), 'Emerging Technology', 'emerging-technology', 'Robotics, VR/AR, quantum, and space tech', 8
UNION ALL
SELECT (SELECT id FROM reliable_categories WHERE slug = 'technology'), 'Business Technology', 'business-technology', 'FinTech, HealthTech, EdTech, and more', 9
UNION ALL
SELECT (SELECT id FROM reliable_categories WHERE slug = 'technology'), 'Technology News and Trends', 'technology-news-trends', 'Tech news, reviews, and future trends', 10;

-- ============================================
-- ADD CONSUMER TECHNOLOGY SUB-SUBCATEGORIES
-- ============================================

INSERT OR IGNORE INTO reliable_sub_subcategories (subcategory_id, name, slug, description, display_order)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Smartphones', 'smartphones', 'Mobile phones and accessories', 1
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'iPhone', 'iphone', 'Apple iPhone', 2
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Android Phones', 'android-phones', 'Android smartphones', 3
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Foldable Phones', 'foldable-phones', 'Foldable display phones', 4
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Phone Accessories', 'phone-accessories', 'Cases, chargers, and screen protectors', 5
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Computers', 'computers', 'Laptops, desktops, and accessories', 6
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Laptops', 'laptops', 'Portable computers', 7
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Desktops', 'desktops', 'Desktop computers', 8
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Gaming PCs', 'gaming-pcs', 'High-performance gaming computers', 9
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Computer Accessories', 'computer-accessories', 'Keyboards, mice, and monitors', 10
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Tablets and E-Readers', 'tablets-e-readers', 'Tablets and e-book readers', 11
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Wearable Technology', 'wearable-technology', 'Smartwatches, fitness trackers, and more', 12
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Smartwatches', 'smartwatches', 'Smart watches and wearables', 13
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Fitness Trackers', 'fitness-trackers', 'Activity and fitness bands', 14
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Smart Rings', 'smart-rings', 'Smart ring technology', 15
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'AR Glasses', 'ar-glasses', 'Augmented reality glasses', 16
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Smart Home', 'smart-home', 'Smart home devices', 17
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Smart Speakers', 'smart-speakers', 'Smart speakers and displays', 18
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Smart Lighting', 'smart-lighting', 'Smart bulbs and lighting systems', 19
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Security Cameras', 'security-cameras', 'Home security cameras', 20
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Smart Appliances', 'smart-appliances', 'Smart home appliances', 21
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), 'Home Automation', 'home-automation', 'Home automation systems', 22;

-- ============================================
-- ADD SOFTWARE & APPLICATIONS SUB-SUBCATEGORIES
-- ============================================

INSERT OR IGNORE INTO reliable_sub_subcategories (subcategory_id, name, slug, description, display_order)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Operating Systems', 'operating-systems', 'OS platforms', 1
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Windows', 'windows', 'Microsoft Windows', 2
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'macOS', 'macos', 'Apple macOS', 3
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Linux', 'linux', 'Linux distributions', 4
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Android', 'android', 'Android OS', 5
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'iOS', 'ios', 'Apple iOS', 6
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Productivity Software', 'productivity-software', 'Office, notes, and project management', 7
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Office Apps', 'office-apps', 'Microsoft Office, Google Workspace', 8
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Note Taking Apps', 'note-taking-apps', 'Evernote, Notion, OneNote', 9
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Project Management', 'project-management', 'Asana, Trello, Jira', 10
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Collaboration Tools', 'collaboration-tools', 'Slack, Teams, Zoom', 11
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Creative Software', 'creative-software', 'Photo, video, and design tools', 12
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Photo Editing', 'photo-editing', 'Photoshop, Lightroom, GIMP', 13
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Video Editing', 'video-editing', 'Premiere Pro, Final Cut, DaVinci', 14
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Design Tools', 'design-tools', 'Figma, Sketch, Adobe XD', 15
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), '3D and Animation', '3d-animation', 'Blender, Maya, Cinema 4D', 16
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Security Software', 'security-software', 'Antivirus, VPN, password managers', 17
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Antivirus', 'antivirus', 'Norton, McAfee, Bitdefender', 18
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'VPN', 'vpn', 'NordVPN, ExpressVPN', 19
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Password Managers', 'password-managers', 'LastPass, 1Password, Dashlane', 20
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Privacy Tools', 'privacy-tools', 'Privacy protection software', 21
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Mobile Apps', 'mobile-apps', 'Apps for mobile devices', 22
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Social Apps', 'social-apps', 'Instagram, TikTok, Twitter', 23
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Finance Apps', 'finance-apps', 'Banking, investing, and budgeting', 24
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Health Apps', 'health-apps', 'Health and fitness apps', 25
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'software-applications'), 'Entertainment Apps', 'entertainment-apps', 'Netflix, Spotify, gaming apps', 26;

-- ============================================
-- ADD ARTIFICIAL INTELLIGENCE SUB-SUBCATEGORIES
-- ============================================

INSERT OR IGNORE INTO reliable_sub_subcategories (subcategory_id, name, slug, description, display_order)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'AI Models', 'ai-models', 'Foundation AI models', 1
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'Large Language Models', 'large-language-models', 'GPT, Claude, Gemini', 2
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'Image AI', 'image-ai', 'Image generation and recognition', 3
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'Video AI', 'video-ai', 'Video generation and analysis', 4
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'Voice AI', 'voice-ai', 'Voice synthesis and recognition', 5
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'AI Applications', 'ai-applications', 'AI-powered tools and services', 6
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'AI Assistants', 'ai-assistants', 'ChatGPT, Claude, Copilot', 7
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'AI Search', 'ai-search', 'Perplexity, SearchGPT', 8
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'AI Writing Tools', 'ai-writing-tools', 'Jasper, Grammarly, Copy.ai', 9
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'AI Coding Tools', 'ai-coding-tools', 'GitHub Copilot, Cursor', 10
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'AI Design Tools', 'ai-design-tools', 'Midjourney, DALL-E, Stable Diffusion', 11
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'Machine Learning', 'machine-learning', 'ML frameworks and techniques', 12
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'Deep Learning', 'deep-learning', 'Neural networks and deep learning', 13
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'Computer Vision', 'computer-vision', 'Image and video understanding', 14
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'Natural Language Processing', 'natural-language-processing', 'Language understanding and generation', 15
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'Robotics AI', 'robotics-ai', 'AI in robotics', 16
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), 'AI Industry Trends', 'ai-industry-trends', 'AI news and future directions', 17;

-- ============================================
-- ADD INTERNET & WEB TECHNOLOGY SUB-SUBCATEGORIES
-- ============================================

INSERT OR IGNORE INTO reliable_sub_subcategories (subcategory_id, name, slug, description, display_order)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'Websites', 'websites', 'Website builders and platforms', 1
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'Website Builders', 'website-builders', 'Wix, Squarespace, Webflow', 2
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'CMS Platforms', 'cms-platforms', 'WordPress, Drupal, Joomla', 3
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'Web Design', 'web-design', 'Web design tools and resources', 4
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'Browsers', 'browsers', 'Chrome, Firefox, Safari, Edge', 5
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'Search Technology', 'search-technology', 'Google, Bing, Search engines', 6
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'Social Platforms', 'social-platforms', 'Social media platforms', 7
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'Web3 and Blockchain', 'web3-blockchain', 'Decentralized web technology', 8
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'Cryptocurrency', 'cryptocurrency', 'Bitcoin, Ethereum, altcoins', 9
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'NFTs', 'nfts', 'Non-fungible tokens', 10
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'Decentralized Apps', 'decentralized-apps', 'DApps and DeFi', 11
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'Internet Infrastructure', 'internet-infrastructure', 'CDN, DNS, hosting, cloud', 12
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'CDN', 'cdn', 'Content Delivery Networks', 13
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'DNS', 'dns', 'Domain Name System', 14
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'Hosting', 'hosting', 'Web hosting services', 15
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'internet-web-technology'), 'Cloud Services', 'cloud-services', 'Cloud hosting and platforms', 16;

-- ============================================
-- ADD CLOUD & ENTERPRISE TECHNOLOGY SUB-SUBCATEGORIES
-- ============================================

INSERT OR IGNORE INTO reliable_sub_subcategories (subcategory_id, name, slug, description, display_order)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'Cloud Computing', 'cloud-computing', 'Cloud platforms and services', 1
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'AWS', 'aws', 'Amazon Web Services', 2
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'Microsoft Azure', 'microsoft-azure', 'Azure cloud platform', 3
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'Google Cloud', 'google-cloud', 'Google Cloud Platform', 4
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'Cloudflare', 'cloudflare', 'Cloudflare services', 5
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'SaaS', 'saas', 'Software as a Service', 6
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'Business Software', 'business-software', 'Business applications', 7
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'CRM', 'crm', 'Customer Relationship Management', 8
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'ERP', 'erp', 'Enterprise Resource Planning', 9
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'HR Software', 'hr-software', 'Human Resources software', 10
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'Data Technology', 'data-technology', 'Databases and analytics', 11
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'Databases', 'databases', 'SQL, NoSQL, and database systems', 12
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'Data Warehousing', 'data-warehousing', 'Snowflake, BigQuery, Redshift', 13
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'Big Data', 'big-data', 'Hadoop, Spark, and big data tools', 14
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'Analytics', 'analytics', 'Data analytics and BI tools', 15
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'DevOps', 'devops', 'Development and operations', 16
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'Containers', 'containers', 'Docker and containerization', 17
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'Kubernetes', 'kubernetes', 'Kubernetes orchestration', 18
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'CI/CD', 'cicd', 'Continuous Integration and Deployment', 19
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), 'Monitoring', 'monitoring', 'Application and system monitoring', 20;

-- ============================================
-- ADD DEVELOPER TECHNOLOGY SUB-SUBCATEGORIES
-- ============================================

INSERT OR IGNORE INTO reliable_sub_subcategories (subcategory_id, name, slug, description, display_order)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Programming Languages', 'programming-languages', 'Programming language resources', 1
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'JavaScript', 'javascript', 'JavaScript and TypeScript', 2
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Python', 'python', 'Python programming', 3
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Java', 'java', 'Java programming', 4
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'C++', 'cpp', 'C++ programming', 5
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Rust', 'rust', 'Rust programming', 6
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Frameworks', 'frameworks', 'Development frameworks', 7
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Frontend', 'frontend', 'React, Vue, Angular', 8
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Backend', 'backend', 'Node.js, Django, Spring', 9
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Mobile', 'mobile', 'React Native, Flutter, Swift', 10
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'AI Frameworks', 'ai-frameworks', 'TensorFlow, PyTorch', 11
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Software Engineering', 'software-engineering', 'Software development practices', 12
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Architecture', 'architecture', 'System architecture patterns', 13
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Testing', 'testing', 'Testing frameworks and tools', 14
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Security', 'security', 'Application security', 15
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'System Design', 'system-design', 'System design resources', 16
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Developer Tools', 'developer-tools', 'Code editors, Git, APIs', 17
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Code Editors', 'code-editors', 'VS Code, IntelliJ, Sublime', 18
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Git', 'git', 'Git and GitHub', 19
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'APIs', 'apis', 'API development and tools', 20
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), 'Open Source', 'open-source', 'Open source resources', 21;

-- ============================================
-- ADD GAMING TECHNOLOGY SUB-SUBCATEGORIES
-- ============================================

INSERT OR IGNORE INTO reliable_sub_subcategories (subcategory_id, name, slug, description, display_order)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), 'Gaming Hardware', 'gaming-hardware', 'Gaming consoles and PCs', 1
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), 'Consoles', 'consoles', 'PlayStation, Xbox, Nintendo', 2
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), 'Gaming PCs', 'gaming-pcs', 'Custom gaming PCs', 3
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), 'Accessories', 'accessories', 'Controllers, headsets, and more', 4
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), 'Video Games', 'video-games', 'Game titles and releases', 5
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), 'PC Games', 'pc-games', 'PC gaming titles', 6
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), 'Console Games', 'console-games', 'Console game titles', 7
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), 'Mobile Games', 'mobile-games', 'Mobile gaming titles', 8
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), 'Game Development', 'game-development', 'Game dev resources', 9
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), 'Esports Technology', 'esports-technology', 'Esports platforms and tech', 10;

-- ============================================
-- ADD EMERGING TECHNOLOGY SUB-SUBCATEGORIES
-- ============================================

INSERT OR IGNORE INTO reliable_sub_subcategories (subcategory_id, name, slug, description, display_order)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'emerging-technology'), 'Robotics', 'robotics', 'Robotics technology', 1
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'emerging-technology'), 'Autonomous Vehicles', 'autonomous-vehicles', 'Self-driving cars and tech', 2
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'emerging-technology'), 'Virtual Reality', 'virtual-reality', 'VR technology', 3
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'emerging-technology'), 'Augmented Reality', 'augmented-reality', 'AR technology', 4
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'emerging-technology'), 'Quantum Computing', 'quantum-computing', 'Quantum computing resources', 5
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'emerging-technology'), 'Biotechnology Technology', 'biotech-technology', 'Biotech innovations', 6
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'emerging-technology'), 'Space Technology', 'space-technology', 'Space exploration and tech', 7
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'emerging-technology'), 'Advanced Materials', 'advanced-materials', 'Nanotech and materials science', 8;

-- ============================================
-- ADD BUSINESS TECHNOLOGY SUB-SUBCATEGORIES
-- ============================================

INSERT OR IGNORE INTO reliable_sub_subcategories (subcategory_id, name, slug, description, display_order)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'business-technology'), 'FinTech', 'fintech', 'Financial technology', 1
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'business-technology'), 'HealthTech', 'healthtech', 'Healthcare technology', 2
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'business-technology'), 'EdTech', 'edtech', 'Education technology', 3
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'business-technology'), 'LegalTech', 'legaltech', 'Legal technology', 4
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'business-technology'), 'Retail Technology', 'retail-technology', 'Retail and e-commerce tech', 5
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'business-technology'), 'Marketing Technology', 'marketing-technology', 'Marketing tech tools', 6
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'business-technology'), 'Travel Technology', 'travel-technology', 'Travel and hospitality tech', 7;

-- ============================================
-- ADD TECHNOLOGY NEWS & TRENDS SUB-SUBCATEGORIES
-- ============================================

INSERT OR IGNORE INTO reliable_sub_subcategories (subcategory_id, name, slug, description, display_order)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'technology-news-trends'), 'Product Launches', 'product-launches', 'New product releases', 1
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'technology-news-trends'), 'Company News', 'company-news', 'Tech company news', 2
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'technology-news-trends'), 'Startup News', 'startup-news', 'Startup and venture news', 3
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'technology-news-trends'), 'Reviews', 'reviews', 'Tech product reviews', 4
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'technology-news-trends'), 'Comparisons', 'comparisons', 'Tech product comparisons', 5
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'technology-news-trends'), 'How-To Guides', 'how-to-guides', 'Tech tutorials and guides', 6
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'technology-news-trends'), 'Future Technology', 'future-technology', 'Future tech trends', 7;

-- ============================================
-- ADD SAMPLE WEBSITES FOR TECHNOLOGY
-- ============================================

-- Smartphones Websites
INSERT OR IGNORE INTO reliable_websites (subcategory_id, sub_subcategory_id, name, url, description, reliability_score, notes, country, logo_url, is_featured, last_verified, verified_by)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'smartphones'), 'Apple iPhone', 'https://www.apple.com/iphone', 'Official Apple iPhone store', 10, 'Premium smartphones', 'USA', '/logos/apple.png', 1, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'smartphones'), 'Samsung Galaxy', 'https://www.samsung.com/us/smartphones', 'Official Samsung Galaxy store', 9, 'Android flagship phones', 'South Korea', '/logos/samsung.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'smartphones'), 'Google Pixel', 'https://store.google.com/phones', 'Official Google Pixel store', 9, 'Google flagship phones', 'USA', '/logos/google.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'smartphones'), 'OnePlus', 'https://www.oneplus.com', 'Affordable flagship phones', 7, 'Great value smartphones', 'China', '/logos/oneplus.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'smartphones'), 'Best Buy', 'https://www.bestbuy.com/site/phones', 'All major phone brands', 8, 'Wide phone selection', 'USA', '/logos/best-buy.png', 0, DATE('now'), 'admin';

-- Laptops Websites
INSERT OR IGNORE INTO reliable_websites (subcategory_id, sub_subcategory_id, name, url, description, reliability_score, notes, country, logo_url, is_featured, last_verified, verified_by)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'laptops'), 'Dell', 'https://www.dell.com', 'Laptops and desktops', 8, 'Enterprise and consumer PCs', 'USA', '/logos/dell.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'laptops'), 'Apple MacBook', 'https://www.apple.com/mac', 'MacBooks and iMacs', 10, 'Premium Apple computers', 'USA', '/logos/apple.png', 1, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'laptops'), 'Lenovo', 'https://www.lenovo.com', 'ThinkPad and IdeaPad laptops', 8, 'Reliable business laptops', 'China', '/logos/lenovo.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'laptops'), 'Microsoft Surface', 'https://www.microsoft.com/en-us/store', 'Surface laptops', 8, 'Microsoft Surface devices', 'USA', '/logos/microsoft.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'consumer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'laptops'), 'Newegg', 'https://www.newegg.com', 'PC components and laptops', 7, 'Great for PC builders', 'USA', '/logos/newegg.png', 0, DATE('now'), 'admin';

-- AI Assistants Websites
INSERT OR IGNORE INTO reliable_websites (subcategory_id, sub_subcategory_id, name, url, description, reliability_score, notes, country, logo_url, is_featured, last_verified, verified_by)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'ai-assistants'), 'ChatGPT', 'https://chat.openai.com', 'OpenAI ChatGPT', 10, 'Leading AI assistant', 'USA', '/logos/chatgpt.png', 1, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'ai-assistants'), 'Claude', 'https://claude.ai', 'Anthropic Claude AI', 9, 'Advanced AI assistant', 'USA', '/logos/claude.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'ai-assistants'), 'Microsoft Copilot', 'https://copilot.microsoft.com', 'Microsoft AI assistant', 8, 'Integrated AI assistant', 'USA', '/logos/copilot.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'ai-assistants'), 'Gemini', 'https://gemini.google.com', 'Google Gemini AI', 8, 'Google AI assistant', 'USA', '/logos/gemini.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'artificial-intelligence'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'ai-assistants'), 'Perplexity', 'https://www.perplexity.ai', 'AI search and assistant', 8, 'AI-powered search', 'USA', '/logos/perplexity.png', 0, DATE('now'), 'admin';

-- Cloud Computing Websites
INSERT OR IGNORE INTO reliable_websites (subcategory_id, sub_subcategory_id, name, url, description, reliability_score, notes, country, logo_url, is_featured, last_verified, verified_by)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'aws'), 'AWS', 'https://aws.amazon.com', 'Amazon Web Services', 10, 'Leading cloud platform', 'USA', '/logos/aws.png', 1, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'microsoft-azure'), 'Microsoft Azure', 'https://azure.microsoft.com', 'Azure cloud platform', 9, 'Microsoft cloud services', 'USA', '/logos/azure.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'google-cloud'), 'Google Cloud', 'https://cloud.google.com', 'Google Cloud Platform', 9, 'Google cloud services', 'USA', '/logos/google-cloud.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'cloudflare'), 'Cloudflare', 'https://www.cloudflare.com', 'Cloudflare services', 9, 'CDN and cloud security', 'USA', '/logos/cloudflare.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'cloud-enterprise-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'cloud-computing'), 'DigitalOcean', 'https://www.digitalocean.com', 'Cloud hosting platform', 7, 'Developer-friendly cloud', 'USA', '/logos/digitalocean.png', 0, DATE('now'), 'admin';

-- Programming Languages Websites
INSERT OR IGNORE INTO reliable_websites (subcategory_id, sub_subcategory_id, name, url, description, reliability_score, notes, country, logo_url, is_featured, last_verified, verified_by)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'python'), 'Python.org', 'https://www.python.org', 'Official Python programming language', 10, 'Python documentation and resources', 'USA', '/logos/python.png', 1, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'javascript'), 'MDN Web Docs', 'https://developer.mozilla.org', 'JavaScript documentation', 10, 'Best JavaScript reference', 'USA', '/logos/mdn.png', 1, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'java'), 'Oracle Java', 'https://www.oracle.com/java', 'Official Java platform', 9, 'Java documentation and downloads', 'USA', '/logos/java.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'rust'), 'Rust Lang', 'https://www.rust-lang.org', 'Official Rust programming language', 9, 'Rust documentation and resources', 'USA', '/logos/rust.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'developer-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'cpp'), 'C++ Reference', 'https://en.cppreference.com', 'C++ documentation and reference', 9, 'C++ language reference', 'USA', '/logos/cpp.png', 0, DATE('now'), 'admin';

-- Gaming Websites
INSERT OR IGNORE INTO reliable_websites (subcategory_id, sub_subcategory_id, name, url, description, reliability_score, notes, country, logo_url, is_featured, last_verified, verified_by)
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'consoles'), 'PlayStation', 'https://www.playstation.com', 'Official PlayStation store', 9, 'PlayStation consoles and games', 'USA', '/logos/playstation.png', 1, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'consoles'), 'Xbox', 'https://www.xbox.com', 'Official Xbox store', 9, 'Xbox consoles and games', 'USA', '/logos/xbox.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'consoles'), 'Nintendo', 'https://www.nintendo.com', 'Official Nintendo store', 9, 'Nintendo Switch and games', 'USA', '/logos/nintendo.png', 0, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'pc-games'), 'Steam', 'https://store.steampowered.com', 'PC gaming platform', 9, 'Largest PC game store', 'USA', '/logos/steam.png', 1, DATE('now'), 'admin'
UNION ALL
SELECT (SELECT id FROM reliable_subcategories WHERE slug = 'gaming-technology'), (SELECT id FROM reliable_sub_subcategories WHERE slug = 'pc-games'), 'Epic Games', 'https://www.epicgames.com/store', 'Epic Games Store', 8, 'PC game store', 'USA', '/logos/epic.png', 0, DATE('now'), 'admin';