
// Configuration File for Pi Mining Mini App
const CONFIG = {
    // Bot and Links
    botLink: 'https://t.me/iMinePI_bot',
    supportBotLink: 'https://t.me/saadcrypto',
    videoTutorialLink: 'ØºÙØ± ÙØªØ§Ø­ Ø­Ø§ÙÙØ§Ù',

    // Task Completion Settings
    taskCompletionDelay: 5000, // milliseconds (5 seconds)

    // Tier Settings
    tiers: {
        free: {
            id: 'free',
            name: 'Ø§ÙØ¨Ø§ÙØ© Ø§ÙÙØ¬Ø§ÙÙØ©',
            price: 0,
            miningRate: 1, // 0.06/60 (60 seconds)
            maxDaily: 60,
            tasksLimit: 2,
            isPremium: false
        },
        level1: {
            id: 'level1',
            name: 'Ø§ÙÙØ³ØªÙÙ Ø§ÙØ£ÙÙ',
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
            name: 'Ø§ÙÙØ³ØªÙÙ Ø§ÙØ«Ø§ÙÙ',
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
            name: 'Ø§ÙÙØ³ØªÙÙ Ø§ÙØ«Ø§ÙØ«',
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
            name: 'Ø§ÙÙØ³ØªÙÙ Ø§ÙØ±Ø§Ø¨Ø¹',
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
            name: 'Ø§ÙÙØ³ØªÙÙ Ø§ÙØ®Ø§ÙØ³',
            price: 500,
            miningRate: 0.00166667, // 6.00/3600 (1 hour)
            maxDaily: 6.00,
            tasksLimit: 100,
            minDays: 10,
            roi: 2500, // Total return
            isPremium: true
        }
    },

    // Task Rewards per Tier - Calculated: (total return Ã· days - mining) Ã· tasks
    taskRewards: {
        free: 0.02, // $0.002 per task Ã 2 tasks = $0.04
        level1: 0.685, // (14.50Ã·2 - 0.40) Ã· 10 = $6.85/day Ã· 10 tasks = $0.685
        level2: 1.35, // (86Ã·3 - 1.50) Ã· 20 = $27.167/day Ã· 20 tasks = $1.35833 â $1.35
        level3: 1.1333, // (180Ã·5 - 2.00) Ã· 30 = $34/day Ã· 30 tasks = $1.1333
        level4: 2.44, // (880Ã·7 - 4.00) Ã· 50 = $121.714/day Ã· 50 tasks = $2.4343 â $2.44
        level5: 2.44  // (2500Ã·10 - 6.00) Ã· 100 = $244/day Ã· 100 tasks = $2.44
    },

    // Promotional Messages Templates - Platform-wide (NOT tier-specific)
    messages: {
        telegram: `ð Ø§ÙØªØ´Ù ÙÙØµØ© Pi Mining Ø§ÙØ§Ø­ØªØ±Ø§ÙÙØ©!

â¨ ØªØ¹Ø¯ÙÙ ÙÙÙÙ + ÙÙØ§ÙØ¢Øª ÙÙØ±ÙØ©
ð° Ø¹ÙØ§Ø¦Ø¯ ÙØ¶ÙÙÙØ© ÙØ³Ø­Ø¨ Ø³Ø±ÙØ¹
ð Ø¨Ø§ÙØ§Øª ÙØªØ¹Ø¯Ø¯Ø© ØªØ¨Ø¯Ø£ ÙÙ Ø§ÙÙØ¬Ø§ÙÙ
ð¯ ÙÙØ§Ù Ø¨Ø³ÙØ·Ø© = Ø£Ø±Ø¨Ø§Ø­ Ø­ÙÙÙÙØ©
ð ÙÙØµØ© Ø¢ÙÙØ© ÙÙÙØ«ÙÙØ© 100%

ð¥ Ø´Ø§ÙØ¯ Ø§ÙÙÙØ¯ÙÙ Ø§ÙØªØ¹ÙÙÙÙ:
{videoLink}

ð Ø§Ø¨Ø¯Ø£ Ø§ÙØ±Ø¨Ø­ Ø§ÙØ¢Ù:
{botLink}`,

        facebook: `ð Pi Mining - ÙÙØµØ© Ø§ÙØªØ¹Ø¯ÙÙ Ø§ÙØ±ÙÙÙ Ø§ÙÙØªØ·ÙØ±Ø©!

â­ ØªØ¹Ø¯ÙÙ ÙØ³ØªÙØ± Ø¹ÙÙ ÙØ¯Ø§Ø± Ø§ÙØ³Ø§Ø¹Ø©
ð¸ Ø³Ø­Ø¨ Ø£Ø±Ø¨Ø§Ø­Ù Ø®ÙØ§Ù 24 Ø³Ø§Ø¹Ø©
ð ÙÙØ§ÙØ¢Øª ÙÙÙÙØ© ÙÙÙÙØ§Ù
ð Ø¨Ø§ÙØ§Øª ÙØ±ÙØ© ØªÙØ§Ø³Ø¨ Ø§ÙØ¬ÙÙØ¹
ð Ø¢ÙØ§Ù Ø§ÙÙØ³ØªØ®Ø¯ÙÙÙ ÙØ±Ø¨Ø­ÙÙ ÙÙÙÙØ§Ù

ðº ØªØ¹ÙÙ ÙÙÙ ØªØ¨Ø¯Ø£:
{videoLink}

ð Ø§ÙØ¶Ù ÙÙÙÙØµØ©:
{botLink}`,

        twitter: `ð¥ ÙÙØµØ© Pi Mining

â¡ ÙÙØ§ÙØ¢Øª ØªØ¹Ø¯ÙÙ ÙÙÙÙØ©
ð° Ø¨Ø§ÙØ§Øª ÙØªØ¹Ø¯Ø¯Ø© ÙÙØ±Ø¨Ø­
â ÙÙØ§ÙØ¢Øª ÙÙØ±ÙØ© ÙÙÙÙØ§Ù
ð¯ Ø¢ÙÙØ© ÙÙÙØ«ÙÙØ©
ð Ø§ÙØ¢ÙØ§Ù ÙØ±Ø¨Ø­ÙÙ ÙÙÙÙØ§Ù

ð¬ Ø§ÙØ´Ø±Ø­: {videoLink}
ð Ø§ÙØ¶Ù Ø§ÙØ¢Ù: {botLink}

#ØªØ¹Ø¯ÙÙ #Ø¯Ø®Ù_Ø³ÙØ¨Ù #Ø±Ø¨Ø­_Ø±ÙÙÙ`,

        whatsapp: `ð *Pi Mining - Ø§Ø±Ø¨Ø­ ÙÙÙÙØ§Ù!*

â¨ ØªØ¹Ø¯ÙÙ + ÙÙØ§Ù = Ø£Ø±Ø¨Ø§Ø­ ÙØ¶ÙÙÙØ©
ð Ø¨Ø§ÙØ§Øª ÙØ±ÙØ© ÙÙØ¬ÙÙØ¹
ð¸ Ø³Ø­Ø¨ Ø³Ø±ÙØ¹ ÙØ¢ÙÙ
ð¥ ÙÙØ¯ÙÙ ØªØ¹ÙÙÙÙ ÙØ§ÙÙ

ð Ø§Ø¨Ø¯Ø£ Ø§ÙØ¢Ù: {botLink}
ðº ØªØ¹ÙÙ Ø§ÙÙØ²ÙØ¯: {videoLink}`,

        instagram: `ð Pi Mining - ÙÙØµØ© Ø¯Ø®ÙÙ Ø§ÙØ±ÙÙÙ

â¨ Ø£Ø±Ø¨Ø§Ø­ ØªØ¹Ø¯ÙÙ ÙÙÙÙØ©
ð¯ ÙÙØ§Ù Ø¨Ø³ÙØ·Ø© = Ø£ÙÙØ§Ù Ø­ÙÙÙÙØ©
ð° Ø³Ø­Ø¨ Ø³Ø±ÙØ¹ (24 Ø³Ø§Ø¹Ø©)
ð ÙÙØµØ© Ø¢ÙÙØ© 100%
ð Ø§ÙØ¶Ù ÙÙØ¢ÙØ§Ù Ø§ÙØ°ÙÙ ÙØ±Ø¨Ø­ÙÙ ÙÙÙÙØ§Ù

ð¥ Ø§ÙØ´Ø±Ø­ Ø§ÙÙØ§ÙÙ: {videoLink}
ð Ø§Ø¨Ø¯Ø£ Ø§ÙØ¢Ù: {botLink}

#ØªØ¹Ø¯ÙÙ #Ø¯Ø®Ù_Ø³ÙØ¨Ù #Ø±Ø¨Ø­_Ø±ÙÙÙ`,

        linkedin: `ÙÙØµØ© Ø§ÙØªØ¹Ø¯ÙÙ Ø§ÙØ±ÙÙÙ Ø§ÙØ§Ø­ØªØ±Ø§ÙÙØ© - Pi Mining

ÙÙØµØªÙØ§ ØªÙÙØ± ÙÙ:
â¢ ÙÙØ§ÙØ¢Øª ØªØ¹Ø¯ÙÙ ÙÙÙÙØ© ØªÙÙØ§Ø¦ÙØ©
â¢ ÙØ±Øµ Ø±Ø¨Ø­ ÙÙ Ø®ÙØ§Ù Ø§ÙÙÙØ§Ù
â¢ Ø¨Ø§ÙØ§Øª ÙØªØ¹Ø¯Ø¯Ø© ØªÙØ§Ø³Ø¨ Ø¬ÙÙØ¹ Ø§ÙÙÙØ²Ø§ÙÙØ§Øª
â¢ Ø¹ÙÙÙØ© Ø³Ø­Ø¨ Ø¢ÙÙØ© Ø®ÙØ§Ù 24 Ø³Ø§Ø¹Ø©
â¢ ÙØ¬ØªÙØ¹ ÙØªÙØ§ÙÙ ÙÙ Ø§ÙÙØ³ØªØ®Ø¯ÙÙÙ Ø§ÙÙØ§Ø¬Ø­ÙÙ

ØªØ¹ÙÙ Ø§ÙÙØ²ÙØ¯: {videoLink}
Ø§ÙØ¶Ù ÙÙÙÙØµØ©: {botLink}

#Ø¯Ø®Ù_Ø±ÙÙÙ #Ø§Ø³ØªØ«ÙØ§Ø± #ÙÙØµØ©`,

        reddit: `ð Ø§ÙØªØ´ÙØª Pi Mining - ÙÙØµØ© Ø¯Ø®Ù Ø³ÙØ¨Ù ÙÙØ«ÙÙØ©!

Ø£Ø±Ø¯Øª ÙØ´Ø§Ø±ÙØ© ÙØ°Ù Ø§ÙÙÙØµØ© Ø§ÙØªÙ Ø£Ø³ØªØ®Ø¯ÙÙØ§:

â ØªØ¹Ø¯ÙÙ ÙÙÙÙ ØªÙÙØ§Ø¦Ù
â ÙÙØ§Ù Ø¥Ø¶Ø§ÙÙØ© ÙØ¯Ø®Ù Ø£ÙØ¨Ø±
â Ø³Ø­Ø¨ Ø³Ø±ÙØ¹ (24 Ø³Ø§Ø¹Ø©)
â Ø¨Ø§ÙØ§Øª Ø±Ø¨Ø­ ÙØªØ¹Ø¯Ø¯Ø©
â ØªØ¯ÙØ¹ Ø¨Ø§Ø³ØªÙØ±Ø§Ø±

Ø´Ø§ÙØ¯ Ø§ÙØ´Ø±Ø­: {videoLink}
Ø±Ø§Ø¨Ø· Ø§ÙÙÙØµØ©: {botLink}

ÙØ°Ø§ ÙÙØ³ ÙØµÙØ­Ø© ÙØ§ÙÙØ©Ø Ø§Ø¨Ø­Ø« Ø¨ÙÙØ³Ù!`,

        discord: `@everyone ð **ÙÙØµØ© Pi Mining**

ð **Ø§ÙÙÙÙØ²Ø§Øª:**
â¢ ÙÙØ§ÙØ¢Øª ØªØ¹Ø¯ÙÙ ÙÙÙÙØ©
â¢ ÙÙØ§ÙØ¢Øª Ø¥ØªÙØ§Ù Ø§ÙÙÙØ§Ù
â¢ Ø¨Ø§ÙØ§Øª Ø±Ø¨Ø­ ÙØªØ¹Ø¯Ø¯Ø©
â¢ Ø³Ø­Ø¨ Ø¢ÙÙ Ø®ÙØ§Ù 24 Ø³Ø§Ø¹Ø©
â¢ ÙØ¬ØªÙØ¹ Ø±Ø¨Ø­ ÙØ´Ø·

ð¥ **Ø§ÙØ´Ø±Ø­:** {videoLink}
ð **Ø§ÙØ¶Ù:** {botLink}`,

        tiktok: `ð Pi Mining - Ø§Ø±Ø¨Ø­ ÙÙÙÙØ§Ù!

ð° ØªØ¹Ø¯ÙÙ ÙØ³ØªÙØ±
ð¯ ÙÙØ§Ù Ø¨Ø³ÙØ·Ø©
ð¸ Ø³Ø­Ø¨ Ø³Ø±ÙØ¹
ð Ø¨Ø§ÙØ§Øª ÙØ±ÙØ©

ØªØ¹ÙÙ: {videoLink}
Ø§Ø¨Ø¯Ø£: {botLink}

#ØªØ¹Ø¯ÙÙ #Ø±Ø¨Ø­_ÙÙ_Ø§ÙÙØª #Ø§Ø³ØªØ«ÙØ§Ø±`,

        snapchat: `ð Pi Mining â¡

Ø£Ø±Ø¨Ø§Ø­ ÙÙÙÙØ© â
Ø³Ø­Ø¨ Ø³Ø±ÙØ¹ ð¸
Ø§ÙØ¶Ù Ø§ÙØ¢Ù! ð

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
        processingTime: 'ÙÙØ±Ù',
        fees: 'ÙØ¬Ø§ÙØ§Ù'
    },

    // Minimum withdrawal amounts per tier
    minWithdrawalAmounts: {
        free: 0.10,
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
        message: 'ð Ø¹Ø±Ø¶ ÙØ£ÙÙ ØªØ±ÙÙØ© ÙÙØ·: Ø§Ø­ØµÙ Ø¹ÙÙ 25% Ø¥Ø¶Ø§ÙÙØ©!'
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
        level1: 'Ø£ÙØ§ÙÙ ÙØ­Ø¯ÙØ¯Ø© Ø¨ÙØ°Ø§ Ø§ÙØ³Ø¹Ø± - 15 ÙØªØ¨ÙÙ!',
        level2: 'Ø¹Ø±Ø¶ Ø­ØµØ±Ù - 23 ÙÙØ§Ù ÙØªØ¨ÙÙ ÙÙØ·!',
        level3: 'Ø§ÙØ£ÙØ«Ø± Ø·ÙØ¨Ø§Ù - 8 Ø£ÙØ§ÙÙ ÙØªØ¨ÙÙØ©!',
        level4: 'VIP ÙØ­Ø¯ÙØ¯ - 12 ÙÙØ§Ù ÙÙØ·!',
        level5: 'Ø­ØµØ±Ù Ø¬Ø¯Ø§Ù - 5 Ø£ÙØ§ÙÙ ÙØªØ¨ÙÙØ©!'
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
