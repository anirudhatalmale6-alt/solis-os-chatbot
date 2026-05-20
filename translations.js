const translations = {
  en: {
    menu: () => `Reply with a number:\n\n1. Features\n2. Pricing\n3. Industries\n4. Get started\n5. Demo\n6. Bookings\n7. AI tools\n8. Support\n9. Talk to a human\n\n_We speak your language - just write in any language!_`,
    welcome: (name) => `Hi ${name}! Welcome to Solis OS.\n\nI'm here to help you learn about our AI-powered business management platform. We help salons, clinics, garages, and other service businesses automate their operations.\n\nWhat would you like to know?\n\n1. What Solis OS does\n2. Pricing plans\n3. Industries we support\n4. How to get started\n5. Book a demo\n6. Bookings\n7. AI tools\n8. Support\n9. Talk to a human\n\n_We speak your language - just write in any language!_\n\nJust type a number!`,
    welcomeWithAnswer: (name, answer) => `Hi ${name}! Welcome to Solis OS.\n\n${answer}`,
    welcomeGeneric: (name) => `Hi ${name}! Welcome to Solis OS, the AI-powered platform that helps service businesses manage bookings, customers, staff, and more.\n\nHow can I help you today?\n\n1. Features\n2. Pricing\n3. Industries\n4. Get started\n5. Demo\n6. Bookings\n7. AI tools\n8. Support\n9. Talk to a human\n\n_We speak your language - just write in any language!_\n\nJust type a number!`,
    fallback: (name) => `Thanks for your message, ${name}. I want to make sure I give you the right answer.\n\nPlease reply with a number:\n\n1. Features\n2. Pricing\n3. Industries\n4. Get started\n5. Demo\n6. Bookings\n7. AI tools\n8. Support\n9. Talk to a human\n\n_We speak your language - just write in any language!_`,
    features: (name) => `Great question, ${name}! Here's what Solis OS does:\n\nSolis OS is an all-in-one AI platform that runs your business operations:\n\nBookings & Scheduling - Online booking page your customers can use 24/7. Automatic confirmations and reminders.\n\nCustomer Management - Full CRM to track all your clients, their history, preferences, and notes.\n\nStaff Management - Manage your team, assign roles, track availability and performance.\n\nAI Insights - Smart analytics that tell you what's working, predict busy periods, and suggest improvements.\n\nAutomated Communications - WhatsApp and email notifications sent automatically to your customers.\n\nBusiness Analytics - Real-time dashboard showing revenue, bookings, customer trends, and more.\n\nWould you like to know about pricing, or ready to start your free trial?`,
    pricing: (name) => `Simple pricing, ${name}:\n\nSolis OS - $29/month\n\nEverything included:\n- Unlimited bookings & customers\n- AI WhatsApp Assistant\n- Staff management\n- Invoicing & expenses\n- Analytics & reports\n- Marketing tools\n- Online booking page\n\n14-day free trial, no credit card required.\n\nReady to get started? Visit https://app.solis-os.com/signup`,
    industries: (name) => `Solis OS is built for service-based businesses, ${name}. Here are the industries we serve:\n\nHair Salons & Barbershops - Appointment booking, stylist scheduling, client preferences\n\nBeauty & Spa - Treatment bookings, package management, customer history\n\nMedical & Dental Clinics - Patient scheduling, practitioner management, appointment reminders\n\nAuto Garages & Workshops - Job booking, mechanic assignments, service tracking\n\nFitness & Gyms - Class scheduling, trainer management, member bookings\n\nAnd many more - Any business that takes appointments or manages services can use Solis OS.\n\nThe platform adapts to your industry automatically during setup. What type of business do you run?`,
    getStarted: (name) => `Getting started is easy, ${name}! Here's how:\n\nStep 1 - Visit https://app.solis-os.com/signup and create your account (takes 30 seconds)\n\nStep 2 - Set up your business profile (name, industry, location, hours)\n\nStep 3 - Add your services and pricing\n\nStep 4 - Add your team members\n\nStep 5 - Share your booking page with customers\n\nThat's it! The whole setup takes about 5 minutes. Your AI-powered booking page goes live immediately.\n\nNo credit card required to start. You can explore everything for free.\n\nStart now: https://app.solis-os.com/signup`,
    demo: (name) => `I'd love to show you around, ${name}!\n\nYou can explore Solis OS right now:\n\n1. Visit our website to see what we offer: https://solis-os.com\n\n2. Sign up for a free trial and explore the full platform yourself: https://app.solis-os.com/signup\n\n3. If you'd like a personal walkthrough with our team, reply with "speak to someone" and we'll arrange a time that works for you.\n\nWhat would you prefer?`,
    trial: (name) => `Yes, ${name}! We offer a free trial with full access to all features.\n\nNo credit card required. No commitments. Just sign up and start using it.\n\nStart your free trial here: https://app.solis-os.com/signup\n\nTakes less than a minute to set up!`,
    human: (name) => `Of course, ${name}! I'll make sure someone from our team gets back to you shortly.\n\nA team member will reach out to you on this number within a few hours. Thank you for your patience!`,
    thanks: (name) => `You're welcome, ${name}! Happy to help.\n\nIf you have any more questions, just message us here anytime.\n\nReady to get started? https://app.solis-os.com/signup`,
    bye: (name) => `It was great chatting with you, ${name}! If you ever need anything, just message us here anytime.\n\nHave a wonderful day!`,
    yes: (name) => `Great! Here's what I'd suggest, ${name}:\n\n1. Start your free trial at https://app.solis-os.com/signup - takes 2 minutes, no card needed\n2. Set up your business profile, services, and team\n3. Share your booking page with customers right away\n\nOr if you'd like a personal walkthrough first, just say "demo" and I'll arrange one for you.\n\nWhat would you prefer?`,
    nonText: "Thanks for reaching out! I can best assist you with text messages. Feel free to type your question and I'll help you right away.",
    ai: (name) => `AI is at the heart of Solis OS, ${name}. Here's how it helps your business:\n\nSmart Scheduling - AI learns your busy patterns and optimizes appointment slots to maximize your bookings.\n\nCustomer Insights - Understands customer behavior, predicts no-shows, and suggests the best times to reach out.\n\nRevenue Optimization - Identifies your most profitable services and suggests pricing improvements.\n\nAutomated Follow-ups - Sends perfectly timed reminders and follow-ups to reduce no-shows by up to 80%.\n\nIt's like having a business consultant working for you 24/7.\n\nWant to see it in action? Sign up free: https://app.solis-os.com/signup`,
    support: (name) => `I'm here to help, ${name}!\n\nFor quick answers, you can ask me anything about Solis OS right here.\n\nIf you need technical support, just reply with "speak to someone" and we'll get a team member to help you.\n\nWhat do you need help with?`,
    booking: (name) => `Solis OS makes booking management effortless, ${name}!\n\nOnline Booking Page - Your customers can book 24/7 from their phone or computer.\n\nSmart Calendar - See all your appointments in one place.\n\nAutomatic Reminders - Customers get reminders before their appointment. Reduces no-shows by up to 80%.\n\nEasy Rescheduling - Customers can reschedule themselves.\n\nWould you like to set up your booking page? It's free to start: https://app.solis-os.com/signup`,
    security: (name) => `Security is a top priority at Solis OS, ${name}.\n\nYour data is protected with:\n- End-to-end encryption\n- Secure cloud hosting with automatic backups\n- Role-based access control\n- GDPR-compliant data handling\n\nYour customers' information is safe with us.`,
    app: (name) => `Solis OS works on all devices, ${name}!\n\nMobile - Works like a native app from your phone browser.\n\nDesktop - Full dashboard at https://app.solis-os.com\n\nTablet - Perfect for reception desks.\n\nDownload now:\n\nApp Store: https://apps.apple.com/app/solis-os/id6745498032\nGoogle Play: https://play.google.com/store/apps/details?id=com.solisos\n\nStart using Solis OS now: https://app.solis-os.com/signup`,
    language: (name) => `Solis OS supports multiple languages, ${name}!\n\nOur platform and chatbot work in:\n- English\n- Arabic\n- French\n- Spanish\n- German\n- Italian\n- Portuguese\n- Greek\n- Chinese\n- Japanese\n- Korean\n\nThe chatbot automatically detects your language and responds accordingly. Just write in your preferred language and I'll reply in the same language!\n\nThe app interface also supports multiple languages. Would you like to know anything else?`
  },

  ar: {
    menu: () => `اكتب رقم:\n\n1. المميزات\n2. الأسعار\n3. القطاعات\n4. كيف تبدأ\n5. عرض توضيحي\n6. الحجوزات\n7. الذكاء الاصطناعي\n8. الدعم\n9. تحدث مع شخص\n\n_نتحدث بلغتك - اكتب بأي لغة تريد!_`,
    welcome: (name) => `مرحبا ${name}! أهلا بك في Solis OS.\n\nأنا هنا لمساعدتك في التعرف على منصتنا لإدارة الأعمال بالذكاء الاصطناعي.\n\nبماذا يمكنني مساعدتك؟\n\n1. المميزات\n2. الأسعار\n3. القطاعات\n4. كيف تبدأ\n5. عرض توضيحي\n6. الحجوزات\n7. الذكاء الاصطناعي\n8. الدعم\n9. تحدث مع شخص\n\n_نتحدث بلغتك - اكتب بأي لغة تريد!_\n\nاكتب رقم!`,
    welcomeWithAnswer: (name, answer) => `مرحبا ${name}! أهلا بك في Solis OS.\n\n${answer}`,
    welcomeGeneric: (name) => `مرحبا ${name}! أهلا بك في Solis OS، المنصة الذكية التي تساعد الأعمال الخدمية في إدارة الحجوزات والعملاء والموظفين.\n\n1. المميزات\n2. الأسعار\n3. القطاعات\n4. كيف تبدأ\n5. عرض توضيحي\n6. الحجوزات\n7. الذكاء الاصطناعي\n8. الدعم\n9. تحدث مع شخص\n\n_نتحدث بلغتك - اكتب بأي لغة تريد!_\n\nاكتب رقم!`,
    fallback: (name) => `شكرا لرسالتك ${name}.\n\nاكتب رقم:\n\n1. المميزات\n2. الأسعار\n3. القطاعات\n4. كيف تبدأ\n5. عرض توضيحي\n6. الحجوزات\n7. الذكاء الاصطناعي\n8. الدعم\n9. تحدث مع شخص\n\n_نتحدث بلغتك - اكتب بأي لغة تريد!_`,
    features: (name) => `سؤال ممتاز ${name}! إليك ما يقدمه Solis OS:\n\nالحجوزات - صفحة حجز أونلاين لعملائك تعمل 24/7\n\nإدارة العملاء - نظام CRM كامل لتتبع جميع عملائك\n\nإدارة الموظفين - إدارة فريقك وتعيين الأدوار\n\nالذكاء الاصطناعي - تحليلات ذكية وتوصيات لتحسين عملك\n\nالتواصل التلقائي - إشعارات واتساب وبريد إلكتروني تلقائية\n\nلوحة تحكم - بيانات مباشرة عن الإيرادات والحجوزات\n\nهل تريد معرفة الأسعار أو البدء بالتجربة المجانية؟`,
    pricing: (name) => `السعر بسيط ${name}:\n\nSolis OS - $29/شهر\n\nكل شيء مشمول:\n- حجوزات وعملاء غير محدودة\n- مساعد واتساب ذكي\n- إدارة الموظفين\n- فواتير ومصاريف\n- تحليلات وتقارير\n- أدوات تسويق\n- صفحة حجز أونلاين\n\nتجربة مجانية 14 يوم بدون بطاقة.\n\nابدأ الآن: https://app.solis-os.com/signup`,
    industries: (name) => `Solis OS مصمم للأعمال الخدمية ${name}:\n\nصالونات الحلاقة والتجميل - حجز المواعيد وجدولة المصممين\n\nالسبا والعناية - إدارة العلاجات والباقات\n\nالعيادات الطبية وطب الأسنان - جدولة المرضى وإدارة الأطباء\n\nورش السيارات - حجز الخدمات وتعيين الميكانيكيين\n\nالصالات الرياضية - جدولة الحصص وإدارة المدربين\n\nوأكثر - أي عمل يحتاج حجوزات يمكنه استخدام Solis OS.\n\nما هو نوع عملك؟`,
    getStarted: (name) => `البدء سهل جدا ${name}!\n\n1. سجل حسابك: https://app.solis-os.com/signup (30 ثانية)\n2. أعد ملف عملك\n3. أضف خدماتك وأسعارك\n4. أضف فريقك\n5. شارك صفحة الحجز مع عملائك\n\nالإعداد يستغرق 5 دقائق فقط. بدون بطاقة ائتمان.\n\nابدأ الآن: https://app.solis-os.com/signup`,
    demo: (name) => `يسعدني أن أريك المنصة ${name}!\n\n1. زر موقعنا: https://solis-os.com\n2. جرب المنصة مجانا: https://app.solis-os.com/signup\n3. أو اكتب "تحدث مع شخص" لترتيب جولة شخصية\n\nماذا تفضل؟`,
    trial: (name) => `نعم ${name}! نوفر تجربة مجانية كاملة.\n\nبدون بطاقة ائتمان. بدون التزام.\n\nابدأ تجربتك: https://app.solis-os.com/signup`,
    human: (name) => `بالتأكيد ${name}! سيتواصل معك أحد أعضاء فريقنا قريبا. شكرا لصبرك!`,
    thanks: (name) => `عفوا ${name}! يسعدني المساعدة.\n\nإذا كان لديك أي أسئلة أخرى، راسلنا في أي وقت.\n\nابدأ الآن: https://app.solis-os.com/signup`,
    bye: (name) => `سعدت بالتحدث معك ${name}! إذا احتجت أي شيء، راسلنا في أي وقت.\n\nأتمنى لك يوما رائعا!`,
    yes: (name) => `ممتاز! إليك اقتراحي ${name}:\n\n1. ابدأ تجربتك المجانية: https://app.solis-os.com/signup\n2. أعد ملف عملك وخدماتك\n3. شارك صفحة الحجز مع عملائك\n\nأو اكتب "عرض" لترتيب جولة شخصية.`,
    nonText: "شكرا للتواصل! يمكنني مساعدتك بشكل أفضل عبر الرسائل النصية. اكتب سؤالك وسأساعدك فورا.",
    ai: (name) => `الذكاء الاصطناعي في قلب Solis OS ${name}:\n\nجدولة ذكية - يتعلم أنماط عملك ويحسن المواعيد\n\nتحليل العملاء - يفهم سلوك العملاء ويتوقع التغيب\n\nتحسين الإيرادات - يحدد خدماتك الأكثر ربحية\n\nمتابعة تلقائية - تذكيرات في الوقت المناسب تقلل التغيب بنسبة 80%\n\nجربه مجانا: https://app.solis-os.com/signup`,
    support: (name) => `أنا هنا للمساعدة ${name}!\n\nاسألني أي شيء عن Solis OS هنا.\n\nللدعم الفني، اكتب "تحدث مع شخص".\n\nبماذا يمكنني مساعدتك؟`,
    booking: (name) => `Solis OS يجعل إدارة الحجوزات سهلة ${name}!\n\nصفحة حجز أونلاين - عملاؤك يحجزون 24/7\n\nتقويم ذكي - كل مواعيدك في مكان واحد\n\nتذكيرات تلقائية - تقلل التغيب بنسبة 80%\n\nإعادة جدولة سهلة - العملاء يعيدون الجدولة بأنفسهم\n\nابدأ مجانا: https://app.solis-os.com/signup`,
    security: (name) => `الأمان أولوية في Solis OS ${name}.\n\nبياناتك محمية بـ:\n- تشفير كامل\n- استضافة سحابية آمنة\n- التحكم بالصلاحيات\n- متوافق مع GDPR\n\nبيانات عملائك آمنة معنا.`,
    app: (name) => `Solis OS يعمل على جميع الأجهزة ${name}!\n\nالجوال - يعمل كتطبيق من متصفح هاتفك\n\nالكمبيوتر - لوحة تحكم كاملة: https://app.solis-os.com\n\nالتابلت - مثالي لمكاتب الاستقبال\n\nحمل الآن:\n\nApp Store: https://apps.apple.com/app/solis-os/id6745498032\nGoogle Play: https://play.google.com/store/apps/details?id=com.solisos\n\nابدأ الآن: https://app.solis-os.com/signup`,
    language: (name) => `Solis OS يدعم عدة لغات ${name}!\n\nمنصتنا والشات بوت يعملان بـ:\n- الإنجليزية\n- العربية\n- الفرنسية\n- الإسبانية\n- الألمانية\n- الإيطالية\n- البرتغالية\n- اليونانية\n- الصينية\n- اليابانية\n- الكورية\n\nالشات بوت يكتشف لغتك تلقائيا ويرد بنفس اللغة! اكتب بلغتك المفضلة وسأرد بها.\n\nهل تريد معرفة أي شيء آخر؟`
  },

  fr: {
    menu: () => `Tapez un numero :\n\n1. Fonctionnalites\n2. Tarifs\n3. Secteurs\n4. Comment demarrer\n5. Demo\n6. Reservations\n7. Outils IA\n8. Support\n9. Parler a quelqu'un\n\n_Nous parlons votre langue - ecrivez dans la langue de votre choix !_`,
    welcome: (name) => `Bonjour ${name} ! Bienvenue chez Solis OS.\n\nNotre plateforme IA aide les salons, cliniques, garages et autres entreprises de services.\n\n1. Fonctionnalites\n2. Tarifs\n3. Secteurs\n4. Comment demarrer\n5. Demo\n6. Reservations\n7. Outils IA\n8. Support\n9. Parler a quelqu'un\n\n_Nous parlons votre langue - ecrivez dans la langue de votre choix !_\n\nTapez un numero !`,
    welcomeWithAnswer: (name, answer) => `Bonjour ${name} ! Bienvenue chez Solis OS.\n\n${answer}`,
    welcomeGeneric: (name) => `Bonjour ${name} ! Bienvenue chez Solis OS, la plateforme IA pour entreprises de services.\n\n1. Fonctionnalites\n2. Tarifs\n3. Secteurs\n4. Comment demarrer\n5. Demo\n6. Reservations\n7. Outils IA\n8. Support\n9. Parler a quelqu'un\n\n_Nous parlons votre langue - ecrivez dans la langue de votre choix !_\n\nTapez un numero !`,
    fallback: (name) => `Merci, ${name}.\n\nTapez un numero :\n\n1. Fonctionnalites\n2. Tarifs\n3. Secteurs\n4. Comment demarrer\n5. Demo\n6. Reservations\n7. Outils IA\n8. Support\n9. Parler a quelqu'un\n\n_Nous parlons votre langue - ecrivez dans la langue de votre choix !_`,
    features: (name) => `Excellente question, ${name} ! Voici ce que fait Solis OS :\n\nReservations - Page de reservation en ligne 24/7\n\nGestion clients - CRM complet pour suivre tous vos clients\n\nGestion equipe - Gerez votre equipe et attribuez des roles\n\nIA - Analyses intelligentes et recommandations\n\nCommunications automatiques - Notifications WhatsApp et email\n\nTableau de bord - Donnees en temps reel\n\nVoulez-vous connaitre nos tarifs ou commencer l'essai gratuit ?`,
    pricing: (name) => `Tarif simple, ${name} :\n\nSolis OS - 29$/mois\n\nTout inclus :\n- Reservations et clients illimites\n- Assistant IA WhatsApp\n- Gestion d'equipe\n- Facturation et depenses\n- Analyses et rapports\n- Outils marketing\n- Page de reservation en ligne\n\nEssai gratuit 14 jours, sans carte.\n\nCommencez : https://app.solis-os.com/signup`,
    industries: (name) => `Solis OS est concu pour les entreprises de services, ${name} :\n\nSalons de coiffure - Reservations et planning des stylistes\n\nBeaute & Spa - Gestion des soins et forfaits\n\nCliniques medicales & dentaires - Planning des patients\n\nGarages automobiles - Reservations et suivi des reparations\n\nSalles de sport - Planning des cours et des coachs\n\nQuel est votre type d'entreprise ?`,
    getStarted: (name) => `C'est facile de commencer, ${name} !\n\n1. Creez votre compte : https://app.solis-os.com/signup\n2. Configurez votre profil\n3. Ajoutez vos services\n4. Ajoutez votre equipe\n5. Partagez votre page de reservation\n\nEn 5 minutes c'est pret ! Sans carte bancaire.\n\nCommencez : https://app.solis-os.com/signup`,
    demo: (name) => `Avec plaisir, ${name} !\n\n1. Visitez notre site : https://solis-os.com\n2. Essayez gratuitement : https://app.solis-os.com/signup\n3. Ou tapez "parler a quelqu'un" pour une demo personnalisee`,
    trial: (name) => `Oui, ${name} ! Essai gratuit avec acces complet.\n\nSans carte bancaire. Sans engagement.\n\nCommencez : https://app.solis-os.com/signup`,
    human: (name) => `Bien sur, ${name} ! Un membre de notre equipe vous contactera bientot. Merci de votre patience !`,
    thanks: (name) => `De rien, ${name} ! Ravi de vous aider.\n\nN'hesitez pas a nous ecrire.\n\nCommencez : https://app.solis-os.com/signup`,
    bye: (name) => `Ravi d'avoir discute avec vous, ${name} ! N'hesitez pas a revenir.\n\nBonne journee !`,
    yes: (name) => `Super ! Voici ce que je suggere, ${name} :\n\n1. Essai gratuit : https://app.solis-os.com/signup\n2. Configurez votre entreprise\n3. Partagez votre page de reservation\n\nOu tapez "demo" pour une visite guidee.`,
    nonText: "Merci de nous contacter ! Je peux mieux vous aider par texte. Tapez votre question !",
    ai: (name) => `L'IA est au coeur de Solis OS, ${name} :\n\nPlanification intelligente - Optimise vos creneaux\n\nAnalyse clients - Predit les absences\n\nOptimisation revenus - Identifie vos services les plus rentables\n\nSuivis automatiques - Reduit les absences de 80%\n\nEssayez : https://app.solis-os.com/signup`,
    support: (name) => `Je suis la pour vous aider, ${name} !\n\nPosez-moi n'importe quelle question ici.\n\nPour le support technique, tapez "parler a quelqu'un".`,
    booking: (name) => `Solis OS simplifie les reservations, ${name} !\n\nPage de reservation 24/7\nCalendrier intelligent\nRappels automatiques (-80% d'absences)\nReprogrammation facile\n\nCommencez : https://app.solis-os.com/signup`,
    security: (name) => `La securite est une priorite, ${name}.\n\n- Chiffrement complet\n- Hebergement securise\n- Controle des acces\n- Conforme RGPD`,
    app: (name) => `Solis OS fonctionne partout, ${name} !\n\nMobile, Desktop, Tablette.\n\nTelechargez maintenant :\n\nApp Store: https://apps.apple.com/app/solis-os/id6745498032\nGoogle Play: https://play.google.com/store/apps/details?id=com.solisos\n\nCommencez : https://app.solis-os.com/signup`,
    language: (name) => `Solis OS supporte plusieurs langues, ${name} !\n\nNotre plateforme et chatbot fonctionnent en :\nAnglais, Arabe, Francais, Espagnol, Allemand, Italien, Portugais, Grec, Chinois, Japonais, Coreen\n\nLe chatbot detecte automatiquement votre langue et repond dans la meme langue !\n\nVoulez-vous savoir autre chose ?`
  },

  es: {
    menu: () => `Escribe un numero:\n\n1. Funcionalidades\n2. Precios\n3. Industrias\n4. Como empezar\n5. Demo\n6. Reservas\n7. Herramientas IA\n8. Soporte\n9. Hablar con alguien\n\n_Hablamos tu idioma - escribe en cualquier idioma!_`,
    welcome: (name) => `Hola ${name}! Bienvenido a Solis OS.\n\nPlataforma IA para salones, clinicas, talleres y negocios de servicios.\n\n1. Funcionalidades\n2. Precios\n3. Industrias\n4. Como empezar\n5. Demo\n6. Reservas\n7. Herramientas IA\n8. Soporte\n9. Hablar con alguien\n\n_Hablamos tu idioma - escribe en cualquier idioma!_\n\nEscribe un numero!`,
    welcomeWithAnswer: (name, answer) => `Hola ${name}! Bienvenido a Solis OS.\n\n${answer}`,
    welcomeGeneric: (name) => `Hola ${name}! Bienvenido a Solis OS.\n\n1. Funcionalidades\n2. Precios\n3. Industrias\n4. Como empezar\n5. Demo\n6. Reservas\n7. Herramientas IA\n8. Soporte\n9. Hablar con alguien\n\n_Hablamos tu idioma - escribe en cualquier idioma!_\n\nEscribe un numero!`,
    fallback: (name) => `Gracias, ${name}.\n\nEscribe un numero:\n\n1. Funcionalidades\n2. Precios\n3. Industrias\n4. Como empezar\n5. Demo\n6. Reservas\n7. Herramientas IA\n8. Soporte\n9. Hablar con alguien\n\n_Hablamos tu idioma - escribe en cualquier idioma!_`,
    features: (name) => `Excelente pregunta, ${name}! Esto es lo que hace Solis OS:\n\nReservas - Pagina de reservas online 24/7\n\nGestion de clientes - CRM completo\n\nGestion de equipo - Administra roles y disponibilidad\n\nIA - Analiticas inteligentes y recomendaciones\n\nComunicaciones automaticas - WhatsApp y email\n\nPanel de control - Datos en tiempo real\n\nQuieres conocer los precios o empezar la prueba gratis?`,
    pricing: (name) => `Precio simple, ${name}:\n\nSolis OS - $29/mes\n\nTodo incluido:\n- Reservas y clientes ilimitados\n- Asistente IA WhatsApp\n- Gestion de equipo\n- Facturacion y gastos\n- Analisis y reportes\n- Herramientas de marketing\n- Pagina de reservas online\n\nPrueba gratis 14 dias, sin tarjeta.\n\nEmpieza: https://app.solis-os.com/signup`,
    industries: (name) => `Solis OS esta hecho para negocios de servicios, ${name}:\n\nSalones de belleza y barberias\nSpa y estetica\nClinicas medicas y dentales\nTalleres mecanicos\nGimnasios y fitness\n\nCualquier negocio con citas puede usar Solis OS.\n\nQue tipo de negocio tienes?`,
    getStarted: (name) => `Empezar es facil, ${name}!\n\n1. Crea tu cuenta: https://app.solis-os.com/signup\n2. Configura tu perfil\n3. Agrega tus servicios\n4. Agrega tu equipo\n5. Comparte tu pagina de reservas\n\nEn 5 minutos esta listo. Sin tarjeta de credito.\n\nEmpieza: https://app.solis-os.com/signup`,
    demo: (name) => `Con gusto, ${name}!\n\n1. Visita nuestro sitio: https://solis-os.com\n2. Prueba gratis: https://app.solis-os.com/signup\n3. O escribe "hablar con alguien" para una demo personalizada`,
    trial: (name) => `Si, ${name}! Prueba gratis con acceso completo.\n\nSin tarjeta. Sin compromiso.\n\nEmpieza: https://app.solis-os.com/signup`,
    human: (name) => `Claro, ${name}! Alguien de nuestro equipo te contactara pronto. Gracias por tu paciencia!`,
    thanks: (name) => `De nada, ${name}! Encantado de ayudar.\n\nSi tienes mas preguntas, escribenos.\n\nEmpieza: https://app.solis-os.com/signup`,
    bye: (name) => `Fue un placer, ${name}! Si necesitas algo, escribenos.\n\nQue tengas un excelente dia!`,
    yes: (name) => `Genial! Te sugiero, ${name}:\n\n1. Prueba gratis: https://app.solis-os.com/signup\n2. Configura tu negocio\n3. Comparte tu pagina de reservas\n\nO escribe "demo" para una visita guiada.`,
    nonText: "Gracias por contactarnos! Puedo ayudarte mejor por texto. Escribe tu pregunta!",
    ai: (name) => `La IA esta en el corazon de Solis OS, ${name}:\n\nAgenda inteligente - Optimiza tus horarios\n\nAnalisis de clientes - Predice ausencias\n\nOptimizacion de ingresos - Identifica servicios mas rentables\n\nSeguimientos automaticos - Reduce ausencias un 80%\n\nPruebalo: https://app.solis-os.com/signup`,
    support: (name) => `Estoy aqui para ayudarte, ${name}!\n\nPreguntame lo que quieras aqui.\n\nPara soporte tecnico, escribe "hablar con alguien".`,
    booking: (name) => `Solis OS simplifica las reservas, ${name}!\n\nPagina de reservas 24/7\nCalendario inteligente\nRecordatorios automaticos\nReprogramacion facil\n\nEmpieza: https://app.solis-os.com/signup`,
    security: (name) => `La seguridad es prioridad, ${name}.\n\n- Encriptacion completa\n- Hosting seguro\n- Control de accesos\n- Cumple con GDPR`,
    app: (name) => `Solis OS funciona en todos los dispositivos, ${name}!\n\nMovil, Desktop, Tablet.\n\nApps nativas proximamente!\n\nEmpieza: https://app.solis-os.com/signup`,
    language: (name) => `Solis OS soporta varios idiomas, ${name}!\n\nNuestra plataforma y chatbot funcionan en:\nIngles, Arabe, Frances, Espanol, Aleman, Italiano, Portugues, Griego, Chino, Japones, Coreano\n\nEl chatbot detecta tu idioma automaticamente y responde en el mismo idioma!\n\nQuieres saber algo mas?`
  },

  de: {
    menu: () => `Tippe eine Nummer:\n\n1. Funktionen\n2. Preise\n3. Branchen\n4. Loslegen\n5. Demo\n6. Buchungen\n7. KI-Tools\n8. Support\n9. Mit jemandem sprechen\n\n_Wir sprechen deine Sprache - schreib einfach in deiner Sprache!_`,
    welcome: (name) => `Hallo ${name}! Willkommen bei Solis OS.\n\nKI-Plattform fuer Salons, Kliniken, Werkstaetten und Dienstleistungsunternehmen.\n\n1. Funktionen\n2. Preise\n3. Branchen\n4. Loslegen\n5. Demo\n6. Buchungen\n7. KI-Tools\n8. Support\n9. Mit jemandem sprechen\n\n_Wir sprechen deine Sprache - schreib einfach in deiner Sprache!_\n\nTippe eine Nummer!`,
    welcomeWithAnswer: (name, answer) => `Hallo ${name}! Willkommen bei Solis OS.\n\n${answer}`,
    welcomeGeneric: (name) => `Hallo ${name}! Willkommen bei Solis OS.\n\n1. Funktionen\n2. Preise\n3. Branchen\n4. Loslegen\n5. Demo\n6. Buchungen\n7. KI-Tools\n8. Support\n9. Mit jemandem sprechen\n\n_Wir sprechen deine Sprache - schreib einfach in deiner Sprache!_\n\nTippe eine Nummer!`,
    fallback: (name) => `Danke, ${name}.\n\nTippe eine Nummer:\n\n1. Funktionen\n2. Preise\n3. Branchen\n4. Loslegen\n5. Demo\n6. Buchungen\n7. KI-Tools\n8. Support\n9. Mit jemandem sprechen\n\n_Wir sprechen deine Sprache - schreib einfach in deiner Sprache!_`,
    features: (name) => `Tolle Frage, ${name}! Das kann Solis OS:\n\nTermine & Buchungen - Online-Buchungsseite, die deine Kunden rund um die Uhr nutzen koennen.\n\nKundenverwaltung - Vollstaendiges CRM fuer alle deine Kunden.\n\nTeamverwaltung - Verwalte dein Team, weise Rollen zu.\n\nKI-Einblicke - Intelligente Analysen und Verbesserungsvorschlaege.\n\nAutomatische Kommunikation - WhatsApp- und E-Mail-Benachrichtigungen.\n\nDashboard - Echtzeit-Daten zu Umsatz und Buchungen.\n\nMoechtest du die Preise erfahren oder deine kostenlose Testphase starten?`,
    pricing: (name) => `Einfache Preisgestaltung, ${name}:\n\nSolis OS - $29/Monat\n\nAlles inklusive:\n- Unbegrenzte Buchungen & Kunden\n- KI WhatsApp-Assistent\n- Teamverwaltung\n- Rechnungen & Ausgaben\n- Analysen & Berichte\n- Marketing-Tools\n- Online-Buchungsseite\n\n14 Tage kostenlos testen, ohne Kreditkarte.\n\nJetzt starten: https://app.solis-os.com/signup`,
    industries: (name) => `Solis OS ist fuer Dienstleistungsunternehmen gebaut, ${name}:\n\nFriseure & Barbershops - Terminbuchung und Stylistenplanung\n\nBeauty & Spa - Behandlungsbuchungen und Paketmanagement\n\nArztpraxen & Zahnaerzte - Patientenplanung und Terminerinnerungen\n\nKfz-Werkstaetten - Auftragsbuchung und Mechanikerplanung\n\nFitness & Gyms - Kursplanung und Trainerverwaltung\n\nUnd viele mehr. Welche Art von Unternehmen fuehrst du?`,
    getStarted: (name) => `Der Einstieg ist ganz einfach, ${name}!\n\n1. Erstelle dein Konto: https://app.solis-os.com/signup (30 Sekunden)\n2. Richte dein Unternehmensprofil ein\n3. Fuege deine Dienstleistungen hinzu\n4. Fuege dein Team hinzu\n5. Teile deine Buchungsseite mit Kunden\n\nIn 5 Minuten bist du startklar. Keine Kreditkarte noetig.\n\nJetzt starten: https://app.solis-os.com/signup`,
    demo: (name) => `Gerne zeige ich dir alles, ${name}!\n\n1. Besuche unsere Website: https://solis-os.com\n2. Teste die Plattform kostenlos: https://app.solis-os.com/signup\n3. Oder schreib "mit jemandem sprechen" fuer eine persoenliche Fuehrung`,
    trial: (name) => `Ja, ${name}! Wir bieten eine kostenlose Testphase mit vollem Zugang.\n\nKeine Kreditkarte. Keine Verpflichtung.\n\nJetzt starten: https://app.solis-os.com/signup`,
    human: (name) => `Natuerlich, ${name}! Ein Teammitglied wird sich in Kuerze bei dir melden. Danke fuer deine Geduld!`,
    thanks: (name) => `Gerne, ${name}! Freut mich, dass ich helfen konnte.\n\nBei weiteren Fragen schreib uns jederzeit.\n\nJetzt starten: https://app.solis-os.com/signup`,
    bye: (name) => `Es war schoen, mit dir zu plaudern, ${name}! Meld dich jederzeit, wenn du etwas brauchst.\n\nEinen schoenen Tag noch!`,
    yes: (name) => `Super! Das wuerde ich empfehlen, ${name}:\n\n1. Kostenlose Testphase starten: https://app.solis-os.com/signup\n2. Unternehmen und Services einrichten\n3. Buchungsseite mit Kunden teilen\n\nOder schreib "Demo" fuer eine Fuehrung.`,
    nonText: "Danke fuer deine Nachricht! Ich kann dir am besten per Text helfen. Schreib einfach deine Frage!",
    ai: (name) => `KI ist das Herzsueck von Solis OS, ${name}:\n\nIntelligente Planung - Optimiert deine Terminslots.\n\nKundenanalyse - Erkennt Verhaltensmuster und sagt Ausfaelle vorher.\n\nUmsatzoptimierung - Findet deine profitabelsten Services.\n\nAutomatische Nachverfolgung - Reduziert Ausfaelle um bis zu 80%.\n\nJetzt testen: https://app.solis-os.com/signup`,
    support: (name) => `Ich bin hier, um zu helfen, ${name}!\n\nFrag mich hier alles zu Solis OS.\n\nFuer technischen Support schreib "mit jemandem sprechen".`,
    booking: (name) => `Solis OS macht die Terminverwaltung kinderleicht, ${name}!\n\nOnline-Buchungsseite - Deine Kunden buchen rund um die Uhr.\n\nSmarter Kalender - Alle Termine auf einen Blick.\n\nAutomatische Erinnerungen - Bis zu 80% weniger Ausfaelle.\n\nEinfaches Umbuchen - Kunden buchen selbst um.\n\nKostenlos starten: https://app.solis-os.com/signup`,
    security: (name) => `Sicherheit hat bei Solis OS hoechste Prioritaet, ${name}.\n\n- End-to-End-Verschluesselung\n- Sicheres Cloud-Hosting\n- Rollenbasierte Zugriffskontrolle\n- DSGVO-konform`,
    app: (name) => `Solis OS funktioniert auf allen Geraeten, ${name}!\n\nMobil, Desktop, Tablet.\n\nJetzt herunterladen:\n\nApp Store: https://apps.apple.com/app/solis-os/id6745498032\nGoogle Play: https://play.google.com/store/apps/details?id=com.solisos\n\nJetzt starten: https://app.solis-os.com/signup`,
    language: (name) => `Solis OS unterstuetzt mehrere Sprachen, ${name}!\n\nUnsere Plattform und der Chatbot funktionieren in:\nEnglisch, Arabisch, Franzoesisch, Spanisch, Deutsch, Italienisch, Portugiesisch, Griechisch, Chinesisch, Japanisch, Koreanisch\n\nDer Chatbot erkennt deine Sprache automatisch und antwortet in der gleichen Sprache!\n\nMoechtest du noch etwas wissen?`
  },

  it: {
    menu: () => `Scrivi un numero:\n\n1. Funzionalita\n2. Prezzi\n3. Settori\n4. Come iniziare\n5. Demo\n6. Prenotazioni\n7. Strumenti IA\n8. Supporto\n9. Parlare con qualcuno\n\n_Parliamo la tua lingua - scrivi nella lingua che preferisci!_`,
    welcome: (name) => `Ciao ${name}! Benvenuto su Solis OS.\n\nPiattaforma IA per saloni, cliniche, officine e attivita di servizi.\n\n1. Funzionalita\n2. Prezzi\n3. Settori\n4. Come iniziare\n5. Demo\n6. Prenotazioni\n7. Strumenti IA\n8. Supporto\n9. Parlare con qualcuno\n\n_Parliamo la tua lingua - scrivi nella lingua che preferisci!_\n\nScrivi un numero!`,
    welcomeWithAnswer: (name, answer) => `Ciao ${name}! Benvenuto su Solis OS.\n\n${answer}`,
    welcomeGeneric: (name) => `Ciao ${name}! Benvenuto su Solis OS.\n\n1. Funzionalita\n2. Prezzi\n3. Settori\n4. Come iniziare\n5. Demo\n6. Prenotazioni\n7. Strumenti IA\n8. Supporto\n9. Parlare con qualcuno\n\n_Parliamo la tua lingua - scrivi nella lingua che preferisci!_\n\nScrivi un numero!`,
    fallback: (name) => `Grazie, ${name}.\n\nScrivi un numero:\n\n1. Funzionalita\n2. Prezzi\n3. Settori\n4. Come iniziare\n5. Demo\n6. Prenotazioni\n7. Strumenti IA\n8. Supporto\n9. Parlare con qualcuno\n\n_Parliamo la tua lingua - scrivi nella lingua che preferisci!_`,
    features: (name) => `Ottima domanda, ${name}! Ecco cosa fa Solis OS:\n\nPrenotazioni - Pagina di prenotazione online attiva 24/7.\n\nGestione clienti - CRM completo per seguire tutti i tuoi clienti.\n\nGestione team - Gestisci il tuo team e assegna i ruoli.\n\nIA - Analisi intelligenti e suggerimenti per migliorare.\n\nComunicazioni automatiche - Notifiche WhatsApp e email.\n\nDashboard - Dati in tempo reale su fatturato e prenotazioni.\n\nVuoi conoscere i prezzi o iniziare la prova gratuita?`,
    pricing: (name) => `Prezzo semplice, ${name}:\n\nSolis OS - $29/mese\n\nTutto incluso:\n- Prenotazioni e clienti illimitati\n- Assistente IA WhatsApp\n- Gestione team\n- Fatturazione e spese\n- Analisi e report\n- Strumenti marketing\n- Pagina di prenotazione online\n\nProva gratuita 14 giorni, senza carta.\n\nInizia: https://app.solis-os.com/signup`,
    industries: (name) => `Solis OS e fatto per le attivita di servizi, ${name}:\n\nParrucchieri e barbieri - Prenotazioni e pianificazione stilisti\n\nBellezza e spa - Gestione trattamenti e pacchetti\n\nStudi medici e dentistici - Pianificazione pazienti\n\nOfficine auto - Prenotazioni e assegnazione meccanici\n\nPalestre e fitness - Pianificazione corsi e istruttori\n\nQualsiasi attivita con appuntamenti puo usare Solis OS.\n\nChe tipo di attivita hai?`,
    getStarted: (name) => `Iniziare e facilissimo, ${name}!\n\n1. Crea il tuo account: https://app.solis-os.com/signup (30 secondi)\n2. Configura il profilo della tua attivita\n3. Aggiungi i tuoi servizi\n4. Aggiungi il tuo team\n5. Condividi la pagina di prenotazione\n\nIn 5 minuti sei operativo. Nessuna carta di credito.\n\nInizia ora: https://app.solis-os.com/signup`,
    demo: (name) => `Con piacere, ${name}!\n\n1. Visita il nostro sito: https://solis-os.com\n2. Prova gratis: https://app.solis-os.com/signup\n3. Oppure scrivi "parlare con qualcuno" per una demo personalizzata`,
    trial: (name) => `Si, ${name}! Offriamo una prova gratuita con accesso completo.\n\nNessuna carta. Nessun impegno.\n\nInizia: https://app.solis-os.com/signup`,
    human: (name) => `Certo, ${name}! Un membro del nostro team ti contattara a breve. Grazie per la pazienza!`,
    thanks: (name) => `Prego, ${name}! Felice di aver aiutato.\n\nPer qualsiasi altra domanda, scrivici quando vuoi.\n\nInizia: https://app.solis-os.com/signup`,
    bye: (name) => `E stato un piacere, ${name}! Se hai bisogno di qualcosa, scrivici.\n\nBuona giornata!`,
    yes: (name) => `Perfetto! Ecco cosa ti consiglio, ${name}:\n\n1. Inizia la prova gratuita: https://app.solis-os.com/signup\n2. Configura la tua attivita e i servizi\n3. Condividi la pagina di prenotazione\n\nOppure scrivi "demo" per un tour guidato.`,
    nonText: "Grazie per averci contattato! Posso aiutarti meglio via testo. Scrivi la tua domanda!",
    ai: (name) => `L'IA e il cuore di Solis OS, ${name}:\n\nPianificazione intelligente - Ottimizza i tuoi slot.\n\nAnalisi clienti - Prevede le assenze.\n\nOttimizzazione ricavi - Trova i servizi piu redditizi.\n\nFollow-up automatici - Riduce le assenze fino all'80%.\n\nProvalo: https://app.solis-os.com/signup`,
    support: (name) => `Sono qui per aiutarti, ${name}!\n\nChiedimi qualsiasi cosa su Solis OS.\n\nPer supporto tecnico, scrivi "parlare con qualcuno".`,
    booking: (name) => `Solis OS rende la gestione prenotazioni semplicissima, ${name}!\n\nPagina di prenotazione 24/7\nCalendario intelligente\nPromemoria automatici (-80% assenze)\nRiprogrammazione facile\n\nInizia gratis: https://app.solis-os.com/signup`,
    security: (name) => `La sicurezza e una priorita per Solis OS, ${name}.\n\n- Crittografia end-to-end\n- Hosting cloud sicuro\n- Controllo accessi basato sui ruoli\n- Conforme al GDPR`,
    app: (name) => `Solis OS funziona su tutti i dispositivi, ${name}!\n\nMobile, Desktop, Tablet.\n\nScarica ora:\n\nApp Store: https://apps.apple.com/app/solis-os/id6745498032\nGoogle Play: https://play.google.com/store/apps/details?id=com.solisos\n\nInizia: https://app.solis-os.com/signup`,
    language: (name) => `Solis OS supporta piu lingue, ${name}!\n\nLa nostra piattaforma e chatbot funzionano in:\nInglese, Arabo, Francese, Spagnolo, Tedesco, Italiano, Portoghese, Greco, Cinese, Giapponese, Coreano\n\nIl chatbot rileva automaticamente la tua lingua e risponde nella stessa!\n\nVuoi sapere altro?`
  },

  pt: {
    menu: () => `Digite um numero:\n\n1. Funcionalidades\n2. Precos\n3. Setores\n4. Como comecar\n5. Demo\n6. Agendamentos\n7. Ferramentas IA\n8. Suporte\n9. Falar com alguem\n\n_Falamos a sua lingua - escreva em qualquer idioma!_`,
    welcome: (name) => `Ola ${name}! Bem-vindo ao Solis OS.\n\nPlataforma IA para saloes, clinicas, oficinas e negocios de servicos.\n\n1. Funcionalidades\n2. Precos\n3. Setores\n4. Como comecar\n5. Demo\n6. Agendamentos\n7. Ferramentas IA\n8. Suporte\n9. Falar com alguem\n\n_Falamos a sua lingua - escreva em qualquer idioma!_\n\nDigite um numero!`,
    welcomeWithAnswer: (name, answer) => `Ola ${name}! Bem-vindo ao Solis OS.\n\n${answer}`,
    welcomeGeneric: (name) => `Ola ${name}! Bem-vindo ao Solis OS.\n\n1. Funcionalidades\n2. Precos\n3. Setores\n4. Como comecar\n5. Demo\n6. Agendamentos\n7. Ferramentas IA\n8. Suporte\n9. Falar com alguem\n\n_Falamos a sua lingua - escreva em qualquer idioma!_\n\nDigite um numero!`,
    fallback: (name) => `Obrigado, ${name}.\n\nDigite um numero:\n\n1. Funcionalidades\n2. Precos\n3. Setores\n4. Como comecar\n5. Demo\n6. Agendamentos\n7. Ferramentas IA\n8. Suporte\n9. Falar com alguem\n\n_Falamos a sua lingua - escreva em qualquer idioma!_`,
    features: (name) => `Otima pergunta, ${name}! Veja o que o Solis OS faz:\n\nAgendamentos - Pagina de agendamento online 24/7.\n\nGestao de clientes - CRM completo para acompanhar todos os seus clientes.\n\nGestao de equipe - Gerencie seu time e atribua funcoes.\n\nIA - Analises inteligentes e recomendacoes.\n\nComunicacoes automaticas - Notificacoes via WhatsApp e e-mail.\n\nPainel de controle - Dados em tempo real sobre receita e agendamentos.\n\nQuer saber os precos ou comecar o teste gratuito?`,
    pricing: (name) => `Preco simples, ${name}:\n\nSolis OS - $29/mes\n\nTudo incluso:\n- Agendamentos e clientes ilimitados\n- Assistente IA WhatsApp\n- Gestao de equipe\n- Faturamento e despesas\n- Analises e relatorios\n- Ferramentas de marketing\n- Pagina de agendamento online\n\nTeste gratis 14 dias, sem cartao.\n\nComece: https://app.solis-os.com/signup`,
    industries: (name) => `O Solis OS foi feito para negocios de servicos, ${name}:\n\nSaloes e barbearias - Agendamento e escala de profissionais\n\nBeleza e spa - Gestao de tratamentos e pacotes\n\nClinicas medicas e odontologicas - Agenda de pacientes\n\nOficinas mecanicas - Agendamento e designacao de mecanicos\n\nAcademias e fitness - Agenda de aulas e instrutores\n\nQualquer negocio com agendamentos pode usar o Solis OS.\n\nQual e o seu tipo de negocio?`,
    getStarted: (name) => `Comecar e muito facil, ${name}!\n\n1. Crie sua conta: https://app.solis-os.com/signup (30 segundos)\n2. Configure o perfil do seu negocio\n3. Adicione seus servicos\n4. Adicione sua equipe\n5. Compartilhe a pagina de agendamento\n\nEm 5 minutos voce esta pronto. Sem cartao de credito.\n\nComece agora: https://app.solis-os.com/signup`,
    demo: (name) => `Com prazer, ${name}!\n\n1. Visite nosso site: https://solis-os.com\n2. Teste gratis: https://app.solis-os.com/signup\n3. Ou digite "falar com alguem" para uma demo personalizada`,
    trial: (name) => `Sim, ${name}! Oferecemos teste gratuito com acesso completo.\n\nSem cartao. Sem compromisso.\n\nComece: https://app.solis-os.com/signup`,
    human: (name) => `Claro, ${name}! Um membro da nossa equipe entrara em contato em breve. Obrigado pela paciencia!`,
    thanks: (name) => `De nada, ${name}! Fico feliz em ajudar.\n\nSe tiver mais perguntas, escreva a qualquer momento.\n\nComece: https://app.solis-os.com/signup`,
    bye: (name) => `Foi um prazer conversar, ${name}! Se precisar de algo, escreva para nos.\n\nTenha um otimo dia!`,
    yes: (name) => `Otimo! Sugiro o seguinte, ${name}:\n\n1. Comece o teste gratis: https://app.solis-os.com/signup\n2. Configure seu negocio e servicos\n3. Compartilhe a pagina de agendamento\n\nOu digite "demo" para um tour guiado.`,
    nonText: "Obrigado pelo contato! Posso te ajudar melhor por texto. Digite sua pergunta!",
    ai: (name) => `A IA e o coracao do Solis OS, ${name}:\n\nAgenda inteligente - Otimiza seus horarios.\n\nAnalise de clientes - Preve ausencias.\n\nOtimizacao de receita - Encontra seus servicos mais lucrativos.\n\nAcompanhamento automatico - Reduz ausencias em ate 80%.\n\nExperimente: https://app.solis-os.com/signup`,
    support: (name) => `Estou aqui para ajudar, ${name}!\n\nPergunte qualquer coisa sobre o Solis OS.\n\nPara suporte tecnico, digite "falar com alguem".`,
    booking: (name) => `O Solis OS simplifica o gerenciamento de agendamentos, ${name}!\n\nPagina de agendamento 24/7\nCalendario inteligente\nLembretes automaticos (-80% ausencias)\nReagendamento facil\n\nComece gratis: https://app.solis-os.com/signup`,
    security: (name) => `Seguranca e prioridade no Solis OS, ${name}.\n\n- Criptografia de ponta a ponta\n- Hospedagem em nuvem segura\n- Controle de acesso por funcao\n- Em conformidade com a LGPD/GDPR`,
    app: (name) => `O Solis OS funciona em todos os dispositivos, ${name}!\n\nCelular, Desktop, Tablet.\n\nBaixe agora:\n\nApp Store: https://apps.apple.com/app/solis-os/id6745498032\nGoogle Play: https://play.google.com/store/apps/details?id=com.solisos\n\nComece: https://app.solis-os.com/signup`,
    language: (name) => `O Solis OS suporta varios idiomas, ${name}!\n\nNossa plataforma e chatbot funcionam em:\nIngles, Arabe, Frances, Espanhol, Alemao, Italiano, Portugues, Grego, Chines, Japones, Coreano\n\nO chatbot detecta seu idioma automaticamente e responde no mesmo idioma!\n\nQuer saber mais alguma coisa?`
  },

  el: {
    menu: () => `Γραψε εναν αριθμο:\n\n1. Λειτουργιες\n2. Τιμες\n3. Κλαδοι\n4. Ξεκινα\n5. Demo\n6. Ραντεβου\n7. Εργαλεια AI\n8. Υποστηριξη\n9. Μιληστε με καποιον\n\n_Μιλαμε τη γλωσσα σας - γραψτε σε οποια γλωσσα θελετε!_`,
    welcome: (name) => `Γεια σου ${name}! Καλωσηρθες στο Solis OS.\n\nΠλατφορμα AI για κομμωτηρια, κλινικες, συνεργεια και επιχειρησεις υπηρεσιων.\n\n1. Λειτουργιες\n2. Τιμες\n3. Κλαδοι\n4. Ξεκινα\n5. Demo\n6. Ραντεβου\n7. Εργαλεια AI\n8. Υποστηριξη\n9. Μιληστε με καποιον\n\n_Μιλαμε τη γλωσσα σας - γραψτε σε οποια γλωσσα θελετε!_\n\nΓραψε εναν αριθμο!`,
    welcomeWithAnswer: (name, answer) => `Γεια σου ${name}! Καλωσηρθες στο Solis OS.\n\n${answer}`,
    welcomeGeneric: (name) => `Γεια σου ${name}! Καλωσηρθες στο Solis OS.\n\n1. Λειτουργιες\n2. Τιμες\n3. Κλαδοι\n4. Ξεκινα\n5. Demo\n6. Ραντεβου\n7. Εργαλεια AI\n8. Υποστηριξη\n9. Μιληστε με καποιον\n\n_Μιλαμε τη γλωσσα σας - γραψτε σε οποια γλωσσα θελετε!_\n\nΓραψε εναν αριθμο!`,
    fallback: (name) => `Ευχαριστω, ${name}.\n\nΓραψε εναν αριθμο:\n\n1. Λειτουργιες\n2. Τιμες\n3. Κλαδοι\n4. Ξεκινα\n5. Demo\n6. Ραντεβου\n7. Εργαλεια AI\n8. Υποστηριξη\n9. Μιληστε με καποιον\n\n_Μιλαμε τη γλωσσα σας - γραψτε σε οποια γλωσσα θελετε!_`,
    features: (name) => `Εξαιρετικη ερωτηση, ${name}! Δες τι κανει το Solis OS:\n\nΡαντεβου - Online σελιδα κρατησεων 24/7.\n\nΔιαχειριση πελατων - Πληρες CRM για ολους τους πελατες σου.\n\nΔιαχειριση ομαδας - Διαχειρισου το team σου και αναθεσε ρολους.\n\nAI - Εξυπνες αναλυσεις και προτασεις βελτιωσης.\n\nΑυτοματες ειδοποιησεις - WhatsApp και email.\n\nΠινακας ελεγχου - Δεδομενα σε πραγματικο χρονο.\n\nΘελεις να μαθεις τις τιμες η να ξεκινησεις δωρεαν δοκιμη;`,
    pricing: (name) => `Απλη τιμολογηση, ${name}:\n\nSolis OS - $29/μηνα\n\nΟλα περιλαμβανονται:\n- Απεριοριστα ραντεβου & πελατες\n- AI βοηθος WhatsApp\n- Διαχειριση ομαδας\n- Τιμολογηση & εξοδα\n- Αναλυσεις & αναφορες\n- Εργαλεια marketing\n- Online σελιδα κρατησεων\n\nΔωρεαν δοκιμη 14 ημερων, χωρις καρτα.\n\nΞεκινα: https://app.solis-os.com/signup`,
    industries: (name) => `Το Solis OS ειναι φτιαγμενο για επιχειρησεις υπηρεσιων, ${name}:\n\nΚομμωτηρια & μπαρμπερικα - Κρατησεις και προγραμματισμος\n\nΟμορφια & σπα - Διαχειριση θεραπειων και πακετων\n\nΙατρεια & οδοντιατρεια - Προγραμματισμος ασθενων\n\nΣυνεργεια αυτοκινητων - Κρατησεις και αναθεση μηχανικων\n\nΓυμναστηρια - Προγραμματισμος μαθηματων και γυμναστων\n\nΤι ειδους επιχειρηση εχεις;`,
    getStarted: (name) => `Το ξεκινημα ειναι πανευκολο, ${name}!\n\n1. Δημιουργησε λογαριασμο: https://app.solis-os.com/signup (30 δευτερολεπτα)\n2. Ρυθμισε το προφιλ της επιχειρησης\n3. Προσθεσε τις υπηρεσιες σου\n4. Προσθεσε την ομαδα σου\n5. Μοιρασου τη σελιδα κρατησεων\n\nΣε 5 λεπτα εισαι ετοιμος. Χωρις πιστωτικη καρτα.\n\nΞεκινα τωρα: https://app.solis-os.com/signup`,
    demo: (name) => `Με χαρα, ${name}!\n\n1. Επισκεψου το site μας: https://solis-os.com\n2. Δοκιμασε δωρεαν: https://app.solis-os.com/signup\n3. Η γραψε "μιληστε με καποιον" για προσωπικη παρουσιαση`,
    trial: (name) => `Ναι, ${name}! Προσφερουμε δωρεαν δοκιμη με πληρη προσβαση.\n\nΧωρις καρτα. Χωρις δεσμευση.\n\nΞεκινα: https://app.solis-os.com/signup`,
    human: (name) => `Φυσικα, ${name}! Ενα μελος της ομαδας μας θα επικοινωνησει μαζι σου συντομα. Ευχαριστουμε για την υπομονη!`,
    thanks: (name) => `Παρακαλω, ${name}! Χαρηκα που βοηθησα.\n\nΑν εχεις αλλες ερωτησεις, γραψε μας οποτε θελεις.\n\nΞεκινα: https://app.solis-os.com/signup`,
    bye: (name) => `Ηταν χαρα μου, ${name}! Αν χρειαστεις κατι, γραψε μας.\n\nΚαλη σου μερα!`,
    yes: (name) => `Τελεια! Προτεινω, ${name}:\n\n1. Ξεκινα δωρεαν δοκιμη: https://app.solis-os.com/signup\n2. Ρυθμισε την επιχειρηση και τις υπηρεσιες\n3. Μοιρασου τη σελιδα κρατησεων\n\nΗ γραψε "demo" για ξεναγηση.`,
    nonText: "Ευχαριστουμε που επικοινωνησες! Μπορω να σε βοηθησω καλυτερα μεσω κειμενου. Γραψε την ερωτηση σου!",
    ai: (name) => `Η τεχνητη νοημοσυνη ειναι ο πυρηνας του Solis OS, ${name}:\n\nΕξυπνος προγραμματισμος - Βελτιστοποιει τα ραντεβου σου.\n\nΑναλυση πελατων - Προβλεπει ακυρωσεις.\n\nΒελτιστοποιηση εσοδων - Βρισκει τις πιο κερδοφορες υπηρεσιες.\n\nΑυτοματη παρακολουθηση - Μειωνει τις ακυρωσεις εως 80%.\n\nΔοκιμασε το: https://app.solis-os.com/signup`,
    support: (name) => `Ειμαι εδω για να βοηθησω, ${name}!\n\nΡωτησε με οτιδηποτε για το Solis OS.\n\nΓια τεχνικη υποστηριξη, γραψε "μιληστε με καποιον".`,
    booking: (name) => `Το Solis OS κανει τη διαχειριση ραντεβου παιχνιδακι, ${name}!\n\nΣελιδα κρατησεων 24/7\nΕξυπνο ημερολογιο\nΑυτοματες υπενθυμισεις (-80% ακυρωσεις)\nΕυκολη αλλαγη ραντεβου\n\nΞεκινα δωρεαν: https://app.solis-os.com/signup`,
    security: (name) => `Η ασφαλεια ειναι προτεραιοτητα στο Solis OS, ${name}.\n\n- Κρυπτογραφηση απο ακρη σε ακρη\n- Ασφαλες cloud hosting\n- Ελεγχος προσβασης βασει ρολων\n- Συμμορφωση με GDPR`,
    app: (name) => `Το Solis OS λειτουργει σε ολες τις συσκευες, ${name}!\n\nΚινητο, Desktop, Tablet.\n\nΚατεβαστε τωρα:\n\nApp Store: https://apps.apple.com/app/solis-os/id6745498032\nGoogle Play: https://play.google.com/store/apps/details?id=com.solisos\n\nΞεκινα: https://app.solis-os.com/signup`,
    language: (name) => `Το Solis OS υποστηριζει πολλες γλωσσες, ${name}!\n\nΗ πλατφορμα και το chatbot λειτουργουν σε:\nΑγγλικα, Αραβικα, Γαλλικα, Ισπανικα, Γερμανικα, Ιταλικα, Πορτογαλικα, Ελληνικα, Κινεζικα, Ιαπωνικα, Κορεατικα\n\nΤο chatbot αναγνωριζει αυτοματα τη γλωσσα σας!\n\nΘελετε να μαθετε κατι αλλο;`
  },

  zh: {
    menu: () => `输入数字：\n\n1. 功能\n2. 价格\n3. 行业\n4. 如何开始\n5. 演示\n6. 预约\n7. AI工具\n8. 支持\n9. 联系人工\n\n_我们支持多语言 - 用任何语言与我们交流！_`,
    welcome: (name) => `你好 ${name}！欢迎来到 Solis OS。\n\nAI智能平台，服务美容院、诊所、汽修店等企业。\n\n1. 功能\n2. 价格\n3. 行业\n4. 如何开始\n5. 演示\n6. 预约\n7. AI工具\n8. 支持\n9. 联系人工\n\n_我们支持多语言 - 用任何语言与我们交流！_\n\n输入数字！`,
    welcomeWithAnswer: (name, answer) => `你好 ${name}！欢迎来到 Solis OS。\n\n${answer}`,
    welcomeGeneric: (name) => `你好 ${name}！欢迎来到 Solis OS。\n\n1. 功能\n2. 价格\n3. 行业\n4. 如何开始\n5. 演示\n6. 预约\n7. AI工具\n8. 支持\n9. 联系人工\n\n_我们支持多语言 - 用任何语言与我们交流！_\n\n输入数字！`,
    fallback: (name) => `谢谢，${name}。\n\n输入数字：\n\n1. 功能\n2. 价格\n3. 行业\n4. 如何开始\n5. 演示\n6. 预约\n7. AI工具\n8. 支持\n9. 联系人工\n\n_我们支持多语言 - 用任何语言与我们交流！_`,
    features: (name) => `很好的问题，${name}！Solis OS 能做这些：\n\n预约管理 - 全天候在线预约页面。\n\n客户管理 - 完整的CRM系统，跟踪所有客户。\n\n团队管理 - 管理团队，分配角色。\n\nAI洞察 - 智能分析和优化建议。\n\n自动通知 - WhatsApp和邮件自动发送。\n\n数据面板 - 实时查看收入和预约数据。\n\n想了解价格，还是直接开始免费试用？`,
    pricing: (name) => `简单定价，${name}：\n\nSolis OS - $29/月\n\n全部包含：\n- 无限预约和客户\n- AI WhatsApp助手\n- 团队管理\n- 发票和费用\n- 分析和报告\n- 营销工具\n- 在线预约页面\n\n14天免费试用，无需信用卡。\n\n立即开始：https://app.solis-os.com/signup`,
    industries: (name) => `Solis OS 专为服务型企业打造，${name}：\n\n美发沙龙和理发店 - 预约和排班\n\n美容和水疗 - 项目管理和套餐\n\n医疗和牙科诊所 - 患者排程\n\n汽车修理厂 - 工单预约和技师分配\n\n健身房 - 课程安排和教练管理\n\n你经营什么类型的生意？`,
    getStarted: (name) => `开始非常简单，${name}！\n\n1. 注册账户：https://app.solis-os.com/signup（30秒）\n2. 设置企业信息\n3. 添加服务项目\n4. 添加团队成员\n5. 分享预约页面给客户\n\n5分钟搞定。无需信用卡。\n\n立即开始：https://app.solis-os.com/signup`,
    demo: (name) => `很乐意为你展示，${name}！\n\n1. 访问我们的网站：https://solis-os.com\n2. 免费试用：https://app.solis-os.com/signup\n3. 或输入"转接人工"安排专人演示`,
    trial: (name) => `当然，${name}！我们提供全功能免费试用。\n\n无需信用卡，没有任何束缚。\n\n开始试用：https://app.solis-os.com/signup`,
    human: (name) => `没问题，${name}！我们的团队成员会尽快与你联系。感谢你的耐心！`,
    thanks: (name) => `不客气，${name}！很高兴能帮到你。\n\n有任何问题随时联系我们。\n\n立即开始：https://app.solis-os.com/signup`,
    bye: (name) => `很高兴和你聊天，${name}！需要帮助随时联系我们。\n\n祝你有美好的一天！`,
    yes: (name) => `太好了！建议你这样做，${name}：\n\n1. 开始免费试用：https://app.solis-os.com/signup\n2. 设置企业和服务信息\n3. 分享预约页面给客户\n\n或输入"演示"安排一次演示。`,
    nonText: "感谢联系！我通过文字能更好地帮助你。请输入你的问题！",
    ai: (name) => `AI是 Solis OS 的核心，${name}：\n\n智能排程 - 优化预约时段。\n\n客户分析 - 预测客户行为和爽约。\n\n收入优化 - 找出最赚钱的服务。\n\n自动跟进 - 减少高达80%的爽约。\n\n免费试用：https://app.solis-os.com/signup`,
    support: (name) => `我来帮你，${name}！\n\n关于 Solis OS 的任何问题都可以问我。\n\n需要技术支持，请输入"转接人工"。`,
    booking: (name) => `Solis OS 让预约管理变得轻松，${name}！\n\n全天候在线预约页面\n智能日历\n自动提醒（减少80%爽约）\n轻松改约\n\n免费开始：https://app.solis-os.com/signup`,
    security: (name) => `安全是 Solis OS 的首要任务，${name}。\n\n- 端到端加密\n- 安全云托管\n- 基于角色的访问控制\n- 符合GDPR规范`,
    app: (name) => `Solis OS 适用于所有设备，${name}！\n\n手机、电脑、平板都能用。\n\n立即下载：\n\nApp Store: https://apps.apple.com/app/solis-os/id6745498032\nGoogle Play: https://play.google.com/store/apps/details?id=com.solisos\n\n立即开始：https://app.solis-os.com/signup`,
    language: (name) => `Solis OS 支持多种语言，${name}！\n\n我们的平台和聊天机器人支持：\n英语、阿拉伯语、法语、西班牙语、德语、意大利语、葡萄牙语、希腊语、中文、日语、韩语\n\n聊天机器人会自动检测您的语言并用相同语言回复！\n\n还有什么想了解的吗？`
  },

  ja: {
    menu: () => `番号を入力してください：\n\n1. 機能\n2. 料金\n3. 業種\n4. 始め方\n5. デモ\n6. 予約\n7. AIツール\n8. サポート\n9. 担当者に繋ぐ\n\n_お好きな言語でお書きください！_`,
    welcome: (name) => `こんにちは ${name}さん！Solis OSへようこそ。\n\nサロン、クリニック、整備工場向けAIプラットフォーム。\n\n1. 機能\n2. 料金\n3. 業種\n4. 始め方\n5. デモ\n6. 予約\n7. AIツール\n8. サポート\n9. 担当者に繋ぐ\n\n_お好きな言語でお書きください！_\n\n番号を入力！`,
    welcomeWithAnswer: (name, answer) => `こんにちは ${name}さん！Solis OSへようこそ。\n\n${answer}`,
    welcomeGeneric: (name) => `こんにちは ${name}さん！Solis OSへようこそ。\n\n1. 機能\n2. 料金\n3. 業種\n4. 始め方\n5. デモ\n6. 予約\n7. AIツール\n8. サポート\n9. 担当者に繋ぐ\n\n_お好きな言語でお書きください！_\n\n番号を入力！`,
    fallback: (name) => `ありがとうございます、${name}さん。\n\n番号を入力してください：\n\n1. 機能\n2. 料金\n3. 業種\n4. 始め方\n5. デモ\n6. 予約\n7. AIツール\n8. サポート\n9. 担当者に繋ぐ\n\n_お好きな言語でお書きください！_`,
    features: (name) => `いい質問ですね、${name}さん！Solis OSでできること：\n\n予約管理 - 24時間オンライン予約ページ。\n\n顧客管理 - 全顧客を追跡するCRM。\n\nチーム管理 - スタッフの役割と勤務管理。\n\nAI分析 - スマートな分析と改善提案。\n\n自動通知 - WhatsAppとメールの自動送信。\n\nダッシュボード - 売上と予約のリアルタイムデータ。\n\n料金を確認しますか？それとも無料トライアルを始めますか？`,
    pricing: (name) => `シンプルな料金、${name}さん：\n\nSolis OS - $29/月\n\n全て含まれています：\n- 無制限の予約と顧客\n- AI WhatsAppアシスタント\n- チーム管理\n- 請求書と経費\n- 分析とレポート\n- マーケティングツール\n- オンライン予約ページ\n\n14日間無料トライアル、カード不要。\n\n今すぐ始める：https://app.solis-os.com/signup`,
    industries: (name) => `Solis OSはサービス業向けに作られています、${name}さん：\n\n美容室・理容室 - 予約とスタイリストのスケジュール管理\n\nエステ・スパ - 施術予約とパッケージ管理\n\n医療・歯科クリニック - 患者予約と医師管理\n\n自動車整備工場 - 作業予約とメカニック配置\n\nジム・フィットネス - クラススケジュールとトレーナー管理\n\nどのような事業をされていますか？`,
    getStarted: (name) => `始め方はとても簡単です、${name}さん！\n\n1. アカウント作成：https://app.solis-os.com/signup（30秒）\n2. ビジネスプロフィールを設定\n3. サービスを追加\n4. チームメンバーを追加\n5. 予約ページを顧客に共有\n\n5分で完了。クレジットカード不要。\n\n今すぐ始める：https://app.solis-os.com/signup`,
    demo: (name) => `ぜひご案内します、${name}さん！\n\n1. ウェブサイトをご覧ください：https://solis-os.com\n2. 無料で試す：https://app.solis-os.com/signup\n3. または「担当者に繋いで」で個別デモを手配します`,
    trial: (name) => `はい、${name}さん！全機能を使える無料トライアルをご用意しています。\n\nクレジットカード不要。縛りなし。\n\n今すぐ始める：https://app.solis-os.com/signup`,
    human: (name) => `もちろんです、${name}さん！チームのメンバーが間もなくご連絡いたします。お待ちいただきありがとうございます！`,
    thanks: (name) => `どういたしまして、${name}さん！お役に立てて嬉しいです。\n\n他にご質問があればいつでもどうぞ。\n\n始める：https://app.solis-os.com/signup`,
    bye: (name) => `お話しできて良かったです、${name}さん！何かあればいつでもご連絡ください。\n\n素敵な一日を！`,
    yes: (name) => `素晴らしい！おすすめは、${name}さん：\n\n1. 無料トライアルを始める：https://app.solis-os.com/signup\n2. ビジネスとサービスを設定\n3. 予約ページを顧客に共有\n\nまたは「デモ」と入力してガイドツアーをどうぞ。`,
    nonText: "お問い合わせありがとうございます！テキストメッセージでのご対応が最も的確です。ご質問を入力してください！",
    ai: (name) => `AIはSolis OSの中核です、${name}さん：\n\nスマートスケジューリング - 予約枠を最適化。\n\n顧客分析 - 行動パターンを把握しキャンセルを予測。\n\n収益最適化 - 最も収益性の高いサービスを特定。\n\n自動フォロー - キャンセルを最大80%削減。\n\n無料で試す：https://app.solis-os.com/signup`,
    support: (name) => `お手伝いします、${name}さん！\n\nSolis OSについて何でもお聞きください。\n\n技術サポートが必要な場合は「担当者に繋いで」と入力してください。`,
    booking: (name) => `Solis OSで予約管理が楽になります、${name}さん！\n\n24時間オンライン予約ページ\nスマートカレンダー\n自動リマインダー（キャンセル80%減）\n簡単リスケジュール\n\n無料で始める：https://app.solis-os.com/signup`,
    security: (name) => `セキュリティはSolis OSの最優先事項です、${name}さん。\n\n- エンドツーエンド暗号化\n- 安全なクラウドホスティング\n- ロールベースのアクセス制御\n- GDPR準拠`,
    app: (name) => `Solis OSはすべてのデバイスで使えます、${name}さん！\n\nスマホ、PC、タブレット対応。\n\n今すぐダウンロード：\n\nApp Store: https://apps.apple.com/app/solis-os/id6745498032\nGoogle Play: https://play.google.com/store/apps/details?id=com.solisos\n\n今すぐ始める：https://app.solis-os.com/signup`,
    language: (name) => `Solis OSは多言語対応です、${name}さん！\n\nプラットフォームとチャットボットは以下の言語に対応：\n英語、アラビア語、フランス語、スペイン語、ドイツ語、イタリア語、ポルトガル語、ギリシャ語、中国語、日本語、韓国語\n\nチャットボットは自動的にあなたの言語を検出し、同じ言語で返信します！\n\n他に何か知りたいことはありますか？`
  },

  ko: {
    menu: () => `번호를 입력하세요:\n\n1. 기능\n2. 요금\n3. 업종\n4. 시작하기\n5. 데모\n6. 예약\n7. AI 도구\n8. 지원\n9. 상담사 연결\n\n_어떤 언어로든 편하게 작성하세요!_`,
    welcome: (name) => `안녕하세요 ${name}님! Solis OS에 오신 것을 환영합니다.\n\n미용실, 클리닉, 정비소를 위한 AI 플랫폼.\n\n1. 기능\n2. 요금\n3. 업종\n4. 시작하기\n5. 데모\n6. 예약\n7. AI 도구\n8. 지원\n9. 상담사 연결\n\n_어떤 언어로든 편하게 작성하세요!_\n\n번호를 입력하세요!`,
    welcomeWithAnswer: (name, answer) => `안녕하세요 ${name}님! Solis OS에 오신 것을 환영합니다.\n\n${answer}`,
    welcomeGeneric: (name) => `안녕하세요 ${name}님! Solis OS에 오신 것을 환영합니다.\n\n1. 기능\n2. 요금\n3. 업종\n4. 시작하기\n5. 데모\n6. 예약\n7. AI 도구\n8. 지원\n9. 상담사 연결\n\n_어떤 언어로든 편하게 작성하세요!_\n\n번호를 입력하세요!`,
    fallback: (name) => `감사합니다, ${name}님.\n\n번호를 입력하세요:\n\n1. 기능\n2. 요금\n3. 업종\n4. 시작하기\n5. 데모\n6. 예약\n7. AI 도구\n8. 지원\n9. 상담사 연결\n\n_어떤 언어로든 편하게 작성하세요!_`,
    features: (name) => `좋은 질문이에요, ${name}님! Solis OS가 하는 일:\n\n예약 관리 - 24시간 온라인 예약 페이지.\n\n고객 관리 - 모든 고객을 추적하는 CRM.\n\n팀 관리 - 역할 배정과 근무 관리.\n\nAI 인사이트 - 스마트 분석과 개선 제안.\n\n자동 알림 - WhatsApp과 이메일 자동 발송.\n\n대시보드 - 매출과 예약 실시간 데이터.\n\n요금제를 확인하시겠어요, 아니면 무료 체험을 시작하시겠어요?`,
    pricing: (name) => `간단한 요금제, ${name}님:\n\nSolis OS - $29/월\n\n모두 포함:\n- 무제한 예약 & 고객\n- AI WhatsApp 어시스턴트\n- 팀 관리\n- 청구서 & 비용\n- 분석 & 보고서\n- 마케팅 도구\n- 온라인 예약 페이지\n\n14일 무료 체험, 카드 불필요.\n\n시작하기: https://app.solis-os.com/signup`,
    industries: (name) => `Solis OS는 서비스 업종을 위해 만들어졌습니다, ${name}님:\n\n미용실 & 이발소 - 예약과 스타일리스트 스케줄\n\n뷰티 & 스파 - 시술 예약과 패키지 관리\n\n의원 & 치과 - 환자 예약과 의사 관리\n\n자동차 정비소 - 작업 예약과 정비사 배정\n\n헬스장 & 피트니스 - 수업 스케줄과 트레이너 관리\n\n어떤 사업을 하고 계신가요?`,
    getStarted: (name) => `시작은 정말 쉽습니다, ${name}님!\n\n1. 계정 만들기: https://app.solis-os.com/signup (30초)\n2. 비즈니스 프로필 설정\n3. 서비스 추가\n4. 팀원 추가\n5. 예약 페이지를 고객에게 공유\n\n5분이면 끝. 신용카드 불필요.\n\n지금 시작: https://app.solis-os.com/signup`,
    demo: (name) => `기꺼이 보여드리겠습니다, ${name}님!\n\n1. 웹사이트 방문: https://solis-os.com\n2. 무료 체험: https://app.solis-os.com/signup\n3. 또는 "상담사 연결"로 개인 데모 요청`,
    trial: (name) => `네, ${name}님! 모든 기능을 사용할 수 있는 무료 체험을 제공합니다.\n\n신용카드 불필요. 부담 없이 시작하세요.\n\n체험 시작: https://app.solis-os.com/signup`,
    human: (name) => `물론이죠, ${name}님! 팀원이 곧 연락드리겠습니다. 기다려 주셔서 감사합니다!`,
    thanks: (name) => `천만에요, ${name}님! 도움이 되어 기쁩니다.\n\n다른 질문이 있으시면 언제든 연락주세요.\n\n시작하기: https://app.solis-os.com/signup`,
    bye: (name) => `대화 즐거웠습니다, ${name}님! 필요하시면 언제든 연락주세요.\n\n좋은 하루 보내세요!`,
    yes: (name) => `좋습니다! 추천드리는 방법, ${name}님:\n\n1. 무료 체험 시작: https://app.solis-os.com/signup\n2. 비즈니스와 서비스 설정\n3. 예약 페이지를 고객에게 공유\n\n또는 "데모"라고 입력해 가이드 투어를 받아보세요.`,
    nonText: "연락해 주셔서 감사합니다! 텍스트 메시지로 더 정확하게 도와드릴 수 있습니다. 질문을 입력해 주세요!",
    ai: (name) => `AI는 Solis OS의 핵심입니다, ${name}님:\n\n스마트 스케줄링 - 예약 시간대 최적화.\n\n고객 분석 - 행동 패턴 파악과 노쇼 예측.\n\n매출 최적화 - 가장 수익성 높은 서비스 파악.\n\n자동 팔로업 - 노쇼를 최대 80% 감소.\n\n무료 체험: https://app.solis-os.com/signup`,
    support: (name) => `도와드리겠습니다, ${name}님!\n\nSolis OS에 대해 무엇이든 물어보세요.\n\n기술 지원이 필요하시면 "상담사 연결"이라고 입력해 주세요.`,
    booking: (name) => `Solis OS로 예약 관리가 간편해집니다, ${name}님!\n\n24시간 온라인 예약 페이지\n스마트 캘린더\n자동 리마인더 (노쇼 80% 감소)\n간편 일정 변경\n\n무료 시작: https://app.solis-os.com/signup`,
    security: (name) => `보안은 Solis OS의 최우선 과제입니다, ${name}님.\n\n- 종단간 암호화\n- 안전한 클라우드 호스팅\n- 역할 기반 접근 제어\n- GDPR 준수`,
    app: (name) => `Solis OS는 모든 기기에서 사용 가능합니다, ${name}님!\n\n모바일, 데스크톱, 태블릿 지원.\n\n지금 다운로드:\n\nApp Store: https://apps.apple.com/app/solis-os/id6745498032\nGoogle Play: https://play.google.com/store/apps/details?id=com.solisos\n\n지금 시작: https://app.solis-os.com/signup`,
    language: (name) => `Solis OS는 다국어를 지원합니다, ${name}님!\n\n플랫폼과 챗봇이 지원하는 언어:\n영어, 아랍어, 프랑스어, 스페인어, 독일어, 이탈리아어, 포르투갈어, 그리스어, 중국어, 일본어, 한국어\n\n챗봇이 자동으로 언어를 감지하고 같은 언어로 응답합니다!\n\n더 알고 싶은 것이 있으신가요?`
  }
};

function detectLanguage(text) {
  const arabicRegex = /[؀-ۿݐ-ݿࢠ-ࣿ]/;
  if (arabicRegex.test(text)) return 'ar';

  // CJK character ranges
  const chineseRegex = /[一-鿿㐀-䶿]/;
  if (chineseRegex.test(text)) return 'zh';

  const japaneseRegex = /[぀-ゟ゠-ヿ]/;
  if (japaneseRegex.test(text)) return 'ja';

  const koreanRegex = /[가-힯ᄀ-ᇿ㄰-㆏]/;
  if (koreanRegex.test(text)) return 'ko';

  const greekRegex = /[Ͱ-Ͽἀ-῿]/;
  if (greekRegex.test(text)) return 'el';

  const lower = text.toLowerCase();

  const germanWords = ['hallo', 'guten tag', 'guten morgen', 'danke', 'bitte', 'preis', 'kosten', 'wie viel', 'hilfe', 'funktionen', 'buchung', 'termin', 'anfangen', 'sprechen', 'ja', 'nein', 'ich moechte', 'was ist', 'wie geht'];
  const italianWords = ['ciao', 'buongiorno', 'grazie', 'prezzo', 'quanto', 'aiuto', 'prenotazione', 'funzionalita', 'iniziare', 'parlare', 'voglio', 'come', 'buonasera', 'salve', 'perfetto'];
  const portugueseWords = ['ola', 'bom dia', 'obrigado', 'obrigada', 'preco', 'quanto', 'ajuda', 'agendamento', 'comecar', 'falar', 'quero', 'preciso', 'funcionalidades', 'como funciona', 'boa tarde', 'boa noite'];
  const frenchWords = ['bonjour', 'salut', 'merci', 'comment', 'prix', 'combien', 'fonctionnalites', 'aide', 'parler', 'reservation', 'oui', 'non', 'bonsoir', 'bonne', 'je veux', 'je voudrais', 'est-ce que', "c'est quoi", "qu'est"];
  const spanishWords = ['hola', 'gracias', 'precio', 'cuanto', 'ayuda', 'hablar', 'reserva', 'quiero', 'necesito', 'buenas', 'buenos', 'como', 'funciona', 'puedo', 'donde'];

  const deCount = germanWords.filter(w => lower.includes(w)).length;
  const itCount = italianWords.filter(w => lower.includes(w)).length;
  const ptCount = portugueseWords.filter(w => lower.includes(w)).length;
  const frCount = frenchWords.filter(w => lower.includes(w)).length;
  const spCount = spanishWords.filter(w => lower.includes(w)).length;

  // Pick the language with the most keyword matches; require at least 1
  const scores = { de: deCount, it: itCount, pt: ptCount, fr: frCount, es: spCount };
  let best = null, bestCount = 0;
  for (const [lang, count] of Object.entries(scores)) {
    if (count > bestCount) { best = lang; bestCount = count; }
  }
  if (best && bestCount >= 1) return best;

  return 'en';
}

function getTranslation(lang) {
  return translations[lang] || translations.en;
}

module.exports = { detectLanguage, getTranslation, translations };
