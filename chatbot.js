const { detectLanguage, getTranslation } = require('./translations');
const { getAIResponse } = require('./ai');

const conversations = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000;

function getSession(phone) {
  const session = conversations.get(phone);
  if (session && Date.now() - session.lastActive < SESSION_TIMEOUT) {
    session.lastActive = Date.now();
    session.messageCount++;
    return session;
  }
  const newSession = { lastActive: Date.now(), messageCount: 1, greeted: false, lang: 'en', handedOff: false };
  conversations.set(phone, newSession);
  return newSession;
}

async function handleIncomingMessage(text, senderName, phone) {
  const session = getSession(phone);
  const input = text.toLowerCase().trim();
  const firstName = senderName.split(' ')[0];

  const detectedLang = detectLanguage(text);
  if (detectedLang !== 'en') session.lang = detectedLang;
  const t = getTranslation(session.lang);

  if (session.handedOff) {
    return null;
  }

  if (!session.greeted) {
    session.greeted = true;
    if (isGreeting(input, session.lang)) {
      return t.welcome(firstName);
    }
    const topicKey = matchTopicKey(input, session.lang);
    if (topicKey === 'human') {
      session.handedOff = true;
      return t.human(firstName);
    }
    if (topicKey && t[topicKey]) return t.welcomeWithAnswer(firstName, t[topicKey](firstName));
    return t.welcomeGeneric(firstName);
  }

  const numKeys = ['features','pricing','industries','getStarted','demo','booking','ai','support','human'];
  const num = parseInt(input);
  if (num >= 1 && num <= numKeys.length && input === String(num)) {
    if (numKeys[num-1] === 'human') {
      session.handedOff = true;
      return t.human(firstName);
    }
    const reply = t[numKeys[num-1]](firstName);
    return reply + '\n\n' + t.menu();
  }

  const topicKey = matchTopicKey(input, session.lang);
  if (topicKey === 'human') {
    session.handedOff = true;
    return t.human(firstName);
  }
  if (topicKey && t[topicKey]) {
    const reply = t[topicKey](firstName);
    return reply + '\n\n' + t.menu();
  }

  const aiReply = await getAIResponse(text, phone, firstName, session.lang);
  if (aiReply) return aiReply;

  return t.fallback(firstName);
}

function isGreeting(text, lang) {
  const greetings = {
    en: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo', 'hiya', 'howdy', 'greetings', 'whats up', "what's up"],
    ar: ['مرحبا', 'مرحبًا', 'اهلا', 'أهلا', 'السلام عليكم', 'سلام', 'هلا', 'هاي', 'صباح الخير', 'مساء الخير'],
    fr: ['bonjour', 'salut', 'bonsoir', 'coucou', 'bonne journee', 'allo'],
    es: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'buenas', 'que tal'],
    de: ['hallo', 'guten tag', 'guten morgen', 'guten abend', 'moin', 'servus', 'gruess gott', 'hi'],
    it: ['ciao', 'buongiorno', 'buonasera', 'salve', 'buon giorno'],
    pt: ['ola', 'bom dia', 'boa tarde', 'boa noite', 'oi', 'e ai'],
    el: ['γεια', 'γεια σου', 'γεια σας', 'καλημερα', 'καλησπερα', 'καληνυχτα', 'χαιρετε'],
    zh: ['你好', '嗨', '早上好', '下午好', '晚上好', '您好'],
    ja: ['こんにちは', 'こんばんは', 'おはよう', 'おはようございます', 'はじめまして', 'やあ'],
    ko: ['안녕하세요', '안녕', '반갑습니다', '좋은 아침', '좋은 저녁']
  };
  const all = [...(greetings[lang] || []), ...(greetings.en || [])];
  return all.some(g => text === g || text.startsWith(g + ' ') || text.startsWith(g + ',') || text.startsWith(g + '!'));
}

function matchTopicKey(input, lang) {
  const patterns = {
    pricing: {
      en: ['price', 'pricing', 'cost', 'how much', 'plans', 'subscription', 'payment', 'pay', 'fee', 'charge', 'monthly', 'yearly'],
      ar: ['سعر', 'اسعار', 'أسعار', 'كم', 'باقة', 'باقات', 'اشتراك', 'دفع', 'شهري', 'تكلفة'],
      fr: ['prix', 'tarif', 'combien', 'abonnement', 'forfait', 'cout', 'payer', 'mensuel'],
      es: ['precio', 'costo', 'cuanto', 'plan', 'planes', 'pago', 'mensual', 'suscripcion'],
      de: ['preis', 'preise', 'kosten', 'wie viel', 'tarif', 'abo', 'abonnement', 'zahlung', 'monatlich'],
      it: ['prezzo', 'prezzi', 'costo', 'quanto', 'piano', 'piani', 'abbonamento', 'pagamento', 'mensile'],
      pt: ['preco', 'precos', 'custo', 'quanto', 'plano', 'planos', 'assinatura', 'pagamento', 'mensal'],
      el: ['τιμη', 'τιμες', 'κοστος', 'ποσο', 'πλανο', 'συνδρομη', 'πληρωμη'],
      zh: ['价格', '费用', '多少钱', '方案', '套餐', '订阅', '收费', '月费'],
      ja: ['料金', '価格', '費用', 'いくら', 'プラン', 'サブスク', '月額'],
      ko: ['가격', '요금', '비용', '얼마', '플랜', '구독', '결제', '월']
    },
    features: {
      en: ['feature', 'what does', 'what can', 'what do you', 'capabilities', 'offer', 'what is solis', "what's solis", 'tell me about', 'about solis', 'explain'],
      ar: ['مميزات', 'خصائص', 'ماذا يفعل', 'ما هو', 'اشرح', 'عن سوليس'],
      fr: ['fonctionnalite', 'que fait', 'quoi', "c'est quoi", 'expliquer', 'a propos'],
      es: ['funcionalidad', 'caracteristica', 'que hace', 'que es', 'explicar', 'sobre solis'],
      de: ['funktion', 'was kann', 'was macht', 'was ist solis', 'erklaer', 'angebot', 'ueber solis'],
      it: ['funzionalita', 'cosa fa', 'cosa puo', "cos'e", 'spiegare', 'su solis'],
      pt: ['funcionalidade', 'o que faz', 'o que e', 'explicar', 'sobre o solis'],
      el: ['λειτουργια', 'τι κανει', 'τι ειναι', 'χαρακτηριστικα', 'δυνατοτητες'],
      zh: ['功能', '做什么', '是什么', '介绍', '特点', '了解'],
      ja: ['機能', '何ができる', '何ですか', '説明', '特徴', '紹介'],
      ko: ['기능', '뭐하는', '무엇', '설명', '소개', '특징']
    },
    booking: {
      en: ['booking', 'appointment', 'schedule', 'calendar', 'reserve'],
      ar: ['حجز', 'موعد', 'مواعيد', 'جدول', 'حجوزات'],
      fr: ['reservation', 'rendez-vous', 'calendrier', 'reserver'],
      es: ['reserva', 'cita', 'agendar', 'calendario', 'reservar'],
      de: ['buchung', 'termin', 'kalender', 'reservierung', 'terminplanung'],
      it: ['prenotazione', 'appuntamento', 'calendario', 'prenotare'],
      pt: ['agendamento', 'consulta', 'calendario', 'agendar', 'reserva'],
      el: ['κρατηση', 'ραντεβου', 'ημερολογιο', 'κλεισε'],
      zh: ['预约', '预订', '日历', '排程', '约'],
      ja: ['予約', '予定', 'カレンダー', 'スケジュール', 'アポイント'],
      ko: ['예약', '일정', '캘린더', '스케줄', '약속']
    },
    industries: {
      en: ['salon', 'hair', 'barber', 'beauty', 'spa', 'clinic', 'medical', 'dental', 'garage', 'mechanic', 'gym', 'fitness', 'industry', 'who is it for', 'what kind'],
      ar: ['صالون', 'حلاقة', 'تجميل', 'عيادة', 'طبي', 'ورشة', 'سيارات', 'رياضة', 'قطاع'],
      fr: ['salon', 'coiffure', 'beaute', 'clinique', 'medical', 'garage', 'mecanique', 'salle de sport', 'secteur'],
      es: ['salon', 'peluqueria', 'belleza', 'clinica', 'medico', 'taller', 'mecanico', 'gimnasio', 'industria'],
      de: ['salon', 'friseur', 'kosmetik', 'klinik', 'arzt', 'werkstatt', 'mechaniker', 'fitness', 'branche'],
      it: ['salone', 'parrucchiere', 'bellezza', 'clinica', 'medico', 'officina', 'meccanico', 'palestra', 'settore'],
      pt: ['salao', 'cabeleireiro', 'beleza', 'clinica', 'medico', 'oficina', 'mecanico', 'academia', 'setor'],
      el: ['κομμωτηριο', 'σαλονι', 'κλινικη', 'ιατρειο', 'συνεργειο', 'γυμναστηριο', 'κλαδος'],
      zh: ['美容院', '沙龙', '诊所', '医疗', '牙科', '修理厂', '健身房', '行业'],
      ja: ['サロン', '美容室', 'クリニック', '医療', '歯科', '整備工場', 'ジム', '業種'],
      ko: ['미용실', '살롱', '클리닉', '의료', '치과', '정비소', '헬스장', '업종']
    },
    getStarted: {
      en: ['start', 'sign up', 'signup', 'register', 'create account', 'get started', 'begin', 'try', 'join'],
      ar: ['بدء', 'تسجيل', 'انشاء حساب', 'ابدأ', 'كيف ابدأ', 'جرب'],
      fr: ['commencer', 'inscrire', 'inscription', 'creer compte', 'demarrer', 'essayer'],
      es: ['empezar', 'registrar', 'crear cuenta', 'comenzar', 'iniciar', 'probar'],
      de: ['anfangen', 'starten', 'registrieren', 'konto erstellen', 'loslegen', 'anmelden'],
      it: ['iniziare', 'iscriversi', 'registrarsi', 'creare account', 'cominciare'],
      pt: ['comecar', 'registrar', 'criar conta', 'cadastrar', 'iniciar'],
      el: ['ξεκινησω', 'εγγραφη', 'λογαριασμο', 'αρχισω'],
      zh: ['开始', '注册', '创建账户', '怎么开始', '加入'],
      ja: ['始める', '登録', 'アカウント', '開始', '始め方'],
      ko: ['시작', '가입', '등록', '계정', '시작하기']
    },
    demo: {
      en: ['demo', 'demonstration', 'show me', 'see it', 'preview', 'walkthrough', 'tour'],
      ar: ['عرض', 'توضيحي', 'شاهد', 'جولة'],
      fr: ['demo', 'demonstration', 'montrer', 'voir', 'visite'],
      es: ['demo', 'demostracion', 'mostrar', 'ver', 'tour'],
      de: ['demo', 'vorfuehrung', 'zeigen', 'ansehen', 'rundgang'],
      it: ['demo', 'dimostrazione', 'mostrare', 'vedere', 'tour'],
      pt: ['demo', 'demonstracao', 'mostrar', 'ver', 'tour'],
      el: ['demo', 'επιδειξη', 'δειξε', 'παρουσιαση'],
      zh: ['演示', '展示', '看看', '试看'],
      ja: ['デモ', '見せて', '見たい', 'ツアー'],
      ko: ['데모', '보여주세요', '시연', '투어']
    },
    trial: {
      en: ['free', 'trial', 'test', 'no cost'],
      ar: ['مجاني', 'تجربة', 'مجانية', 'بدون تكلفة'],
      fr: ['gratuit', 'essai', 'test', 'sans frais'],
      es: ['gratis', 'gratuito', 'prueba', 'sin costo'],
      de: ['kostenlos', 'gratis', 'testphase', 'probe', 'testen'],
      it: ['gratuito', 'gratis', 'prova', 'test', 'provare'],
      pt: ['gratis', 'gratuito', 'teste', 'experimentar', 'sem custo'],
      el: ['δωρεαν', 'δοκιμη', 'τεστ'],
      zh: ['免费', '试用', '测试', '体验'],
      ja: ['無料', 'トライアル', '試す', 'テスト', '体験'],
      ko: ['무료', '체험', '테스트', '시험']
    },
    ai: {
      en: ['ai', 'artificial intelligence', 'smart', 'intelligent', 'automation', 'automate'],
      ar: ['ذكاء اصطناعي', 'ذكي', 'اتمتة', 'تلقائي', 'أتمتة'],
      fr: ['ia', 'intelligence artificielle', 'intelligent', 'automatisation', 'automatiser'],
      es: ['ia', 'inteligencia artificial', 'inteligente', 'automatizacion', 'automatizar'],
      de: ['ki', 'kuenstliche intelligenz', 'intelligent', 'automatisierung', 'automatisch'],
      it: ['ia', 'intelligenza artificiale', 'intelligente', 'automazione', 'automatizzare'],
      pt: ['ia', 'inteligencia artificial', 'inteligente', 'automacao', 'automatizar'],
      el: ['τεχνητη νοημοσυνη', 'εξυπνο', 'αυτοματοποιηση'],
      zh: ['人工智能', '智能', '自动化', 'AI'],
      ja: ['AI', '人工知能', 'スマート', '自動化', '自動'],
      ko: ['AI', '인공지능', '스마트', '자동화', '자동']
    },
    support: {
      en: ['support', 'help', 'customer service', 'issue', 'problem', 'trouble', 'bug', 'error'],
      ar: ['دعم', 'مساعدة', 'مشكلة', 'خطأ'],
      fr: ['support', 'aide', 'service client', 'probleme', 'erreur'],
      es: ['soporte', 'ayuda', 'servicio', 'problema', 'error'],
      de: ['support', 'hilfe', 'kundendienst', 'problem', 'fehler'],
      it: ['supporto', 'aiuto', 'assistenza', 'problema', 'errore'],
      pt: ['suporte', 'ajuda', 'atendimento', 'problema', 'erro'],
      el: ['υποστηριξη', 'βοηθεια', 'προβλημα', 'σφαλμα'],
      zh: ['支持', '帮助', '客服', '问题', '错误'],
      ja: ['サポート', '助けて', 'ヘルプ', '問題', 'エラー'],
      ko: ['지원', '도움', '고객센터', '문제', '오류']
    },
    human: {
      en: ['speak', 'talk', 'human', 'person', 'agent', 'real person', 'someone', 'representative', 'call me'],
      ar: ['تحدث', 'شخص', 'موظف', 'اتصل', 'بشري', 'تحدث مع شخص'],
      fr: ['parler', 'humain', 'personne', 'agent', 'quelqu\'un', 'representant', 'parler a quelqu'],
      es: ['hablar', 'humano', 'persona', 'agente', 'alguien', 'representante', 'hablar con'],
      de: ['sprechen', 'mensch', 'person', 'mitarbeiter', 'jemand', 'mit jemandem sprechen'],
      it: ['parlare', 'umano', 'persona', 'operatore', 'qualcuno', 'parlare con qualcuno'],
      pt: ['falar', 'humano', 'pessoa', 'atendente', 'alguem', 'falar com alguem'],
      el: ['μιληστε', 'ανθρωπος', 'ατομο', 'καποιον', 'εκπροσωπο'],
      zh: ['转接人工', '人工', '客服', '真人', '联系'],
      ja: ['担当者', '人間', '繋いで', 'スタッフ', '話したい'],
      ko: ['상담사', '연결', '사람', '담당자', '상담원']
    },
    app: {
      en: ['app', 'download', 'mobile', 'android', 'iphone', 'ios', 'phone app', 'install'],
      ar: ['تطبيق', 'تحميل', 'جوال', 'اندرويد', 'ايفون', 'موبايل'],
      fr: ['app', 'application', 'telecharger', 'mobile', 'android', 'iphone'],
      es: ['app', 'aplicacion', 'descargar', 'movil', 'android', 'iphone'],
      de: ['app', 'herunterladen', 'mobil', 'android', 'iphone', 'installieren'],
      it: ['app', 'applicazione', 'scaricare', 'mobile', 'android', 'iphone'],
      pt: ['app', 'aplicativo', 'baixar', 'celular', 'android', 'iphone'],
      el: ['εφαρμογη', 'κατεβασμα', 'κινητο', 'android', 'iphone'],
      zh: ['应用', '下载', '手机', '安卓', '苹果', '安装'],
      ja: ['アプリ', 'ダウンロード', 'モバイル', 'スマホ', 'インストール'],
      ko: ['앱', '다운로드', '모바일', '스마트폰', '설치']
    },
    security: {
      en: ['secure', 'security', 'data protection', 'privacy', 'safe', 'gdpr'],
      ar: ['أمان', 'امان', 'حماية', 'خصوصية', 'آمن'],
      fr: ['securite', 'protection', 'confidentialite', 'rgpd', 'securise'],
      es: ['seguridad', 'proteccion', 'privacidad', 'gdpr', 'seguro'],
      de: ['sicherheit', 'datenschutz', 'schutz', 'dsgvo', 'sicher'],
      it: ['sicurezza', 'protezione', 'privacy', 'gdpr', 'sicuro'],
      pt: ['seguranca', 'protecao', 'privacidade', 'lgpd', 'seguro'],
      el: ['ασφαλεια', 'προστασια', 'απορρητο', 'gdpr'],
      zh: ['安全', '加密', '隐私', '数据保护', 'GDPR'],
      ja: ['セキュリティ', '安全', 'プライバシー', '暗号化', 'GDPR'],
      ko: ['보안', '안전', '개인정보', '암호화', 'GDPR']
    },
    language: {
      en: ['language', 'languages', 'arabic', 'french', 'spanish', 'german', 'italian', 'portuguese', 'chinese', 'japanese', 'korean', 'greek', 'multilingual', 'translate'],
      ar: ['لغة', 'لغات', 'عربي', 'فرنسي', 'اسباني', 'متعدد اللغات', 'ترجمة'],
      fr: ['langue', 'langues', 'multilingue', 'traduire', 'traduction'],
      es: ['idioma', 'idiomas', 'multilingue', 'traducir', 'traduccion'],
      de: ['sprache', 'sprachen', 'mehrsprachig', 'uebersetzen'],
      it: ['lingua', 'lingue', 'multilingue', 'tradurre', 'traduzione'],
      pt: ['idioma', 'idiomas', 'multilingue', 'traduzir', 'traducao'],
      el: ['γλωσσα', 'γλωσσες', 'πολυγλωσσο', 'μεταφραση'],
      zh: ['语言', '多语言', '翻译', '中文'],
      ja: ['言語', '多言語', '翻訳', '日本語'],
      ko: ['언어', '다국어', '번역', '한국어']
    },
    thanks: {
      en: ['thank', 'thanks', 'appreciate', 'cheers', 'great', 'perfect', 'awesome', 'amazing'],
      ar: ['شكرا', 'شكرًا', 'ممتاز', 'رائع', 'مثالي'],
      fr: ['merci', 'parfait', 'genial', 'super', 'excellent', 'formidable'],
      es: ['gracias', 'perfecto', 'genial', 'excelente', 'increible'],
      de: ['danke', 'dankeschoen', 'perfekt', 'toll', 'super', 'wunderbar', 'klasse'],
      it: ['grazie', 'perfetto', 'ottimo', 'fantastico', 'eccellente', 'bravo'],
      pt: ['obrigado', 'obrigada', 'perfeito', 'otimo', 'excelente', 'maravilhoso'],
      el: ['ευχαριστω', 'τελεια', 'υπεροχα', 'εξαιρετικα'],
      zh: ['谢谢', '感谢', '太好了', '完美', '棒'],
      ja: ['ありがとう', '感謝', '完璧', '素晴らしい', 'すごい'],
      ko: ['감사', '고마워', '완벽', '훌륭', '최고']
    },
    bye: {
      en: ['bye', 'goodbye', 'see you', 'later', 'take care', 'good night'],
      ar: ['مع السلامة', 'وداعا', 'باي', 'تصبح على خير'],
      fr: ['au revoir', 'a bientot', 'bonne nuit', 'adieu', 'bye'],
      es: ['adios', 'hasta luego', 'nos vemos', 'buenas noches', 'bye', 'chao'],
      de: ['tschuess', 'auf wiedersehen', 'bis bald', 'gute nacht', 'bye', 'ciao'],
      it: ['arrivederci', 'a presto', 'buonanotte', 'ciao', 'bye', 'addio'],
      pt: ['tchau', 'adeus', 'ate logo', 'ate mais', 'boa noite', 'bye'],
      el: ['αντιο', 'γεια σου', 'τα λεμε', 'καληνυχτα'],
      zh: ['再见', '拜拜', '回见', '晚安'],
      ja: ['さようなら', 'またね', 'おやすみ', 'バイバイ', 'では'],
      ko: ['안녕히', '잘가', '다음에', '바이', '좋은 밤']
    },
    yes: {
      en: ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'sounds good', 'interested', 'tell me more'],
      ar: ['نعم', 'اه', 'حسنا', 'طيب', 'تمام', 'موافق', 'اخبرني اكثر'],
      fr: ['oui', 'ouais', 'bien sur', 'ok', "d'accord", 'interesse'],
      es: ['si', 'claro', 'ok', 'vale', 'bueno', 'de acuerdo', 'interesado'],
      de: ['ja', 'klar', 'ok', 'einverstanden', 'interessiert', 'gerne', 'natuerlich'],
      it: ['si', 'certo', 'ok', 'va bene', 'interessato', 'volentieri', 'daccordo'],
      pt: ['sim', 'claro', 'ok', 'tudo bem', 'interessado', 'com certeza'],
      el: ['ναι', 'βεβαια', 'ενταξει', 'ενδιαφερομαι', 'φυσικα'],
      zh: ['是的', '好的', '可以', '行', '感兴趣', '没问题', '好'],
      ja: ['はい', 'ええ', 'いいですね', '興味あり', 'もっと教えて', 'オッケー'],
      ko: ['네', '예', '좋아요', '관심있어요', '알겠습니다', '괜찮아요']
    }
  };

  for (const [key, langs] of Object.entries(patterns)) {
    const keywords = [...(langs[lang] || []), ...(langs.en || [])];
    if (keywords.some(k => input.includes(k))) {
      if (key === 'booking' && ['demo', 'call', 'meeting'].some(w => input.includes(w))) return 'demo';
      return key;
    }
  }
  return null;
}

function isHandedOff(phone) {
  const session = conversations.get(phone);
  return session ? session.handedOff : false;
}

function resumeBot(phone) {
  const session = conversations.get(phone);
  if (session) session.handedOff = false;
}

module.exports = { handleIncomingMessage, isHandedOff, resumeBot };
