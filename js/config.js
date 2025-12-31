
// Configuration File for Pi Mining Mini App
const CONFIG = {
    // Bot and Links
    botLink: 'https://t.me/iMinePI_bot',
    supportBotLink: 'https://t.me/saadcrypto',
    videoTutorialLink: 'غير متاح حالياً',

    // Task Completion Settings
    taskCompletionDelay: 5000, // milliseconds (5 seconds)

    // Tier Settings
    tiers: {
        free: {
            id: 'free',
            name: 'الباقة المجانية',
            price: 0,
            miningRate: 1, // 0.06/60 (60 seconds)
            maxDaily: 60,
            tasksLimit: 2,
            isPremium: true
        },
        level1: {
            id: 'level1',
            name: 'المستوى الأول',
            price: 0,
            miningRate: 0.00011111, // 0.40/3600 (1 hour)
            maxDaily: 0.40,
            tasksLimit: 10,
            minDays: 2,
            roi: 14.50, // Total return (investment + profit)
            isPremium: true
        },
        level2: {
            id: 'level2',
            name: 'المستوى الثاني',
            price: 50,
            miningRate: 0.00041667, // 1.50/3600 (1 hour)
            maxDaily: 1.50,
            tasksLimit: 20,
            minDays: 3,
            roi: 86, // Total return
            isPremium: true
        },
        level3: {
            id: 'level3',
            name: 'المستوى الثالث',
            price: 100,
            miningRate: 0.00055556, // 2.00/3600 (1 hour)
            maxDaily: 2.00,
            tasksLimit: 30,
            minDays: 5,
            roi: 180, // Total return
            isPremium: true
        },
        level4: {
            id: 'level4',
            name: 'المستوى الرابع',
            price: 250,
            miningRate: 0.00111111, // 4.00/3600 (1 hour)
            maxDaily: 4.00,
            tasksLimit: 50,
            minDays: 7,
            roi: 880, // Total return
            isPremium: true
        },
        level5: {
            id: 'level5',
            name: 'المستوى الخامس',
            price: 500,
            miningRate: 0.00166667, // 6.00/3600 (1 hour)
            maxDaily: 6.00,
            tasksLimit: 100,
            minDays: 10,
            roi: 2500, // Total return
            isPremium: true
        }
    },

    // Task Rewards per Tier - Calculated: (total return ÷ days - mining) ÷ tasks
    taskRewards: {
        free: 0.02, // $0.002 per task × 2 tasks = $0.04
        level1: 0.685, // (14.50÷2 - 0.40) ÷ 10 = $6.85/day ÷ 10 tasks = $0.685
        level2: 1.35, // (86÷3 - 1.50) ÷ 20 = $27.167/day ÷ 20 tasks = $1.35833 → $1.35
        level3: 1.1333, // (180÷5 - 2.00) ÷ 30 = $34/day ÷ 30 tasks = $1.1333
        level4: 2.44, // (880÷7 - 4.00) ÷ 50 = $121.714/day ÷ 50 tasks = $2.4343 → $2.44
        level5: 2.44  // (2500÷10 - 6.00) ÷ 100 = $244/day ÷ 100 tasks = $2.44
    },

    // Promotional Messages Templates - Platform-wide (NOT tier-specific)
    messages: {
        telegram: `🚀 اكتشف منصة Pi Mining الاحترافية!

✨ تعدين يومي + مكافآت فورية
💰 عوائد مضمونة وسحب سريع
📈 باقات متعددة تبدأ من المجاني
🎯 مهام بسيطة = أرباح حقيقية
🔒 منصة آمنة وموثوقة 100%

🎥 شاهد الفيديو التعليمي:
{videoLink}

👉 ابدأ الربح الآن:
{botLink}`,

        facebook: `💎 Pi Mining - منصة التعدين الرقمي المتطورة!

⭐ تعدين مستمر على مدار الساعة
💸 سحب أرباحك خلال 24 ساعة
🎁 مكافآت يومية للمهام
📊 باقات مرنة تناسب الجميع
🏆 آلاف المستخدمين يربحون يومياً

📺 تعلم كيف تبدأ:
{videoLink}

🔗 انضم للمنصة:
{botLink}`,

        twitter: `🔥 منصة Pi Mining

⚡ مكافآت تعدين يومية
💰 باقات متعددة للربح
✅ مكافآت فورية للمهام
🎯 آمنة وموثوقة
📈 الآلاف يربحون يومياً

🎬 الشرح: {videoLink}
🔗 انضم الآن: {botLink}

#تعدين #دخل_سلبي #ربح_رقمي`,

        whatsapp: `💎 *Pi Mining - اربح يومياً!*

✨ تعدين + مهام = أرباح مضمونة
📊 باقات مرنة للجميع
💸 سحب سريع وآمن
🎥 فيديو تعليمي كامل

👉 ابدأ الآن: {botLink}
📺 تعلم المزيد: {videoLink}`,

        instagram: `🚀 Pi Mining - منصة دخلك الرقمي

✨ أرباح تعدين يومية
🎯 مهام بسيطة = أموال حقيقية
💰 سحب سريع (24 ساعة)
🔒 منصة آمنة 100%
📈 انضم للآلاف الذين يربحون يومياً

🎥 الشرح الكامل: {videoLink}
🔗 ابدأ الآن: {botLink}

#تعدين #دخل_سلبي #ربح_رقمي`,

        linkedin: `منصة التعدين الرقمي الاحترافية - Pi Mining

منصتنا توفر لك:
• مكافآت تعدين يومية تلقائية
• فرص ربح من خلال المهام
• باقات متعددة تناسب جميع الميزانيات
• عملية سحب آمنة خلال 24 ساعة
• مجتمع متنامي من المستخدمين الناجحين

تعلم المزيد: {videoLink}
انضم للمنصة: {botLink}

#دخل_رقمي #استثمار #منصة`,

        reddit: `🚀 اكتشفت Pi Mining - منصة دخل سلبي موثوقة!

أردت مشاركة هذه المنصة التي أستخدمها:

✅ تعدين يومي تلقائي
✅ مهام إضافية لدخل أكبر
✅ سحب سريع (24 ساعة)
✅ باقات ربح متعددة
✅ تدفع باستمرار

شاهد الشرح: {videoLink}
رابط المنصة: {botLink}

هذا ليس نصيحة مالية، ابحث بنفسك!`,

        discord: `@everyone 🚀 **منصة Pi Mining**

💎 **المميزات:**
• مكافآت تعدين يومية
• مكافآت إتمام المهام
• باقات ربح متعددة
• سحب آمن خلال 24 ساعة
• مجتمع ربح نشط

🎥 **الشرح:** {videoLink}
🔗 **انضم:** {botLink}`,

        tiktok: `🚀 Pi Mining - اربح يومياً!

💰 تعدين مستمر
🎯 مهام بسيطة
💸 سحب سريع
📈 باقات مرنة

تعلم: {videoLink}
ابدأ: {botLink}

#تعدين #ربح_من_النت #استثمار`,

        snapchat: `💎 Pi Mining ⚡

أرباح يومية ✅
سحب سريع 💸
انضم الآن! 👇

{botLink}`
    },

    // Platform Stats (initial values)
    platformStats: {
        activeMiners: 1247,
        totalMined: 45892,
        withdrawalsToday: 127,
        avgWithdrawal: 23.50
    },

    // Withdrawal Settings
    withdrawal: {
        minWithdrawalFree: 0.10, // Free tier: $0.06 mining + $0.04 tasks = $0.10 total
        processingTime: 'فوري',
        fees: 'مجاناً'
    },

    // Minimum withdrawal amounts per tier
    minWithdrawalAmounts: {
        free: 10,
        level1: 18,   // Tier price
        level2: 107,   // Tier price
        level3: 225,  // Tier price
        level4: 1100,  // Tier price
        level5: 3125   // Tier price
    },

    // Blocked Wallet Addresses (addresses that cannot withdraw)
    blockedWallets: [
        // Add blocked wallet addresses here (BEP20 format starting with 0x)
        // Example: '0x1234567890123456789012345678901234567890'
        '0xdddf860d09781db152753741e6f0058219640cfb',
        '0x67e50db47f506e5e55768d450dc768631b1dd28f',
        '0xac3236ecb2567b575b816abc1df9b3c51f83a04d',
        '0x2b5480cb9bcb27ea00a50b363388e0fce686ab5d',
        '0x8b6054d6a12a47c8932d33f599bd1f5fbb8bd5e4',
        '0xe4502de2a715598f609aa5621afd4022ce3782fc',
        '0xf30dfd765922b41a012beb4314d56b29a2c4ebc1',
        '0xc7cce02b18ae6bf17e5c929c117f0a1e5cf420a1',
        '0x94aa2c3dfe046252e49835c9212d4acd3a42c960',
        '0xe18483cb731bf21a052d16944cf2f4c9c604ed97',
        '0xb547c14e987ce63e33269c4b25d9ced637b6f2b3',
        '0xac38957bcce7cdc9e51e06bf05c27ae54bf52013',
        '0xfbc37aef34683b45c24bb6622cba76eab6ac02ef',
        '0x877ae496255e14ae72385c5c9dd68494a342f878',
        '0xcef125c93cec23c7fe1ca76f13a4011cdee94429',
        '0x34f5c355f89495b07a0b70ec4c52bd7572590c45',
        '0xDCB6Ea3988e80aDe3aEc73a9C3353545A4B97Ff9',
        '0x4e073d10127c6e7887160c5d2986c73ef8c5255e',
        '0xa52be37af3df54ab292c759b6c8498401165ea7e',
        '0x2843671ca7041dbb6db8ae499a2d95495f7ac9a0',
        '0x6cbe312a486286178f97b7ca32546da76ab76eed'
    ],

    // First-Time Upgrade Bonus (25% extra ROI)
    firstUpgradeBonus: {
        enabled: true,
        percentage: 25, // 25% bonus
        duration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        message: '🎁 عرض لأول ترقية فقط: احصل على 25% إضافية!'
    },

    // Social Proof - Active users per tier (simulated realistic numbers)
    tierPopularity: {
        free: 8547,
        level1: 2156,
        level2: 1843,
        level3: 967, // Most popular premium tier
        level4: 512,
        level5: 234
    },

    // Most popular tier (gets special highlighting)
    mostPopularTier: 'level3',

    // Scarcity messaging
    scarcityMessages: {
        level1: 'أماكن محدودة بهذا السعر - 15 متبقي!',
        level2: 'عرض حصري - 23 مكان متبقي فقط!',
        level3: 'الأكثر طلباً - 8 أماكن متبقية!',
        level4: 'VIP محدود - 12 مكان فقط!',
        level5: 'حصري جداً - 5 أماكن متبقية!'
    },

    // Missed earnings calculation settings
    missedEarningsAlert: {
        enabled: true,
        updateInterval: 60 * 60 * 1000, // Update hourly
        showAfterSeconds: 45 // Show popup after 45 seconds
    }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
