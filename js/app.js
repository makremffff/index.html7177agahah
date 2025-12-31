const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Replace placeholders in promotional messages from config.js
function getPromotionalMessage(platform = 'telegram') {
    const message = CONFIG.messages[platform] || CONFIG.messages.telegram;
    return message
        .replace(/{videoLink}/g, CONFIG.videoTutorialLink)
        .replace(/{botLink}/g, CONFIG.botLink);
}


// Initialize Payment API with credentials from server
let paymentAPI = null;

// Fetch credentials securely from server
async function initializePaymentAPI() {
    try {
        const response = await fetch('get_credentials.php', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        const credentials = JSON.parse(text);

        if (credentials.error) {
            throw new Error(credentials.error);
        }

        paymentAPI = new PaymentAPI(credentials);
    } catch (error) {
        console.error('Failed to initialize Payment API:', error);
        showToast('فشل تحميل إعدادات الدفع. يرجى إعادة تحميل الصفحة.', 'error');
    }
}

// Initialize on app load
initializePaymentAPI();

const state = {
    user: {
        balance: 10,
        tier: 'free',
        tierData: null,
        minedToday: 0,
        tasksCompleted: [],
        miningActive: false,
        miningStartTime: null,
        totalMined: 0,
        memberSince: Date.now(),
        walletAddress: null,
        pendingPayments: [],
        pendingWithdrawals: [],
        withdrawalHistory: [],
        tasksResetTime: null,
        miningResetTime: null,
        hasWithdrawnFreeTier: false,
        hasUsedFirstUpgradeBonus: false,
        firstUpgradeBonusExpiry: null,
        lastMissedEarningsUpdate: null,
        totalMissedEarnings: 0,
        upgradeReminderShown: false
    },
    platform: {
        activeMiners: 1247,
        totalMined: 45892,
        withdrawalsToday: 127,
        avgWithdrawal: 23.50
    },
    pagination: {
        currentPage: 1,
        tasksPerPage: 10,
        withdrawalPage: 1,
        withdrawalsPerPage: 3
    },
    bonusTimer: {
        active: false,
        expiryTime: null
    }
};

// Use CONFIG.tiers from config.js - convert object to array
const tiers = Object.values(CONFIG.tiers);

const tasks = [
    { id: 'free_task1', title: 'شارك في مجموعة تليجرام', reward: CONFIG.taskRewards.free, type: 'telegram', minTier: 'free', message: getPromotionalMessage('telegram') },
    { id: 'free_task2', title: 'شارك مع صديق في تليجرام', reward: CONFIG.taskRewards.free, type: 'telegram', minTier: 'free', message: getPromotionalMessage('telegram') },

    // Level 1 - 10 tasks × $0.05 = $0.50
    { id: 'l1_task1', title: 'شارك على تليجرام', reward: CONFIG.taskRewards.level1, type: 'telegram', minTier: 'level1', message: getPromotionalMessage('telegram') },
    { id: 'l1_task2', title: 'شارك على فيسبوك', reward: CONFIG.taskRewards.level1, type: 'facebook', minTier: 'level1', message: getPromotionalMessage('facebook') },
    { id: 'l1_task3', title: 'شارك على تويتر', reward: CONFIG.taskRewards.level1, type: 'twitter', minTier: 'level1', message: getPromotionalMessage('twitter') },
    { id: 'l1_task4', title: 'شارك على واتساب', reward: CONFIG.taskRewards.level1, type: 'whatsapp', minTier: 'level1', message: getPromotionalMessage('whatsapp') },
    { id: 'l1_task5', title: 'شارك مجموعة تليجرام 2', reward: CONFIG.taskRewards.level1, type: 'telegram', minTier: 'level1', message: getPromotionalMessage('telegram') },
    { id: 'l1_task6', title: 'شارك قناة تليجرام 3', reward: CONFIG.taskRewards.level1, type: 'telegram', minTier: 'level1', message: getPromotionalMessage('telegram') },
    { id: 'l1_task7', title: 'شارك على انستجرام', reward: CONFIG.taskRewards.level1, type: 'instagram', minTier: 'level1', message: getPromotionalMessage('instagram') },
    { id: 'l1_task8', title: 'شارك على ريديت', reward: CONFIG.taskRewards.level1, type: 'reddit', minTier: 'level1', message: getPromotionalMessage('reddit') },
    { id: 'l1_task9', title: 'شارك مجموعة فيسبوك', reward: CONFIG.taskRewards.level1, type: 'facebook', minTier: 'level1', message: getPromotionalMessage('facebook') },
    { id: 'l1_task10', title: 'شارك على لينكد إن', reward: CONFIG.taskRewards.level1, type: 'linkedin', minTier: 'level1', message: getPromotionalMessage('linkedin') },

    // Level 2 - 20 tasks × $0.10 = $2.00
    { id: 'l2_task1', title: 'شارك تليجرام 1', reward: CONFIG.taskRewards.level2, type: 'telegram', minTier: 'level2', message: getPromotionalMessage('telegram') },
    { id: 'l2_task2', title: 'شارك فيسبوك 1', reward: CONFIG.taskRewards.level2, type: 'facebook', minTier: 'level2', message: getPromotionalMessage('facebook') },
    { id: 'l2_task3', title: 'شارك تويتر 1', reward: CONFIG.taskRewards.level2, type: 'twitter', minTier: 'level2', message: getPromotionalMessage('twitter') },
    { id: 'l2_task4', title: 'شارك واتساب 1', reward: CONFIG.taskRewards.level2, type: 'whatsapp', minTier: 'level2', message: getPromotionalMessage('whatsapp') },
    { id: 'l2_task5', title: 'شارك انستجرام 1', reward: CONFIG.taskRewards.level2, type: 'instagram', minTier: 'level2', message: getPromotionalMessage('instagram') },
    { id: 'l2_task6', title: 'شارك تليجرام 2', reward: CONFIG.taskRewards.level2, type: 'telegram', minTier: 'level2', message: getPromotionalMessage('telegram') },
    { id: 'l2_task7', title: 'شارك فيسبوك 2', reward: CONFIG.taskRewards.level2, type: 'facebook', minTier: 'level2', message: getPromotionalMessage('facebook') },
    { id: 'l2_task8', title: 'شارك تويتر 2', reward: CONFIG.taskRewards.level2, type: 'twitter', minTier: 'level2', message: getPromotionalMessage('twitter') },
    { id: 'l2_task9', title: 'شارك ريديت', reward: CONFIG.taskRewards.level2, type: 'reddit', minTier: 'level2', message: getPromotionalMessage('reddit') },
    { id: 'l2_task10', title: 'شارك لينكد إن', reward: CONFIG.taskRewards.level2, type: 'linkedin', minTier: 'level2', message: getPromotionalMessage('linkedin') },
    { id: 'l2_task11', title: 'شارك تليجرام 3', reward: CONFIG.taskRewards.level2, type: 'telegram', minTier: 'level2', message: getPromotionalMessage('telegram') },
    { id: 'l2_task12', title: 'شارك واتساب 2', reward: CONFIG.taskRewards.level2, type: 'whatsapp', minTier: 'level2', message: getPromotionalMessage('whatsapp') },
    { id: 'l2_task13', title: 'شارك فيسبوك 3', reward: CONFIG.taskRewards.level2, type: 'facebook', minTier: 'level2', message: getPromotionalMessage('facebook') },
    { id: 'l2_task14', title: 'شارك انستجرام 2', reward: CONFIG.taskRewards.level2, type: 'instagram', minTier: 'level2', message: getPromotionalMessage('instagram') },
    { id: 'l2_task15', title: 'شارك تويتر 3', reward: CONFIG.taskRewards.level2, type: 'twitter', minTier: 'level2', message: getPromotionalMessage('twitter') },
    { id: 'l2_task16', title: 'شارك تليجرام 4', reward: CONFIG.taskRewards.level2, type: 'telegram', minTier: 'level2', message: getPromotionalMessage('telegram') },
    { id: 'l2_task17', title: 'شارك ديسكورد', reward: CONFIG.taskRewards.level2, type: 'discord', minTier: 'level2', message: getPromotionalMessage('discord') },
    { id: 'l2_task18', title: 'شارك تيك توك', reward: CONFIG.taskRewards.level2, type: 'tiktok', minTier: 'level2', message: getPromotionalMessage('tiktok') },
    { id: 'l2_task19', title: 'شارك سناب شات', reward: CONFIG.taskRewards.level2, type: 'snapchat', minTier: 'level2', message: getPromotionalMessage('snapchat') },
    { id: 'l2_task20', title: 'شارك تيليجرام 5', reward: CONFIG.taskRewards.level2, type: 'telegram', minTier: 'level2', message: getPromotionalMessage('telegram') },

    // Level 3 - 30 tasks × $0.15 = $4.50
    { id: 'l3_task1', title: 'شارك تليجرام 1', reward: CONFIG.taskRewards.level3, type: 'telegram', minTier: 'level3', message: getPromotionalMessage('telegram') },
    { id: 'l3_task2', title: 'شارك فيسبوك 1', reward: CONFIG.taskRewards.level3, type: 'facebook', minTier: 'level3', message: getPromotionalMessage('facebook') },
    { id: 'l3_task3', title: 'شارك تويتر 1', reward: CONFIG.taskRewards.level3, type: 'twitter', minTier: 'level3', message: getPromotionalMessage('twitter') },
    { id: 'l3_task4', title: 'شارك واتساب 1', reward: CONFIG.taskRewards.level3, type: 'whatsapp', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task5', title: 'شارك انستجرام 1', reward: CONFIG.taskRewards.level3, type: 'instagram', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task6', title: 'شارك تليجرام 2', reward: CONFIG.taskRewards.level3, type: 'telegram', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task7', title: 'شارك فيسبوك 2', reward: CONFIG.taskRewards.level3, type: 'facebook', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task8', title: 'شارك تويتر 2', reward: CONFIG.taskRewards.level3, type: 'twitter', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task9', title: 'شارك لينكد إن', reward: CONFIG.taskRewards.level3, type: 'linkedin', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task10', title: 'شارك ريديت', reward: CONFIG.taskRewards.level3, type: 'reddit', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task11', title: 'شارك تليجرام 3', reward: CONFIG.taskRewards.level3, type: 'telegram', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task12', title: 'شارك واتساب 2', reward: CONFIG.taskRewards.level3, type: 'whatsapp', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task13', title: 'شارك فيسبوك 3', reward: CONFIG.taskRewards.level3, type: 'facebook', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task14', title: 'شارك انستجرام 3', reward: CONFIG.taskRewards.level3, type: 'instagram', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task15', title: 'شارك تويتر 3', reward: CONFIG.taskRewards.level3, type: 'twitter', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task16', title: 'شارك تليجرام 4', reward: CONFIG.taskRewards.level3, type: 'telegram', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task17', title: 'شارك ديسكورد', reward: CONFIG.taskRewards.level3, type: 'discord', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task18', title: 'شارك تيك توك', reward: CONFIG.taskRewards.level3, type: 'tiktok', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task19', title: 'شارك سناب شات', reward: CONFIG.taskRewards.level3, type: 'snapchat', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task20', title: 'شارك تيليجرام 5', reward: CONFIG.taskRewards.level3, type: 'telegram', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task21', title: 'شارك فيسبوك 4', reward: CONFIG.taskRewards.level3, type: 'facebook', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task22', title: 'شارك تويتر 4', reward: CONFIG.taskRewards.level3, type: 'twitter', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task23', title: 'شارك واتساب 3', reward: CONFIG.taskRewards.level3, type: 'whatsapp', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task24', title: 'شارك انستجرام 3', reward: CONFIG.taskRewards.level3, type: 'instagram', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task25', title: 'شارك لينكد إن 2', reward: CONFIG.taskRewards.level3, type: 'linkedin', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task26', title: 'شارك ريديت 2', reward: CONFIG.taskRewards.level3, type: 'reddit', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task27', title: 'شارك تليجرام 6', reward: CONFIG.taskRewards.level3, type: 'telegram', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task28', title: 'شارك فيسبوك 5', reward: CONFIG.taskRewards.level3, type: 'facebook', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task29', title: 'شارك تويتر 5', reward: CONFIG.taskRewards.level3, type: 'twitter', minTier: 'level3', message: getPromotionalMessage('general') },
    { id: 'l3_task30', title: 'شارك تيليجرام 7', reward: CONFIG.taskRewards.level3, type: 'telegram', minTier: 'level3', message: getPromotionalMessage('general') },

    // Level 4 - 50 tasks × $0.25 = $12.50
    { id: 'l4_task1', title: 'شارك تليجرام 1', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task2', title: 'شارك فيسبوك 1', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task3', title: 'شارك تويتر 1', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task4', title: 'شارك واتساب 1', reward: CONFIG.taskRewards.level4, type: 'whatsapp', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task5', title: 'شارك انستجرام 1', reward: CONFIG.taskRewards.level4, type: 'instagram', minTier: 'level4', message: getPromotionalMessage('general') },
    // ... (continue pattern for 50 tasks with $0.25 each, various platforms)
    { id: 'l4_task6', title: 'شارك تليجرام 2', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task7', title: 'شارك فيسبوك 2', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task8', title: 'شارك تويتر 2', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task9', title: 'شارك لينكد إن', reward: CONFIG.taskRewards.level4, type: 'linkedin', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task10', title: 'شارك ريديت', reward: CONFIG.taskRewards.level4, type: 'reddit', minTier: 'level4', message: getPromotionalMessage('general') },
    // Add 40 more tasks following the same pattern with various platforms and messages
    { id: 'l4_task11', title: 'شارك تليجرام 3', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task12', title: 'شارك واتساب 2', reward: CONFIG.taskRewards.level4, type: 'whatsapp', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task13', title: 'شارك فيسبوك 3', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task14', title: 'شارك انستجرام 2', reward: CONFIG.taskRewards.level4, type: 'instagram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task15', title: 'شارك تويتر 3', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task16', title: 'شارك تليجرام 4', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task17', title: 'شارك ديسكورد', reward: CONFIG.taskRewards.level4, type: 'discord', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task18', title: 'شارك تيك توك', reward: CONFIG.taskRewards.level4, type: 'tiktok', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task19', title: 'شارك سناب شات', reward: CONFIG.taskRewards.level4, type: 'snapchat', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task20', title: 'شارك تيليجرام 5', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task21', title: 'شارك فيسبوك 4', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task22', title: 'شارك تويتر 4', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task23', title: 'شارك واتساب 3', reward: CONFIG.taskRewards.level4, type: 'whatsapp', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task24', title: 'شارك انستجرام 3', reward: CONFIG.taskRewards.level4, type: 'instagram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task25', title: 'شارك لينكد إن 2', reward: CONFIG.taskRewards.level4, type: 'linkedin', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task26', title: 'شارك ريديت 2', reward: CONFIG.taskRewards.level4, type: 'reddit', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task27', title: 'شارك تليجرام 6', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task28', title: 'شارك فيسبوك 5', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task29', title: 'شارك تويتر 5', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task30', title: 'شارك تيليجرام 7', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task31', title: 'شارك واتساب 4', reward: CONFIG.taskRewards.level4, type: 'whatsapp', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task32', title: 'شارك فيسبوك 6', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task33', title: 'شارك انستجرام 4', reward: CONFIG.taskRewards.level4, type: 'instagram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task34', title: 'شارك تويتر 6', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task35', title: 'شارك تليجرام 8', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task36', title: 'شارك ديسكورد 2', reward: CONFIG.taskRewards.level4, type: 'discord', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task37', title: 'شارك تيك توك 2', reward: CONFIG.taskRewards.level4, type: 'tiktok', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task38', title: 'شارك سناب شات 2', reward: CONFIG.taskRewards.level4, type: 'snapchat', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task39', title: 'شارك تيليجرام 9', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task40', title: 'شارك فيسبوك 7', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task41', title: 'شارك تويتر 7', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task42', title: 'شارك واتساب 5', reward: CONFIG.taskRewards.level4, type: 'whatsapp', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task43', title: 'شارك انستجرام 3', reward: CONFIG.taskRewards.level4, type: 'instagram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task44', title: 'شارك لينكد إن 3', reward: CONFIG.taskRewards.level4, type: 'linkedin', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task45', title: 'شارك ريديت 3', reward: CONFIG.taskRewards.level4, type: 'reddit', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task46', title: 'شارك تليجرام 10', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task47', title: 'شارك فيسبوك 8', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task48', title: 'شارك تويتر 8', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task49', title: 'شارك تيليجرام 11', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task50', title: 'شارك واتساب 6', reward: CONFIG.taskRewards.level4, type: 'whatsapp', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task51', title: 'شارك فيسبوك 9', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task52', title: 'شارك تويتر 9', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task53', title: 'شارك انستجرام 6', reward: CONFIG.taskRewards.level4, type: 'instagram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task54', title: 'شارك لينكد إن 4', reward: CONFIG.taskRewards.level4, type: 'linkedin', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task55', title: 'شارك ريديت 4', reward: CONFIG.taskRewards.level4, type: 'reddit', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task56', title: 'شارك تليجرام 12', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task57', title: 'شارك ديسكورد 3', reward: CONFIG.taskRewards.level4, type: 'discord', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task58', title: 'شارك تيك توك 3', reward: CONFIG.taskRewards.level4, type: 'tiktok', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task59', title: 'شارك سناب شات 3', reward: CONFIG.taskRewards.level4, type: 'snapchat', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task60', title: 'شارك واتساب 7', reward: CONFIG.taskRewards.level4, type: 'whatsapp', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task61', title: 'شارك فيسبوك 10', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task62', title: 'شارك تويتر 10', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task63', title: 'شارك تليجرام 13', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task64', title: 'شارك انستجرام 7', reward: CONFIG.taskRewards.level4, type: 'instagram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task65', title: 'شارك لينكد إن 5', reward: CONFIG.taskRewards.level4, type: 'linkedin', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task66', title: 'شارك ريديت 5', reward: CONFIG.taskRewards.level4, type: 'reddit', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task67', title: 'شارك تليجرام 14', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task68', title: 'شارك واتساب 8', reward: CONFIG.taskRewards.level4, type: 'whatsapp', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task69', title: 'شارك فيسبوك 11', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task70', title: 'شارك تويتر 11', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task71', title: 'شارك ديسكورد 4', reward: CONFIG.taskRewards.level4, type: 'discord', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task72', title: 'شارك تيك توك 4', reward: CONFIG.taskRewards.level4, type: 'tiktok', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task73', title: 'شارك سناب شات 4', reward: CONFIG.taskRewards.level4, type: 'snapchat', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task74', title: 'شارك تليجرام 15', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task75', title: 'شارك انستجرام 8', reward: CONFIG.taskRewards.level4, type: 'instagram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task76', title: 'شارك فيسبوك 12', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task77', title: 'شارك تويتر 12', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task78', title: 'شارك واتساب 9', reward: CONFIG.taskRewards.level4, type: 'whatsapp', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task79', title: 'شارك لينكد إن 6', reward: CONFIG.taskRewards.level4, type: 'linkedin', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task80', title: 'شارك ريديت 6', reward: CONFIG.taskRewards.level4, type: 'reddit', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task81', title: 'شارك تليجرام 16', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task82', title: 'شارك فيسبوك 13', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task83', title: 'شارك تويتر 13', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task84', title: 'شارك انستجرام 9', reward: CONFIG.taskRewards.level4, type: 'instagram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task85', title: 'شارك ديسكورد 5', reward: CONFIG.taskRewards.level4, type: 'discord', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task86', title: 'شارك تيك توك 5', reward: CONFIG.taskRewards.level4, type: 'tiktok', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task87', title: 'شارك سناب شات 5', reward: CONFIG.taskRewards.level4, type: 'snapchat', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task88', title: 'شارك واتساب 10', reward: CONFIG.taskRewards.level4, type: 'whatsapp', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task89', title: 'شارك فيسبوك 14', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task90', title: 'شارك تويتر 14', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task91', title: 'شارك تليجرام 17', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task92', title: 'شارك انستجرام 10', reward: CONFIG.taskRewards.level4, type: 'instagram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task93', title: 'شارك لينكد إن 7', reward: CONFIG.taskRewards.level4, type: 'linkedin', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task94', title: 'شارك ريديت 7', reward: CONFIG.taskRewards.level4, type: 'reddit', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task95', title: 'شارك تليجرام 18', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task96', title: 'شارك واتساب 11', reward: CONFIG.taskRewards.level4, type: 'whatsapp', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task97', title: 'شارك فيسبوك 15', reward: CONFIG.taskRewards.level4, type: 'facebook', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task98', title: 'شارك تويتر 15', reward: CONFIG.taskRewards.level4, type: 'twitter', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task99', title: 'شارك ديسكورد 6', reward: CONFIG.taskRewards.level4, type: 'discord', minTier: 'level4', message: getPromotionalMessage('general') },
    { id: 'l4_task100', title: 'شارك تيليجرام 19', reward: CONFIG.taskRewards.level4, type: 'telegram', minTier: 'level4', message: getPromotionalMessage('general') },

    // Level 5 - 100 tasks × $0.20 = $20.00
    // (I'll create 20 sample tasks for level 5 to demonstrate the pattern - you can expand to 100)
    { id: 'l5_task1', title: 'شارك تليجرام 1', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task2', title: 'شارك فيسبوك 1', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task3', title: 'شارك تويتر 1', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task4', title: 'شارك واتساب 1', reward: CONFIG.taskRewards.level5, type: 'whatsapp', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task5', title: 'شارك انستجرام 1', reward: CONFIG.taskRewards.level5, type: 'instagram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task6', title: 'شارك تليجرام 2', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task7', title: 'شارك فيسبوك 2', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task8', title: 'شارك تويتر 2', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task9', title: 'شارك لينكد إن', reward: CONFIG.taskRewards.level5, type: 'linkedin', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task10', title: 'شارك ريديت', reward: CONFIG.taskRewards.level5, type: 'reddit', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task11', title: 'شارك تليجرام 3', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task12', title: 'شارك واتساب 2', reward: CONFIG.taskRewards.level5, type: 'whatsapp', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task13', title: 'شارك فيسبوك 3', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task14', title: 'شارك انستجرام 2', reward: CONFIG.taskRewards.level5, type: 'instagram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task15', title: 'شارك تويتر 3', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task16', title: 'شارك تليجرام 4', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task17', title: 'شارك ديسكورد', reward: CONFIG.taskRewards.level5, type: 'discord', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task18', title: 'شارك تيك توك', reward: CONFIG.taskRewards.level5, type: 'tiktok', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task19', title: 'شارك سناب شات', reward: CONFIG.taskRewards.level5, type: 'snapchat', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task20', title: 'شارك تيليجرام 5', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task21', title: 'شارك فيسبوك 4', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task22', title: 'شارك تويتر 4', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task23', title: 'شارك واتساب 3', reward: CONFIG.taskRewards.level5, type: 'whatsapp', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task24', title: 'شارك انستجرام 3', reward: CONFIG.taskRewards.level5, type: 'instagram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task25', title: 'شارك لينكد إن 2', reward: CONFIG.taskRewards.level5, type: 'linkedin', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task26', title: 'شارك ريديت 2', reward: CONFIG.taskRewards.level5, type: 'reddit', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task27', title: 'شارك تليجرام 6', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task28', title: 'شارك فيسبوك 5', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task29', title: 'شارك تويتر 5', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task30', title: 'شارك تيليجرام 7', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task31', title: 'شارك واتساب 4', reward: CONFIG.taskRewards.level5, type: 'whatsapp', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task32', title: 'شارك فيسبوك 6', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task33', title: 'شارك انستجرام 4', reward: CONFIG.taskRewards.level5, type: 'instagram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task34', title: 'شارك تويتر 6', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task35', title: 'شارك تليجرام 8', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task36', title: 'شارك ديسكورد 2', reward: CONFIG.taskRewards.level5, type: 'discord', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task37', title: 'شارك تيك توك 2', reward: CONFIG.taskRewards.level5, type: 'tiktok', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task38', title: 'شارك سناب شات 2', reward: CONFIG.taskRewards.level5, type: 'snapchat', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task39', title: 'شارك تيليجرام 9', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task40', title: 'شارك فيسبوك 7', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task41', title: 'شارك تويتر 7', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task42', title: 'شارك واتساب 5', reward: CONFIG.taskRewards.level5, type: 'whatsapp', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task43', title: 'شارك انستجرام 5', reward: CONFIG.taskRewards.level5, type: 'instagram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task44', title: 'شارك لينكد إن 3', reward: CONFIG.taskRewards.level5, type: 'linkedin', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task45', title: 'شارك ريديت 3', reward: CONFIG.taskRewards.level5, type: 'reddit', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task46', title: 'شارك تليجرام 10', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task47', title: 'شارك فيسبوك 8', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task48', title: 'شارك تويتر 8', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task49', title: 'شارك تيليجرام 11', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task50', title: 'شارك واتساب 6', reward: CONFIG.taskRewards.level5, type: 'whatsapp', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task51', title: 'شارك فيسبوك 9', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task52', title: 'شارك تويتر 9', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task53', title: 'شارك انستجرام 6', reward: CONFIG.taskRewards.level5, type: 'instagram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task54', title: 'شارك لينكد إن 4', reward: CONFIG.taskRewards.level5, type: 'linkedin', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task55', title: 'شارك ريديت 4', reward: CONFIG.taskRewards.level5, type: 'reddit', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task56', title: 'شارك تليجرام 12', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task57', title: 'شارك ديسكورد 3', reward: CONFIG.taskRewards.level5, type: 'discord', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task58', title: 'شارك تيك توك 3', reward: CONFIG.taskRewards.level5, type: 'tiktok', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task59', title: 'شارك سناب شات 3', reward: CONFIG.taskRewards.level5, type: 'snapchat', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task60', title: 'شارك واتساب 7', reward: CONFIG.taskRewards.level5, type: 'whatsapp', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task61', title: 'شارك فيسبوك 10', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task62', title: 'شارك تويتر 10', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task63', title: 'شارك تليجرام 13', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task64', title: 'شارك انستجرام 7', reward: CONFIG.taskRewards.level5, type: 'instagram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task65', title: 'شارك لينكد إن 5', reward: CONFIG.taskRewards.level5, type: 'linkedin', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task66', title: 'شارك ريديت 5', reward: CONFIG.taskRewards.level5, type: 'reddit', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task67', title: 'شارك تليجرام 14', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task68', title: 'شارك واتساب 8', reward: CONFIG.taskRewards.level5, type: 'whatsapp', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task69', title: 'شارك فيسبوك 11', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task70', title: 'شارك تويتر 11', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task71', title: 'شارك ديسكورد 4', reward: CONFIG.taskRewards.level5, type: 'discord', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task72', title: 'شارك تيك توك 4', reward: CONFIG.taskRewards.level5, type: 'tiktok', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task73', title: 'شارك سناب شات 4', reward: CONFIG.taskRewards.level5, type: 'snapchat', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task74', title: 'شارك تليجرام 15', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task75', title: 'شارك انستجرام 8', reward: CONFIG.taskRewards.level5, type: 'instagram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task76', title: 'شارك فيسبوك 12', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task77', title: 'شارك تويتر 12', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task78', title: 'شارك واتساب 9', reward: CONFIG.taskRewards.level5, type: 'whatsapp', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task79', title: 'شارك لينكد إن 6', reward: CONFIG.taskRewards.level5, type: 'linkedin', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task80', title: 'شارك ريديت 6', reward: CONFIG.taskRewards.level5, type: 'reddit', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task81', title: 'شارك تليجرام 16', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task82', title: 'شارك فيسبوك 13', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task83', title: 'شارك تويتر 13', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task84', title: 'شارك انستجرام 9', reward: CONFIG.taskRewards.level5, type: 'instagram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task85', title: 'شارك ديسكورد 5', reward: CONFIG.taskRewards.level5, type: 'discord', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task86', title: 'شارك تيك توك 5', reward: CONFIG.taskRewards.level5, type: 'tiktok', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task87', title: 'شارك سناب شات 5', reward: CONFIG.taskRewards.level5, type: 'snapchat', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task88', title: 'شارك واتساب 10', reward: CONFIG.taskRewards.level5, type: 'whatsapp', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task89', title: 'شارك فيسبوك 14', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task90', title: 'شارك تويتر 14', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task91', title: 'شارك تليجرام 17', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task92', title: 'شارك انستجرام 10', reward: CONFIG.taskRewards.level5, type: 'instagram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task93', title: 'شارك لينكد إن 7', reward: CONFIG.taskRewards.level5, type: 'linkedin', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task94', title: 'شارك ريديت 7', reward: CONFIG.taskRewards.level5, type: 'reddit', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task95', title: 'شارك تليجرام 18', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task96', title: 'شارك واتساب 11', reward: CONFIG.taskRewards.level5, type: 'whatsapp', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task97', title: 'شارك فيسبوك 15', reward: CONFIG.taskRewards.level5, type: 'facebook', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task98', title: 'شارك تويتر 15', reward: CONFIG.taskRewards.level5, type: 'twitter', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task99', title: 'شارك ديسكورد 6', reward: CONFIG.taskRewards.level5, type: 'discord', minTier: 'level5', message: getPromotionalMessage('general') },
    { id: 'l5_task100', title: 'شارك تيليجرام 19', reward: CONFIG.taskRewards.level5, type: 'telegram', minTier: 'level5', message: getPromotionalMessage('general') }
];

function init() {
    loadUserData();
    checkPendingTaskCompletions();
    initializeBonusSystem();
    startMissedEarningsTracking();

    // Wait for DOM to be fully ready before rendering UI
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            renderUI();
            setupEventListeners();
            startMiningCheck();
            startLiveStats();
            startActivityFeed();
            checkPendingWithdrawals();
            scheduleUpgradeReminder();
            showLiveUpgradeNotifications();
        });
    } else {
        renderUI();
        setupEventListeners();
        startMiningCheck();
        startLiveStats();
        startActivityFeed();
        checkPendingWithdrawals();
        scheduleUpgradeReminder();
        showLiveUpgradeNotifications();
    }
}

function initializeBonusSystem() {
    // Set bonus expiry if user is free tier and hasn't used bonus
    if (state.user.tier === 'free' && !state.user.hasUsedFirstUpgradeBonus && !state.user.firstUpgradeBonusExpiry) {
        state.user.firstUpgradeBonusExpiry = Date.now() + CONFIG.firstUpgradeBonus.duration;
        saveUserData();
    }

    // Check if bonus has expired
    if (state.user.firstUpgradeBonusExpiry && Date.now() > state.user.firstUpgradeBonusExpiry && !state.user.hasUsedFirstUpgradeBonus) {
        state.user.hasUsedFirstUpgradeBonus = true; // Mark as expired
        saveUserData();
    }

    // Set bonus timer active if applicable
    if (state.user.tier === 'free' && !state.user.hasUsedFirstUpgradeBonus && state.user.firstUpgradeBonusExpiry) {
        state.bonusTimer.active = true;
        state.bonusTimer.expiryTime = state.user.firstUpgradeBonusExpiry;
        startBonusCountdown();
    }
}

function startBonusCountdown() {
    if (!state.bonusTimer.active) return;

    const updateBonusTimer = () => {
        if (!state.bonusTimer.expiryTime) return;

        const now = Date.now();
        const remaining = state.bonusTimer.expiryTime - now;

        if (remaining <= 0) {
            state.bonusTimer.active = false;
            state.user.hasUsedFirstUpgradeBonus = true;
            saveUserData();
            renderTiers(); // Re-render to remove bonus
            return;
        }

        // Update all bonus timers on page
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        const timerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        document.querySelectorAll('.bonus-countdown-timer').forEach(el => {
            el.textContent = timerText;
        });

        requestAnimationFrame(updateBonusTimer);
    };

    updateBonusTimer();
}

function startMissedEarningsTracking() {
    // Calculate missed earnings every hour
    const calculateMissedEarnings = () => {
        if (state.user.tier !== 'free') return;

        const now = Date.now();
        const membershipDuration = now - state.user.memberSince;
        const hoursAsMember = membershipDuration / (1000 * 60 * 60);

        // Calculate what they could have earned with level1 (lowest premium)
        const level1Tier = tiers.find(t => t.id === 'level1');
        const potentialMiningEarnings = hoursAsMember * level1Tier.miningRate * 3600; // Convert to hourly
        const potentialTaskEarnings = Math.floor(hoursAsMember / 24) * CONFIG.taskRewards.level1 * level1Tier.tasksLimit;

        state.user.totalMissedEarnings = potentialMiningEarnings + potentialTaskEarnings - state.user.totalMined;
        state.user.lastMissedEarningsUpdate = now;
        saveUserData();
    };

    calculateMissedEarnings();
    setInterval(calculateMissedEarnings, CONFIG.missedEarningsAlert.updateInterval);
}

function scheduleUpgradeReminder() {
    if (state.user.tier !== 'free' || state.user.upgradeReminderShown) return;

    setTimeout(() => {
        if (state.user.tier === 'free') {
            showUpgradeReminderPopup();
            state.user.upgradeReminderShown = true;
            saveUserData();
        }
    }, CONFIG.missedEarningsAlert.showAfterSeconds * 1000);
}

function showUpgradeReminderPopup() {
    const level1Tier = tiers.find(t => t.id === 'level1');
    const potentialDaily = level1Tier.maxDaily + (CONFIG.taskRewards.level1 * level1Tier.tasksLimit);
    const currentDaily = state.user.tierData.maxDaily + (CONFIG.taskRewards.free * state.user.tierData.tasksLimit);
    const missedDaily = potentialDaily - currentDaily;

    showModal(
        '⚠️ تفوتك أرباح ضخمة!',
        `
            <div style="text-align: center;">
                <div style="font-size: 64px; margin-bottom: 16px;">💸</div>
                <p style="font-size: 16px; color: #FF6B6B; font-weight: 700; margin-bottom: 16px;">أنت تخسر ${missedDaily.toFixed(4)}$ يومياً!</p>
                <div style="background: linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 107, 107, 0.05)); padding: 20px; border-radius: 16px; margin: 20px 0; border: 1px solid rgba(255, 107, 107, 0.3);">
                    <div style="font-size: 14px; color: #B4B4C8; margin-bottom: 12px;">رصيدك الحالي</div>
                    <div style="font-size: 32px; font-weight: 900; color: #FFB800; margin-bottom: 16px;">$${state.user.balance.toFixed(4)}</div>
                    <div style="height: 1px; background: rgba(255, 255, 255, 0.1); margin: 16px 0;"></div>
                    <div style="font-size: 14px; color: #B4B4C8; margin-bottom: 12px;">كان يمكن أن يكون</div>
                    <div style="font-size: 32px; font-weight: 900; color: #00F5A0; margin-bottom: 8px;">$${(state.user.balance + state.user.totalMissedEarnings).toFixed(4)}</div>
                    <div style="font-size: 13px; color: #FF6B6B;">فقدت ${state.user.totalMissedEarnings.toFixed(4)}$ حتى الآن!</div>
                </div>
                <div style="background: rgba(0, 245, 160, 0.1); padding: 16px; border-radius: 12px; border: 1px solid rgba(0, 245, 160, 0.3);">
                    <p style="font-size: 14px; color: #00F5A0; font-weight: 600; margin: 0;">🚀 ترقيتك الآن توقف النزيف وتبدأ الربح الحقيقي!</p>
                </div>
            </div>
        `,
        [
            {
                text: '💰 ترقية الآن واسترجع أرباحي!', action: () => {
                    closeModal();
                    switchPage('tiers');
                }
            },
            { text: 'ربما لاحقاً', action: closeModal }
        ]
    );
}

function showLiveUpgradeNotifications() {
    const upgradeMessages = [
        'محمد_أحمد قام بالترقية إلى المستوى الثالث',
        'Sarah_Ali ترقت للمستوى الثاني',
        'عبدالله_يوسف اشترى المستوى الرابع',
        'Fatima99 ترقت للمستوى الخامس',
        'أحمد_محمود قام بالترقية إلى المستوى الأول',
        'Noor_Hassan ترقت للمستوى الثالث',
        'خالد_علي اشترى المستوى الثاني'
    ];

    setInterval(() => {
        if (Math.random() > 0.4 && state.user.tier === 'free') {
            const message = upgradeMessages[Math.floor(Math.random() * upgradeMessages.length)];
            showUpgradeNotification(message);
        }
    }, 25000); // Every 25 seconds
}

function showUpgradeNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'live-upgrade-notification';
    notification.innerHTML = `
        <div class="upgrade-notif-icon">🔥</div>
        <div class="upgrade-notif-text">${message}</div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 400);
    }, 4000);
}

function checkPendingWithdrawals() {
    // Check all pending withdrawals on app load
    if (state.user.pendingWithdrawals && state.user.pendingWithdrawals.length > 0) {
        state.user.pendingWithdrawals.forEach(withdrawal => {
            checkWithdrawalStatus(withdrawal);
        });
    }
}

function loadUserData() {
    const saved = localStorage.getItem('piMiningUser');
    if (saved) {
        state.user = { ...state.user, ...JSON.parse(saved) };
    }
    state.user.tierData = tiers.find(t => t.id === state.user.tier);
}

function saveUserData() {
    localStorage.setItem('piMiningUser', JSON.stringify(state.user));
}

function renderUI() {
    updateTelegramProfile();
    updateBalance();
    updateMiningUI();
    updateLiveStats();
    renderTasks();
    renderTiers();
    updateWithdrawalUI();
}

function updateBalance() {
    const balance = state.user.balance.toFixed(4);
    const balanceElement = document.getElementById('userBalance');
    if (balanceElement) {
        balanceElement.textContent = balance;
    }
    // Also update withdrawal amount to keep them in sync
    const withdrawableElement = document.getElementById('withdrawableAmount');
    if (withdrawableElement) {
        withdrawableElement.textContent = balance;
    }
}

function updateTelegramProfile() {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        const userNameElement = document.getElementById('userName');
        const userAvatarElement = document.getElementById('userAvatar');
        const userTierElement = document.getElementById('userTier');

        if (userNameElement) {
            userNameElement.textContent = user.first_name || 'المستخدم';
        }

        if (userTierElement) {
            userTierElement.textContent = state.user.tierData ? state.user.tierData.name : 'Free Tier';
        }

        // If user has photo, display it
        if (user.photo_url && userAvatarElement) {
            userAvatarElement.innerHTML = `<img src="${user.photo_url}" alt="Profile">`;
        }
    }
}

function updateMiningUI() {
    const tierData = state.user.tierData;
    const tierBadgeElement = document.getElementById('tierBadge');
    const miningRateElement = document.getElementById('miningRateValue');
    const minedTodayElement = document.getElementById('minedToday');
    const dailyLimitElement = document.getElementById('dailyLimit');
    const progressBarElement = document.getElementById('miningProgressBar');
    const progressCircleElement = document.getElementById('miningProgressCircle');
    const miningIconElement = document.getElementById('miningIcon');
    const statusIndicatorElement = document.getElementById('miningStatusIndicator');
    const startBtn = document.getElementById('startMiningBtn');
    const stopBtn = document.getElementById('stopMiningBtn');
    const timeEstimateElement = document.getElementById('miningTimeEstimate');

    if (tierBadgeElement) tierBadgeElement.textContent = tierData.name.toUpperCase();
    if (miningRateElement) miningRateElement.textContent = tierData.miningRate.toFixed(2);
    if (minedTodayElement) minedTodayElement.textContent = state.user.minedToday.toFixed(2);
    if (dailyLimitElement) dailyLimitElement.textContent = tierData.maxDaily.toFixed(2);

    const progress = (state.user.minedToday / tierData.maxDaily) * 100;

    if (progressBarElement) progressBarElement.style.width = `${Math.min(progress, 100)}%`;

    // Check if daily limit is reached
    const dailyLimitReached = state.user.minedToday >= tierData.maxDaily;

    // Calculate time estimation
    if (timeEstimateElement) {
        if (state.user.miningActive && !dailyLimitReached) {
            const remaining = tierData.maxDaily - state.user.minedToday;
            const secondsRemaining = Math.ceil(remaining / tierData.miningRate);
            const hours = Math.floor(secondsRemaining / 3600);
            const minutes = Math.floor((secondsRemaining % 3600) / 60);
            const seconds = secondsRemaining % 60;

            let timeText = '';
            if (hours > 0) {
                timeText = `${hours}س ${minutes}د`;
            } else if (minutes > 0) {
                timeText = `${minutes}د ${seconds}ث`;
            } else {
                timeText = `${seconds}ث`;
            }

            timeEstimateElement.textContent = `الإكمال خلال: ${timeText}`;
            timeEstimateElement.style.display = 'block';
        } else {
            timeEstimateElement.style.display = 'none';
        }
    }

    const miningVisualizationElement = document.getElementById('miningVisualization');

    if (state.user.miningActive) {
        if (miningIconElement) miningIconElement.classList.add('active');
        if (miningVisualizationElement) miningVisualizationElement.classList.add('active');
        if (statusIndicatorElement) {
            const statusDot = statusIndicatorElement.querySelector('.status-dot');
            const statusText = statusIndicatorElement.querySelector('.status-text');
            if (statusDot) statusDot.style.background = 'var(--accent-green)';
            if (statusText) statusText.textContent = 'التعدين نشط';
        }
        if (startBtn) startBtn.classList.add('hidden');
        if (stopBtn) stopBtn.classList.remove('hidden');
    } else {
        if (miningIconElement) miningIconElement.classList.remove('active');
        if (miningVisualizationElement) miningVisualizationElement.classList.remove('active');
        if (statusIndicatorElement) {
            const statusDot = statusIndicatorElement.querySelector('.status-dot');
            const statusText = statusIndicatorElement.querySelector('.status-text');
            if (statusDot) statusDot.style.background = 'var(--accent-blue)';
            if (statusText) statusText.textContent = 'جاهز للتعدين';
        }
        if (startBtn) startBtn.classList.remove('hidden');
        if (stopBtn) stopBtn.classList.add('hidden');
    }

    // Show mining reset timer if daily limit reached
    if (dailyLimitReached) {
        showMiningResetTimer();
    }
}

function updateLiveStats() {
    document.getElementById('activeMiners').textContent = state.platform.activeMiners.toLocaleString();
    document.getElementById('platformMined').textContent = state.platform.totalMined.toLocaleString();
    document.getElementById('withdrawalsToday').textContent = state.platform.withdrawalsToday;
    document.getElementById('avgWithdrawal').textContent = state.platform.avgWithdrawal.toFixed(4);
}



function renderTasks() {
    const container = document.getElementById('tasksContainer');
    const tierData = state.user.tierData;

    // Filter tasks to show only tasks from the user's current tier
    const availableTasks = tasks.filter(task => {
        return task.minTier === state.user.tier;
    });

    // Count only completed tasks from the current tier
    const currentTierTaskIds = availableTasks.map(task => task.id);
    const completedCount = state.user.tasksCompleted.filter(taskId =>
        currentTierTaskIds.includes(taskId)
    ).length;
    const allTasksCompleted = completedCount >= tierData.tasksLimit;

    if (allTasksCompleted) {
        // Show reset timer - 24 hours from first completion or use saved reset time
        const now = Date.now();

        // If no reset time is set, create one (24 hours from now)
        if (!state.user.tasksResetTime) {
            state.user.tasksResetTime = now + (24 * 60 * 60 * 1000); // 24 hours in milliseconds
            saveUserData();
        }

        // If reset time has passed, reset tasks immediately
        if (state.user.tasksResetTime <= now) {
            const currentTierTaskIds = availableTasks.map(task => task.id);
            state.user.tasksCompleted = state.user.tasksCompleted.filter(taskId =>
                !currentTierTaskIds.includes(taskId)
            );
            state.user.tasksResetTime = null;
            saveUserData();
            renderTasks();
            return;
        }

        const resetTime = state.user.tasksResetTime;
        const remainingMs = resetTime - now;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

        container.innerHTML = `
            <div class="tasks-reset-container">
                <div class="reset-icon">⏰</div>
                <h2>أحسنت! لقد أكملت جميع المهام اليوم</h2>
                <p class="reset-message">لقد أكملت ${completedCount} من ${tierData.tasksLimit} مهمة متاحة لك اليوم</p>
                <div class="reset-timer">
                    <div class="timer-label">ستتوفر مهام جديدة بعد:</div>
                    <div class="timer-display" id="tasksResetTimer">
                        <div class="timer-unit">
                            <span class="timer-number" id="resetHours">${hours.toString().padStart(2, '0')}</span>
                            <span class="timer-text">ساعة</span>
                        </div>
                        <span class="timer-separator">:</span>
                        <div class="timer-unit">
                            <span class="timer-number" id="resetMinutes">${minutes.toString().padStart(2, '0')}</span>
                            <span class="timer-text">دقيقة</span>
                        </div>
                        <span class="timer-separator">:</span>
                        <div class="timer-unit">
                            <span class="timer-number" id="resetSeconds">${seconds.toString().padStart(2, '0')}</span>
                            <span class="timer-text">ثانية</span>
                        </div>
                    </div>
                </div>
                <div class="reset-info">
                    <p>💡 في هذه الأثناء، يمكنك:</p>
                    <ul class="reset-suggestions">
                        <li>متابعة التعدين لزيادة أرباحك</li>
                        <li>ترقية باقتك للحصول على المزيد من المهام</li>
                        <li>سحب أرباحك إذا وصلت للحد الأدنى</li>
                    </ul>
                </div>
            </div>
        `;

        // Start countdown timer
        if (window.tasksResetInterval) {
            clearInterval(window.tasksResetInterval);
        }
        window.tasksResetInterval = setInterval(() => {
            const now = Date.now();
            const remainingMs = resetTime - now;

            if (remainingMs <= 0) {
                clearInterval(window.tasksResetInterval);
                window.tasksResetInterval = null;
                // Reset tasks for the current tier
                const currentTierTaskIds = availableTasks.map(task => task.id);
                state.user.tasksCompleted = state.user.tasksCompleted.filter(taskId =>
                    !currentTierTaskIds.includes(taskId)
                );
                state.user.tasksResetTime = null;
                saveUserData();
                renderTasks();
                return;
            }

            const hours = Math.floor(remainingMs / (1000 * 60 * 60));
            const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

            const hoursEl = document.getElementById('resetHours');
            const minutesEl = document.getElementById('resetMinutes');
            const secondsEl = document.getElementById('resetSeconds');

            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
        }, 1000);

        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(availableTasks.length / state.pagination.tasksPerPage);
    const startIndex = (state.pagination.currentPage - 1) * state.pagination.tasksPerPage;
    const endIndex = startIndex + state.pagination.tasksPerPage;
    const paginatedTasks = availableTasks.slice(startIndex, endIndex);

    const tasksHTML = paginatedTasks.map(task => {
        const isCompleted = state.user.tasksCompleted.includes(task.id);
        const canComplete = !isCompleted && completedCount < tierData.tasksLimit;

        // Check if task is in processing state
        const pendingTasks = JSON.parse(localStorage.getItem('pendingTaskCompletions') || '{}');
        const isProcessing = pendingTasks.hasOwnProperty(task.id);

        let btnClass = 'available';
        let btnText = 'ابدأ المهمة';

        if (isProcessing) {
            btnClass = 'in-progress';
            btnText = '⏳ جاري المعالجة...';
        } else if (isCompleted) {
            btnClass = 'completed';
            btnText = 'مكتمل ✓';
        } else if (!canComplete) {
            btnClass = 'locked';
            btnText = 'حد المهام';
        }

        return `
            <div class="task-card">
                <div class="task-info">
                    <h3>${task.title}</h3>
                    <div class="task-reward">+${task.reward.toFixed(4)} USD</div>
                </div>
                <button class="task-btn ${btnClass}" onclick="handleTask('${task.id}')" ${isCompleted || !canComplete || isProcessing ? 'disabled' : ''}>
                    ${btnText}
                </button>
            </div>
        `;
    }).join('');

    const paginationHTML = totalPages > 1 ? `
        <div class="pagination">
            <button class="pagination-btn" onclick="changePage(${state.pagination.currentPage - 1})" ${state.pagination.currentPage === 1 ? 'disabled' : ''}>
                →
            </button>
            <span class="pagination-info">صفحة ${state.pagination.currentPage} من ${totalPages}</span>
            <button class="pagination-btn" onclick="changePage(${state.pagination.currentPage + 1})" ${state.pagination.currentPage === totalPages ? 'disabled' : ''}>
                ←
            </button>
        </div>
    ` : '';

    container.innerHTML = tasksHTML + paginationHTML;
}

function renderTiers() {
    const container = document.getElementById('tiersContainer');

    // Show bonus banner if active
    let bonusBanner = '';
    if (state.user.tier === 'free' && state.bonusTimer.active) {
        bonusBanner = `
            <div class="limited-time-bonus-banner">
                <div class="bonus-banner-icon">🎁</div>
                <div class="bonus-banner-content">
                    <div class="bonus-banner-title">عرض محدود! احصل على 25% إضافية</div>
                    <div class="bonus-banner-subtitle">لأول ترقية فقط - ينتهي خلال:</div>
                    <div class="bonus-banner-timer">
                        <span class="bonus-countdown-timer">--:--:--</span>
                    </div>
                </div>
                <div class="bonus-banner-flame">🔥</div>
            </div>
        `;
    }

    // Show missed earnings alert
    let missedEarningsAlert = '';
    if (state.user.tier === 'free' && state.user.totalMissedEarnings > 0) {
        missedEarningsAlert = `
            <div class="missed-earnings-alert">
                <div class="missed-alert-icon">⚠️</div>
                <div class="missed-alert-content">
                    <div class="missed-alert-title">لقد فقدت ${state.user.totalMissedEarnings.toFixed(4)}$ حتى الآن!</div>
                    <div class="missed-alert-subtitle">كان بإمكانك ربح هذا المبلغ لو قمت بالترقية في وقت سابق</div>
                </div>
            </div>
        `;
    }

    const tierCards = tiers.filter(tier => tier.id !== 'free').map(tier => {
        const isCurrent = tier.id === state.user.tier;
        const isMostPopular = tier.id === CONFIG.mostPopularTier;
        const activeUsers = CONFIG.tierPopularity[tier.id] || 0;

        // Calculate bonus ROI if applicable
        // Calculate bonus if applicable for this specific tier
        const showBonusForThisTier = state.user.tier === 'free' && !state.user.hasUsedFirstUpgradeBonus && state.bonusTimer.active;
        const thisTierBonusAmount = showBonusForThisTier ? (tier.roi * (CONFIG.firstUpgradeBonus.percentage / 100)) : 0;

        const tierFeatures = {
            level1: [
                '💰 اربح حتى $14.50 من استثمار واحد',
                '🚀 معدل تعدين أسرع 7× من المجاني',
                '⚡ سحب فوري بدون قيود',
                '🎁 مكافآت مهام أعلى بكثير'
            ],
            level2: [
                '💎 عائد $86 - ضاعف أموالك',
                '🔥 دخل سلبي يومي مضمون',
                '⭐ أولوية قصوى في جميع السحوبات',
                '🏆 مهام بأرباح خيالية'
            ],
            level3: [
                '👑 عائد $180 - استثمار ذكي مربح',
                '💸 دخل يومي ثابت ومستمر',
                '🎯 دعم VIP حصري ومباشر',
                '🌟 أرباح مهام احترافية'
            ],
            level4: [
                '🚀 عائد $880 - ثروة حقيقية',
                '💰 دخل يومي كبير ومستقر',
                '👨‍💼 مدير حساب VIP مخصص',
                '🔥 مهام بمكافآت ضخمة'
            ],
            level5: [
                '💎 عائد $2,500 - الباقة الماسية',
                '🏆 أعلى أرباح يومية ممكنة',
                '⚡ أولوية فائقة في كل شيء',
                '👑 مكافآت VIP استثنائية'
            ]
        };

        const features = tierFeatures[tier.id] || [];

        return `
            <div class="tier-card ${tier.isPremium ? 'premium' : ''} ${isMostPopular ? 'most-popular' : ''}">
                ${isMostPopular ? '<div class="popularity-badge">🔥 الأكثر طلباً</div>' : ''}
                ${showBonusForThisTier ? `<div class="bonus-badge">+${thisTierBonusAmount.toFixed(2)}$ مكافأة! 🎁</div>` : ''}
                <div class="tier-header-box">
                    <div class="tier-name">${tier.name}</div>
                    <div class="tier-price">$${tier.price}</div>
                    <div class="tier-social-proof">${activeUsers.toLocaleString()} مستخدم نشط</div>
                </div>
                <div class="tier-features">
                    ${features.map(feature => `<div class="tier-feature">${feature}</div>`).join('')}
                </div>
                <div class="tier-roi-box ${showBonusForThisTier ? 'with-bonus' : ''}">
                    <span class="tier-roi-label">العائد المتوقع</span>
                    ${showBonusForThisTier ? `
                        <div class="tier-roi-original">$${tier.roi.toFixed(2)} <span class="roi-crossed">عادي</span></div>
                        <div class="tier-roi-value bonus-roi">$${(tier.roi + thisTierBonusAmount).toFixed(2)}</div>
                        <div class="bonus-savings">توفر ${thisTierBonusAmount.toFixed(2)}$ إضافية!</div>
                    ` : `
                        <div class="tier-roi-value">$${tier.roi.toFixed(2)}</div>
                    `}
                </div>
                ${CONFIG.scarcityMessages[tier.id] ? `
                    <div class="scarcity-message">⚡ ${CONFIG.scarcityMessages[tier.id]}</div>
                ` : ''}
                <button class="tier-btn ${isMostPopular ? 'popular-btn' : ''}" onclick="handleTierUpgrade('${tier.id}')" ${isCurrent ? 'disabled' : ''}>
                    ${isCurrent ? 'الباقة الحالية ✓' : 'ترقية الآن'}
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = bonusBanner + missedEarningsAlert + tierCards;
}

function updateWithdrawalUI() {
    const btn = document.getElementById('withdrawBtn');
    const amount = document.getElementById('withdrawableAmount');
    const minWithdrawalElement = document.getElementById('minWithdrawal');
    const minWithdrawal = CONFIG.minWithdrawalAmounts[state.user.tier] || state.user.tierData.price;

    amount.textContent = state.user.balance.toFixed(4);
    if (minWithdrawalElement) {
        minWithdrawalElement.textContent = minWithdrawal.toFixed(4);
    }
    btn.disabled = state.user.balance < minWithdrawal;

    // Render withdrawal history
    renderWithdrawalHistory();
}

function renderWithdrawalHistory() {
    const historyContainer = document.getElementById('withdrawalHistory');
    if (!historyContainer) return;

    if (!state.user.withdrawalHistory || state.user.withdrawalHistory.length === 0) {
        historyContainer.innerHTML = '<p class="empty-state">لا توجد عمليات سحب سابقة</p>';
        return;
    }

    // Sort by timestamp (newest first)
    const sortedHistory = [...state.user.withdrawalHistory].sort((a, b) => b.timestamp - a.timestamp);

    // Calculate pagination
    const totalPages = Math.ceil(sortedHistory.length / state.pagination.withdrawalsPerPage);
    const startIndex = (state.pagination.withdrawalPage - 1) * state.pagination.withdrawalsPerPage;
    const endIndex = startIndex + state.pagination.withdrawalsPerPage;
    const paginatedHistory = sortedHistory.slice(startIndex, endIndex);

    const historyHTML = paginatedHistory.map(withdrawal => {
        const date = new Date(withdrawal.timestamp);
        const dateStr = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        let statusClass = '';
        let statusText = '';
        let statusIcon = '';

        switch (withdrawal.status) {
            case 'pending':
                statusClass = 'status-pending';
                statusText = 'قيد المعالجة';
                statusIcon = '⏳';
                break;
            case 'completed':
                statusClass = 'status-completed';
                statusText = 'مكتمل';
                statusIcon = '✓';
                break;
            case 'failed':
                statusClass = 'status-failed';
                statusText = 'فشل';
                statusIcon = '✗';
                break;
            default:
                statusClass = 'status-pending';
                statusText = 'قيد المعالجة';
                statusIcon = '⏳';
        }

        return `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-amount">$${withdrawal.amount.toFixed(4)}</div>
                    <div class="history-date">${dateStr}</div>
                    <div class="history-wallet">${withdrawal.walletAddress.substring(0, 10)}...${withdrawal.walletAddress.substring(withdrawal.walletAddress.length - 8)}</div>
                </div>
                <div class="history-status ${statusClass}">
                    <span class="status-icon">${statusIcon}</span>
                    <span class="status-text">${statusText}</span>
                </div>
            </div>
        `;
    }).join('');

    const paginationHTML = totalPages > 1 ? `
        <div class="pagination">
            <button class="pagination-btn" onclick="changeWithdrawalPage(${state.pagination.withdrawalPage - 1})" ${state.pagination.withdrawalPage === 1 ? 'disabled' : ''}>
                →
            </button>
            <span class="pagination-info">صفحة ${state.pagination.withdrawalPage} من ${totalPages}</span>
            <button class="pagination-btn" onclick="changeWithdrawalPage(${state.pagination.withdrawalPage + 1})" ${state.pagination.withdrawalPage === totalPages ? 'disabled' : ''}>
                ←
            </button>
        </div>
    ` : '';

    historyContainer.innerHTML = historyHTML + paginationHTML;
}

function handleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let shareUrl = '';
    let platformName = '';

    switch (task.type) {
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodeURIComponent(CONFIG.botLink)}&text=${encodeURIComponent(task.message)}`;
            platformName = 'تليجرام';
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(CONFIG.botLink)}&quote=${encodeURIComponent(task.message)}`;
            platformName = 'فيسبوك';
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(task.message)}`;
            platformName = 'تويتر';
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(task.message)}`;
            platformName = 'واتساب';
            break;
        case 'instagram':
            shareUrl = `https://www.instagram.com/create/story`;
            platformName = 'انستجرام';
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(CONFIG.botLink)}`;
            platformName = 'لينكد إن';
            break;
        case 'reddit':
            shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(CONFIG.botLink)}&title=${encodeURIComponent(task.message)}`;
            platformName = 'ريديت';
            break;
        case 'discord':
            shareUrl = `https://discord.com/channels/@me`;
            platformName = 'ديسكورد';
            break;
        case 'tiktok':
            shareUrl = `https://www.tiktok.com/upload`;
            platformName = 'تيك توك';
            break;
        case 'snapchat':
            shareUrl = `https://www.snapchat.com/add`;
            platformName = 'سناب شات';
            break;
        default:
            shareUrl = `https://t.me/share/url?url=${encodeURIComponent(CONFIG.botLink)}&text=${encodeURIComponent(task.message)}`;
            platformName = 'منصة التواصل';
    }

    showModal(
        `مشاركة على ${platformName}`,
        `<p>شارك الرسالة التالية على ${platformName} للحصول على <strong>$${task.reward}</strong>:</p><p style="background: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 8px; margin: 12px 0; word-break: break-word;">"${task.message}"</p>`,
        [
            {
                text: 'مشاركة الآن', action: () => {
                    window.open(shareUrl, '_blank');
                    closeModal();
                    completeTaskWithDelay(taskId, task.reward, 5000); // 5 seconds for all tasks
                }
            },
            { text: 'إلغاء', action: closeModal }
        ]
    );
}

function changePage(page) {
    const availableTasks = tasks.filter(task => {
        return task.minTier === state.user.tier;
    });

    const totalPages = Math.ceil(availableTasks.length / state.pagination.tasksPerPage);

    if (page >= 1 && page <= totalPages) {
        state.pagination.currentPage = page;
        renderTasks();
    }
}

function changeWithdrawalPage(page) {
    if (!state.user.withdrawalHistory || state.user.withdrawalHistory.length === 0) return;

    const totalPages = Math.ceil(state.user.withdrawalHistory.length / state.pagination.withdrawalsPerPage);

    if (page >= 1 && page <= totalPages) {
        state.pagination.withdrawalPage = page;
        renderWithdrawalHistory();
    }
}

function completeTaskWithDelay(taskId, reward, delayMs = 5000) {
    // Store task completion info in localStorage with timestamp
    const completionTime = Date.now() + delayMs;
    const pendingTasks = JSON.parse(localStorage.getItem('pendingTaskCompletions') || '{}');
    pendingTasks[taskId] = { completionTime, reward };
    localStorage.setItem('pendingTaskCompletions', JSON.stringify(pendingTasks));

    // Update button to show in-progress state
    const taskButton = document.querySelector(`.task-btn[onclick="handleTask('${taskId}')"]`);
    if (taskButton) {
        taskButton.classList.remove('available');
        taskButton.classList.add('in-progress');
        taskButton.textContent = '⏳ جاري المعالجة...';
        taskButton.disabled = true;
    }

    // Schedule completion
    const timeoutId = setTimeout(() => {
        completePendingTask(taskId, reward);
    }, delayMs);

    // Store timeout ID for cleanup
    if (!window.taskTimeouts) window.taskTimeouts = {};
    window.taskTimeouts[taskId] = timeoutId;
}

function completePendingTask(taskId, reward) {
    // Remove from pending first
    const pendingTasks = JSON.parse(localStorage.getItem('pendingTaskCompletions') || '{}');
    delete pendingTasks[taskId];
    localStorage.setItem('pendingTaskCompletions', JSON.stringify(pendingTasks));

    // Clean up timeout
    if (window.taskTimeouts && window.taskTimeouts[taskId]) {
        delete window.taskTimeouts[taskId];
    }

    if (!state.user.tasksCompleted.includes(taskId)) {
        state.user.tasksCompleted.push(taskId);
        state.user.balance += reward;

        saveUserData();

        // Force re-render of tasks to update button state
        renderTasks();
        updateBalance();
        updateWithdrawalUI();

        showToast(`تم إكمال المهمة بنجاح! +$${reward.toFixed(4)}`, 'success');
    }
}

function checkPendingTaskCompletions() {
    const pendingTasks = JSON.parse(localStorage.getItem('pendingTaskCompletions') || '{}');
    const now = Date.now();

    Object.keys(pendingTasks).forEach(taskId => {
        const { completionTime, reward } = pendingTasks[taskId];
        const remainingTime = completionTime - now;

        if (remainingTime <= 0) {
            // Task should be completed now
            completePendingTask(taskId, reward);
        } else {
            // Update button to show in-progress state
            const taskButton = document.querySelector(`.task-btn[onclick="handleTask('${taskId}')"]`);
            if (taskButton) {
                taskButton.classList.remove('available');
                taskButton.classList.add('in-progress');
                taskButton.textContent = '⏳ جاري المعالجة...';
                taskButton.disabled = true;
            }

            // Schedule completion for remaining time
            const timeoutId = setTimeout(() => {
                completePendingTask(taskId, reward);
            }, remainingTime);

            if (!window.taskTimeouts) window.taskTimeouts = {};
            window.taskTimeouts[taskId] = timeoutId;
        }
    });
}

async function handleTierUpgrade(tierId) {
    const tier = tiers.find(t => t.id === tierId);
    if (!tier) return;

    // Define features based on tier level
    const tierFeatures = {
        level1: [
            '💰 اربح $14.50 من استثمار واحد',
            '🚀 تعدين أسرع 7× من المجاني',
            '⚡ سحب فوري بدون قيود',
            '🎁 مكافآت مهام أعلى'
        ],
        level2: [
            '💎 عائد $86 - ضاعف أموالك',
            '🔥 دخل سلبي يومي مضمون',
            '⭐ أولوية في السحوبات',
            '🏆 مهام بأرباح خيالية'
        ],
        level3: [
            '👑 عائد $180 - استثمار ذكي',
            '💸 دخل يومي ثابت ومستمر',
            '🎯 دعم VIP حصري',
            '🌟 أرباح مهام احترافية'
        ],
        level4: [
            '🚀 عائد $880 - ثروة حقيقية',
            '💰 دخل يومي كبير ومستقر',
            '👨‍💼 مدير حساب VIP مخصص',
            '🔥 مهام بمكافآت ضخمة'
        ],
        level5: [
            '💎 عائد $2,500 - الباقة الماسية',
            '🏆 أعلى أرباح يومية ممكنة',
            '⚡ أولوية فائقة في كل شيء',
            '👑 مكافآت VIP استثنائية'
        ]
    };

    const features = tierFeatures[tier.id] || [];

    showModal(
        `🎯 ${tier.name}`,
        `
            <div style="text-align: center; padding: 0;">
                <div style="background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(168, 85, 247, 0.1)); padding: 16px; border-radius: 12px; margin-bottom: 16px; border: 1px solid rgba(0, 217, 255, 0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 11px; color: #B4B4C8;">الاستثمار</span>
                        <span style="font-size: 20px; font-weight: 800; color: #FFB800;">$${tier.price}</span>
                    </div>
                    <div style="height: 1px; background: rgba(255, 255, 255, 0.1); margin: 8px 0;"></div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 11px; color: #B4B4C8;">العائد (${tier.minDays} أيام)</span>
                        <span style="font-size: 20px; font-weight: 800; color: #00F5A0;">$${tier.roi}</span>
                    </div>
                </div>
                <div style="text-align: right; margin-bottom: 16px;">
                    <div style="font-size: 11px; color: #00D9FF; font-weight: 600; margin-bottom: 8px;">✨ المميزات الحصرية</div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        ${features.map(feature => `<div style="font-size: 11px; color: #B4B4C8;">${feature}</div>`).join('')}
                    </div>
                </div>
                <div style="font-size: 10px; color: #FFB800; padding: 8px; background: rgba(255, 184, 0, 0.1); border-radius: 8px; border: 1px solid rgba(255, 184, 0, 0.2);">
                    💳 الدفع: USDT BEP20 (آمن وسريع)
                </div>
            </div>
        `,
        [
            {
                text: 'متابعة الدفع', action: () => {
                    closeModal();
                    initiateTierPayment(tier);
                }
            },
            { text: 'إلغاء', action: closeModal }
        ]
    );
}

async function initiateTierPayment(tier) {
    try {
        // Show loading
        showModal(
            'جاري إنشاء الدفعة...',
            '<div style="text-align: center; padding: 20px;"><div class="loading-spinner"></div><p>جاري تجهيز عملية الدفع...</p></div>',
            []
        );

        const userId = tg.initDataUnsafe?.user?.id || 'demo_user';
        const payment = await paymentAPI.createTierPayment(tier.price, userId, tier.id);

        // Store pending payment
        state.user.pendingPayments.push({
            paymentId: payment.payment_id,
            tierId: tier.id,
            amount: tier.price,
            timestamp: Date.now(),
            status: 'pending'
        });
        saveUserData();

        // Show payment details (includes auto payment checking)
        showPaymentModal(payment, tier);

    } catch (error) {
        console.error('Payment creation error:', error);
        showModal(
            'خطأ في الدفع',
            '<p>عذراً، حدث خطأ أثناء إنشاء الدفعة. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.</p>',
            [
                {
                    text: 'تواصل مع الدعم', action: () => {
                        tg.openTelegramLink(CONFIG.supportBotLink);
                        closeModal();
                    }
                },
                { text: 'إغلاق', action: closeModal }
            ]
        );
    }
}

function showPaymentModal(payment, tier) {
    const payAddress = payment.pay_address;

    // Show tier price + $1 instead of NowPayments amount
    const displayAmount = tier.price + 1;
    const formattedAmount = displayAmount.toFixed(4);

    showModal(
        'إتمام الدفع',
        `
            <div style="text-align: center;">
                <p style="margin-bottom: 16px;">أرسل المبلغ التالي إلى العنوان أدناه:</p>

                <div style="background: rgba(59, 130, 246, 0.1); padding: 16px; border-radius: 12px; margin: 16px 0;">
                    <div style="font-size: 14px; color: #94a3b8; margin-bottom: 8px;">المبلغ المطلوب</div>
                    <div style="font-size: 24px; font-weight: 700; color: #10b981; margin-bottom: 4px;">${formattedAmount} USDT</div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">
                        يشمل رسوم المعالجة (+$1)
                    </div>
                </div>

                <div style="background: rgba(59, 130, 246, 0.1); padding: 16px; border-radius: 12px; margin: 16px 0;">
                    <div style="font-size: 14px; color: #94a3b8; margin-bottom: 8px;">عنوان المحفظة</div>
                    <div style="font-size: 12px; font-weight: 600; color: #f59e0b; word-break: break-all; font-family: monospace;">${payAddress}</div>
                    <button onclick="copyToClipboard('${payAddress}', this)" style="margin-top: 12px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;">نسخ العنوان</button>
                </div>

                <div style="background: rgba(245, 158, 11, 0.1); padding: 12px; border-radius: 8px; margin: 16px 0;">
                    <p style="font-size: 13px; color: #f59e0b; margin: 0;">⚠️ تأكد من إرسال USDT عبر شبكة BEP20 فقط</p>
                </div>

                <div id="paymentStatusContainer" style="margin-top: 20px; padding: 16px; background: rgba(59, 130, 246, 0.1); border-radius: 12px;">
                    <div class="loading-spinner" style="margin: 0 auto 12px;"></div>
                    <p style="font-size: 14px; color: #3b82f6; margin-bottom: 12px; font-weight: 600;">⏳ في انتظار الدفع...</p>
                    <div style="font-size: 13px; color: #94a3b8;">
                        <span>الوقت المتبقي: </span>
                        <span id="paymentTimer" style="font-weight: 700; color: #f59e0b;">10:00</span>
                    </div>
                </div>
            </div>
        `,
        []
    );

    // Start countdown timer (10 minutes = 600 seconds)
    let remainingSeconds = 600;
    const timerInterval = setInterval(() => {
        remainingSeconds--;
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        const timerElement = document.getElementById('paymentTimer');

        if (timerElement) {
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            // Change color when time is running out
            if (remainingSeconds <= 60) {
                timerElement.style.color = '#ef4444';
            }
        }

        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            const statusContainer = document.getElementById('paymentStatusContainer');
            if (statusContainer) {
                statusContainer.innerHTML = `
                    <p style="font-size: 14px; color: #ef4444; margin: 0; font-weight: 600;">⏰ انتهت مهلة الدفع</p>
                    <button onclick="closeModal()" style="margin-top: 12px; padding: 8px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">إغلاق</button>
                `;
            }
        }
    }, 1000);

    // Store interval ID for cleanup
    window.paymentTimerInterval = timerInterval;

    // Start checking payment status immediately
    checkPaymentStatusWithUI(payment.payment_id, tier.id, timerInterval);
}

async function checkPaymentStatusWithUI(paymentId, tierId, timerInterval, attempts = 0) {
    const maxAttempts = 120; // Check for 10 minutes (120 * 5 seconds)

    if (attempts >= maxAttempts) {
        clearInterval(timerInterval);
        return; // Stop checking after max attempts
    }

    try {
        const status = await paymentAPI.getPaymentStatus(paymentId);

        // COMPREHENSIVE DEBUG LOGGING
        console.log('=== PAYMENT STATUS CHECK ===');
        console.log('Payment ID:', paymentId);
        console.log('Full API Response:', status);
        console.log('Payment Status Field:', status.payment_status);
        console.log('=============================');


        if (status.payment_status === 'finished' || status.payment_status === 'confirmed') {
            // Payment confirmed - stop timer and update UI
            clearInterval(timerInterval);
            if (window.paymentTimerInterval) {
                clearInterval(window.paymentTimerInterval);
            }

            const statusContainer = document.getElementById('paymentStatusContainer');
            if (statusContainer) {
                statusContainer.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                        <p style="font-size: 18px; color: #10b981; font-weight: 700; margin-bottom: 12px;">تم تأكيد الدفع بنجاح!</p>
                        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 20px;">سيتم تحديث باقتك الآن...</p>
                        <button onclick="handlePaymentSuccess('${tierId}', '${paymentId}')" style="padding: 12px 32px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">رائع! 🎉</button>
                    </div>
                `;
            }
        } else if (status.payment_status === 'failed' || status.payment_status === 'expired') {
            // Payment failed - stop timer and show error
            clearInterval(timerInterval);
            if (window.paymentTimerInterval) {
                clearInterval(window.paymentTimerInterval);
            }

            updatePendingPaymentStatus(paymentId, 'failed');

            const statusContainer = document.getElementById('paymentStatusContainer');
            if (statusContainer) {
                statusContainer.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
                        <p style="font-size: 16px; color: #ef4444; font-weight: 600; margin-bottom: 12px;">فشلت عملية الدفع</p>
                        <p style="font-size: 13px; color: #94a3b8; margin-bottom: 16px;">
                            يرجى المحاولة مرة أخرى
                        </p>
                        <button onclick="closeModal()" style="padding: 10px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">إغلاق</button>
                    </div>
                `;
            }
        } else {
            // Still pending - check again after 5 seconds
            setTimeout(() => checkPaymentStatusWithUI(paymentId, tierId, timerInterval, attempts + 1), 5000);
        }
    } catch (error) {
        console.error('Error checking payment status:', error);
        // Retry after delay
        setTimeout(() => checkPaymentStatusWithUI(paymentId, tierId, timerInterval, attempts + 1), 5000);
    }
}

function handlePaymentSuccess(tierId, paymentId) {
    // Complete tier upgrade
    state.user.tier = tierId;
    state.user.tierData = tiers.find(t => t.id === tierId);
    updatePendingPaymentStatus(paymentId, 'completed');

    // Apply bonus if applicable
    if (!state.user.hasUsedFirstUpgradeBonus && state.bonusTimer.active) {
        const bonusAmount = state.user.tierData.roi * (CONFIG.firstUpgradeBonus.percentage / 100);
        state.user.balance += bonusAmount;
        state.user.hasUsedFirstUpgradeBonus = true;
        state.bonusTimer.active = false;

        showToast(`🎉 مبروك! حصلت على ${bonusAmount.toFixed(4)}$ مكافأة إضافية!`, 'success');
    }

    // Reset daily mining for new tier
    state.user.minedToday = 0;
    state.user.miningActive = false;

    // Reset free tier withdrawal flag when upgrading
    state.user.hasWithdrawnFreeTier = false;

    saveUserData();

    // Close modal and reload page
    closeModal();

    // Reload page to show new tier
    location.reload();
}

function completeTierUpgrade(tierId, paymentId) {
    state.user.tier = tierId;
    state.user.tierData = tiers.find(t => t.id === tierId);
    updatePendingPaymentStatus(paymentId, 'completed');

    // Reset daily mining for new tier
    state.user.minedToday = 0;
    state.user.miningActive = false;

    // Reset free tier withdrawal flag when upgrading
    state.user.hasWithdrawnFreeTier = false;

    saveUserData();
    renderUI();

    showToast(`تم ترقية باقتك بنجاح إلى ${state.user.tierData.name}! 🎉`, 'success');
}

function updatePendingPaymentStatus(paymentId, status) {
    const payment = state.user.pendingPayments.find(p => p.paymentId === paymentId);
    if (payment) {
        payment.status = status;
        saveUserData();
    }
}

function startMining() {
    if (state.user.minedToday >= state.user.tierData.maxDaily) return;

    state.user.miningActive = true;
    state.user.miningStartTime = Date.now();
    saveUserData();
    updateMiningUI();
}

function stopMining() {
    if (!state.user.miningActive) return;

    const elapsed = (Date.now() - state.user.miningStartTime) / 1000;
    const mined = elapsed * state.user.tierData.miningRate;
    const canMine = state.user.tierData.maxDaily - state.user.minedToday;
    const actualMined = Math.min(mined, canMine);

    state.user.balance += actualMined;
    state.user.minedToday += actualMined;
    state.user.totalMined += actualMined;
    state.user.miningActive = false;
    state.user.miningStartTime = null;

    // Set mining reset time if daily limit reached
    if (state.user.minedToday >= state.user.tierData.maxDaily && !state.user.miningResetTime) {
        state.user.miningResetTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    }

    saveUserData();
    updateBalance();
    updateMiningUI();
    updateWithdrawalUI();

    showToast(`تم التعدين بنجاح: +$${actualMined.toFixed(4)}`, 'success');
}

function showMiningResetTimer() {
    const now = Date.now();

    // Set mining reset time if not set
    if (!state.user.miningResetTime) {
        state.user.miningResetTime = now + (24 * 60 * 60 * 1000); // 24 hours
        saveUserData();
    }

    // If reset time has passed, reset mining
    if (state.user.miningResetTime <= now) {
        state.user.minedToday = 0;
        state.user.miningResetTime = null;
        saveUserData();
        updateMiningUI();
        return;
    }

    const resetTime = state.user.miningResetTime;
    const remainingMs = resetTime - now;
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    // Find the mining action buttons container
    const actionsContainer = document.querySelector('.mining-action-buttons');
    if (!actionsContainer) return;

    // Hide start/stop buttons
    const startBtn = document.getElementById('startMiningBtn');
    const stopBtn = document.getElementById('stopMiningBtn');
    if (startBtn) startBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'none';

    // Check if timer already exists
    let timerContainer = document.getElementById('miningResetTimerContainer');
    if (!timerContainer) {
        timerContainer = document.createElement('div');
        timerContainer.id = 'miningResetTimerContainer';
        timerContainer.className = 'mining-reset-timer-container';
        timerContainer.innerHTML = `
            <div class="reset-timer-content">
                <div class="reset-icon">⏰</div>
                <div class="reset-message">لقد وصلت للحد اليومي من التعدين</div>
                <div class="reset-timer">
                    <div class="timer-label">سيتم إعادة التعدين بعد:</div>
                    <div class="timer-display" id="miningResetTimer">
                        <div class="timer-unit">
                            <span class="timer-number" id="miningResetHours">${hours.toString().padStart(2, '0')}</span>
                            <span class="timer-text">ساعة</span>
                        </div>
                        <span class="timer-separator">:</span>
                        <div class="timer-unit">
                            <span class="timer-number" id="miningResetMinutes">${minutes.toString().padStart(2, '0')}</span>
                            <span class="timer-text">دقيقة</span>
                        </div>
                        <span class="timer-separator">:</span>
                        <div class="timer-unit">
                            <span class="timer-number" id="miningResetSeconds">${seconds.toString().padStart(2, '0')}</span>
                            <span class="timer-text">ثانية</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        actionsContainer.appendChild(timerContainer);
    }

    // Start countdown timer
    if (window.miningResetInterval) {
        clearInterval(window.miningResetInterval);
    }
    window.miningResetInterval = setInterval(() => {
        const now = Date.now();
        const remainingMs = resetTime - now;

        if (remainingMs <= 0) {
            clearInterval(window.miningResetInterval);
            window.miningResetInterval = null;

            // Reset mining
            state.user.minedToday = 0;
            state.user.miningResetTime = null;
            saveUserData();

            // Remove timer container
            const container = document.getElementById('miningResetTimerContainer');
            if (container) container.remove();

            // Show start button again
            if (startBtn) startBtn.style.display = '';

            updateMiningUI();
            showToast('يمكنك الآن البدء في التعدين مجدداً! 🎉', 'success');
            return;
        }

        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

        const hoursEl = document.getElementById('miningResetHours');
        const minutesEl = document.getElementById('miningResetMinutes');
        const secondsEl = document.getElementById('miningResetSeconds');

        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

function startMiningCheck() {
    setInterval(() => {
        if (state.user.miningActive && state.user.minedToday < state.user.tierData.maxDaily) {
            const elapsed = (Date.now() - state.user.miningStartTime) / 1000;
            const mined = elapsed * state.user.tierData.miningRate;
            const canMine = state.user.tierData.maxDaily - state.user.minedToday;
            const currentMined = Math.min(mined, canMine);

            // Update mining progress display - check if elements exist
            const minedTodayElement = document.getElementById('minedToday');
            if (minedTodayElement) {
                minedTodayElement.textContent = (state.user.minedToday + currentMined).toFixed(2);
            }

            const progress = ((state.user.minedToday + currentMined) / state.user.tierData.maxDaily) * 100;
            const progressBarElement = document.getElementById('miningProgressBar');
            if (progressBarElement) {
                progressBarElement.style.width = `${Math.min(progress, 100)}%`;
            }

            // Update header balance in real-time - check if element exists
            const currentBalance = state.user.balance + currentMined;
            const balanceElement = document.getElementById('userBalance');
            if (balanceElement) {
                balanceElement.textContent = currentBalance.toFixed(4);
            }

            const withdrawableElement = document.getElementById('withdrawableAmount');
            if (withdrawableElement) {
                withdrawableElement.textContent = currentBalance.toFixed(4);
            }

            // Update time estimation countdown
            const timeEstimateElement = document.getElementById('miningTimeEstimate');
            if (timeEstimateElement) {
                const remaining = state.user.tierData.maxDaily - (state.user.minedToday + currentMined);
                const secondsRemaining = Math.ceil(remaining / state.user.tierData.miningRate);
                const hours = Math.floor(secondsRemaining / 3600);
                const minutes = Math.floor((secondsRemaining % 3600) / 60);
                const seconds = secondsRemaining % 60;

                let timeText = '';
                if (hours > 0) {
                    timeText = `${hours}س ${minutes}د`;
                } else if (minutes > 0) {
                    timeText = `${minutes}د ${seconds}ث`;
                } else {
                    timeText = `${seconds}ث`;
                }

                timeEstimateElement.textContent = `الإكمال خلال: ${timeText}`;
                timeEstimateElement.style.display = 'block';
            }

            if (state.user.minedToday + currentMined >= state.user.tierData.maxDaily) {
                stopMining();
            }
        } else {
            // Hide time estimate when not mining
            const timeEstimateElement = document.getElementById('miningTimeEstimate');
            if (timeEstimateElement) {
                timeEstimateElement.style.display = 'none';
            }
        }
    }, 100);
}

function startLiveStats() {
    // Initialize daily start values if not set or if it's a new day
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('statsDate');

    if (savedDate !== today) {
        // New day - reset to base values
        state.platform.activeMiners = 1200 + Math.floor(Math.random() * 100);
        state.platform.totalMined = 40000 + Math.floor(Math.random() * 10000);
        state.platform.withdrawalsToday = 100 + Math.floor(Math.random() * 50);
        state.platform.avgWithdrawal = 20 + Math.random() * 10;

        localStorage.setItem('statsDate', today);
        localStorage.setItem('platformStats', JSON.stringify(state.platform));
    } else {
        // Same day - load saved values
        const savedStats = localStorage.getItem('platformStats');
        if (savedStats) {
            state.platform = { ...state.platform, ...JSON.parse(savedStats) };
        }
    }

    // Progressive updates every 3 seconds
    setInterval(() => {
        // Active miners fluctuates slightly
        state.platform.activeMiners += Math.floor(Math.random() * 3) - 1;
        if (state.platform.activeMiners < 1000) state.platform.activeMiners = 1000;

        // Total mined always increases
        state.platform.totalMined += Math.random() * 3 + 0.5;

        // Withdrawals increase occasionally
        if (Math.random() > 0.92) {
            state.platform.withdrawalsToday++;
        }

        // Average withdrawal fluctuates slightly
        state.platform.avgWithdrawal += (Math.random() - 0.5) * 0.5;
        if (state.platform.avgWithdrawal < 15) state.platform.avgWithdrawal = 15;
        if (state.platform.avgWithdrawal > 35) state.platform.avgWithdrawal = 35;

        // Save updated stats
        localStorage.setItem('platformStats', JSON.stringify(state.platform));

        updateLiveStats();
    }, 3000);
}

function startActivityFeed() {
    const feed = document.getElementById('activityFeed');

    // Realistic and complex Telegram usernames (mix of Arabic, English, numbers, cases)
    const usernames = [
        'أحمد_محمد', 'Sarah_Ali', 'محمود_حسن123', 'FatimaKhalid',
        'Omar_Youssef', 'ليلى_سعيد', 'Khalid_Abdullah', 'NoorDeen88',
        'youssef_ibrahim', 'Mariam_Hussein', 'طارق_أحمد', 'DinaM0hamed',
        'abdullah_ali', 'Reem_Khalid', 'SamiHassan', 'Huda_Youssef',
        'Mohamed_Ahmed', 'sara_123', 'Mahmoud_H', 'فاطمة_خالد_99',
        'JohnSmith', 'MikeJohnson', 'emily_davis', 'RobertBrown',
        'jennifer_w', 'DavidMiller', 'Lisa_Anderson', 'ChrisWilson',
        'amandaTaylor', 'JamesThomas', 'عبدالرحمن_علي', 'SarahJohnson',
        'mohammad_88', 'AmyMartinez', 'kevin_garcia', 'NancyRodriguez',
        'brian_lee', 'KarenWhite', 'TimothyHarris', 'BettyClark',
        'احمد_يوسف', 'PatriciaLewis', 'george_walker', 'HelenHall',
        'DonaldAllen', 'sandra_young', 'StevenKing', 'CarolWright',
        'EdwardLopez', 'dorothy_hill', 'RonaldScott', 'ShirleyGreen',
        'ThomasAdams', 'margaret_baker', 'JosephNelson', 'LindaCarter',
        'CharlesMitchell', 'barbara_perez', 'DanielRoberts', 'ElizabethTurner',
        'MatthewPhillips', 'susan_campbell', 'AnthonyEvans', 'JessicaEdwards',
        'MarkCollins', 'mary_stewart', 'PaulSanchez', 'SarahMorris',
        'عمر_محمد_2023', 'Andrew_Rogers', 'ليلى_89', 'JoshuaReed',
        'Kenneth_Cook', 'نور_الهدى', 'kevin_morgan', 'HeatherBell',
        'BrianMurphy', 'مريم_حسن', 'GeorgeBailey', 'MichelleCruz',
        'EdwardRivera', 'دينا_علي_15', 'RonaldCooper', 'LauraRichardson',
        'ThomasCox', 'rebecca_howard', 'JosephWard', 'StephanieWard',
        'CharlesTorres', 'cynthia_peterson', 'ChristopherGray', 'KathleenRamirez',
        'DanielJames', 'rachel_watson', 'MatthewBrooks', 'AmyCampbell',
        'AnthonyKelly', 'melissa_sanders', 'MarkPrice', 'HeatherBennett',
        'DonaldWood', 'طارق_يوسف_77', 'StevenBarnes', 'خالد_احمد',
        'PaulRoss', 'anna_henderson', 'AndrewColeman', 'سارة_محمود',
        'JoshuaJenkins', 'joyce_perry', 'KennethPowell', 'ريم_عبدالله',
        'KevinLong', 'marilyn_patterson', 'BrianHughes', 'فاطمة_يوسف',
        'GeorgeFlores', 'alice_washington', 'RonaldButler', 'نورا_حسين',
        'ThomasSimmons', 'judy_foster', 'JosephGonzales', 'ليلى_محمد_00',
        'CharlesBryant', 'frances_alexander', 'ChristopherRussell', 'مريم_علي_21',
        'DanielGriffin', 'evelyn_hayes', 'MatthewDiaz', 'هدى_خالد',
        'AnthonyHayes', 'ruby_myers', 'MarkFord', 'سامي_حسن_99',
        'DonaldHamilton', 'jean_graham', 'StevenGraham', 'احمد_عبدالله',
        'PaulSullivan', 'louise_wallace', 'AndrewWallace', 'عمر_حسين_007',
        'JoshuaWest', 'thelma_cole', 'KennethCole', 'يوسف_محمد',
        'KevinWest', 'edna_owens', 'BrianReynolds', 'منى_احمد',
        'GeorgeFisher', 'mabel_ellis', 'RonaldEllis', 'رنا_يوسف',
        'ThomasSims', 'stella_johnston', 'JosephJohnston', 'هند_علي',
        'CharlesHunt', 'marion_hart', 'ChristopherHart', 'سلمى_خالد_2024',
        'alex_mason', 'AmandaMason', 'محمد_عبدالرحمن', 'DavidWatson',
        'JOHN_DOE', 'jane_doe', 'MikeSmth', 'SaraJhonson',
        'Mohamad_Ali', 'Ahmedd_123', 'fAtImA_99', 'KhAlEd_88'
    ];

    // Activity types with icons
    const activityTypes = [
        { type: 'mining', icon: '⛏', text: 'عدّن', minAmount: 0.05, maxAmount: 2.5 },
        { type: 'withdrawal', icon: '💸', text: 'سحب', minAmount: 5, maxAmount: 150 },
        { type: 'tier_upgrade', icon: '⭐', text: 'ترقية باقة', minAmount: 10, maxAmount: 100 },
        { type: 'task_complete', icon: '✓', text: 'أكمل مهمة', minAmount: 0.02, maxAmount: 0.25 },
        { type: 'bonus', icon: '🎁', text: 'حصل على مكافأة', minAmount: 1, maxAmount: 10 }
    ];

    function generateRandomActivity() {
        const username = usernames[Math.floor(Math.random() * usernames.length)];
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const amount = (Math.random() * (activityType.maxAmount - activityType.minAmount) + activityType.minAmount).toFixed(4);

        return {
            type: activityType.type,
            icon: activityType.icon,
            text: `${username} ${activityType.text}`,
            amount: parseFloat(amount)
        };
    }

    // Generate initial activities
    const initialActivities = Array.from({ length: 6 }, generateRandomActivity);

    let activityHTML = '';
    initialActivities.forEach(activity => {
        activityHTML += `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">${activity.icon}</div>
                <div class="activity-text">${activity.text}</div>
                <div class="activity-amount">$${activity.amount.toFixed(4)}</div>
            </div>
        `;
    });
    feed.innerHTML = activityHTML;

    // Add new activity every 5 seconds
    setInterval(() => {
        const newActivity = generateRandomActivity();
        const newActivityHTML = `
            <div class="activity-item">
                <div class="activity-icon ${newActivity.type}">${newActivity.icon}</div>
                <div class="activity-text">${newActivity.text}</div>
                <div class="activity-amount">$${newActivity.amount.toFixed(4)}</div>
            </div>
        `;
        feed.insertAdjacentHTML('afterbegin', newActivityHTML);

        const items = feed.querySelectorAll('.activity-item');
        if (items.length > 6) items[items.length - 1].remove();
    }, 5000);
}

function handleWithdrawal() {
    const minWithdrawal = CONFIG.minWithdrawalAmounts[state.user.tier] || state.user.tierData.price;

    if (state.user.balance < minWithdrawal) return;

    // Check if wallet address is set
    if (!state.user.walletAddress) {
        showWalletSetupModal();
        return;
    }

    // Check if free tier user has already withdrawn once
    if (state.user.tier === 'free' && state.user.hasWithdrawnFreeTier) {
        // Show upgrade prompt modal and switch to tiers page
        showUpgradePromptModal();
        return;
    }

    showModal(
        'تأكيد السحب',
        `
            <p>المبلغ: <strong style="color: #10b981;">$${state.user.balance.toFixed(4)} USDT</strong></p>
            <p>عنوان المحفظة: <strong style="font-size: 11px; word-break: break-all; font-family: monospace;">${state.user.walletAddress}</strong></p>
            <p style="color: #3b82f6; margin-top: 16px;">سيتم إرسال المبلغ عبر شبكة BEP20</p>
            <p style="font-size: 13px; color: #94a3b8;">⏱ وقت المعالجة: فوري</p>
        `,
        [
            {
                text: 'تأكيد السحب', action: () => {
                    closeModal();
                    processWithdrawal();
                }
            },
            {
                text: 'تغيير المحفظة', action: () => {
                    closeModal();
                    showWalletSetupModal();
                }
            },
            { text: 'إلغاء', action: closeModal }
        ]
    );
}

function showUpgradePromptModal() {
    // Switch to tiers page
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById('tiersPage').classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(item => item.classList.remove('active'));
    const tiersNavBtn = document.querySelector('.nav-btn[data-page="tiers"]');
    if (tiersNavBtn) tiersNavBtn.classList.add('active');

    // Show modal explaining upgrade requirement
    showModal(
        '🎯 ترقية الباقة للسحب مجدداً',
        `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">💰</div>
                <p style="font-size: 16px; color: #f59e0b; font-weight: 600; margin-bottom: 16px;">لقد قمت بسحب أرباح الباقة المجانية بالفعل!</p>
                <p style="font-size: 14px; color: #94a3b8; margin-bottom: 20px; line-height: 1.6;">
                    للاستمرار في السحب وزيادة أرباحك، يجب عليك ترقية باقتك إلى إحدى الباقات المميزة.
                </p>
                <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1)); padding: 20px; border-radius: 16px; margin: 24px 0;">
                    <p style="font-size: 14px; color: #3b82f6; font-weight: 600; margin-bottom: 12px;">مميزات الترقية:</p>
                    <ul style="text-align: right; list-style: none; padding: 0; margin: 0;">
                        <li style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">✓ معدل تعدين أعلى بكثير</li>
                        <li style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">✓ مهام يومية أكثر وأرباح أكبر</li>
                        <li style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">✓ سحب غير محدود</li>
                        <li style="font-size: 13px; color: #94a3b8;">✓ عوائد مضمونة ومرتفعة</li>
                    </ul>
                </div>
                <p style="font-size: 13px; color: #10b981; margin-top: 16px;">
                    🚀 ابدأ الآن واربح المزيد!
                </p>
            </div>
        `,
        [
            { text: 'اختر باقتك الآن 🎯', action: closeModal },
            {
                text: 'ربما لاحقاً', action: () => {
                    closeModal();
                    // Switch back to withdrawal page
                    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
                    document.getElementById('withdrawalPage').classList.add('active');
                    document.querySelectorAll('.nav-btn').forEach(item => item.classList.remove('active'));
                    const withdrawalNavBtn = document.querySelector('.nav-btn[data-page="withdrawal"]');
                    if (withdrawalNavBtn) withdrawalNavBtn.classList.add('active');
                }
            }
        ]
    );
}

function showLevel5CompletionModal() {
    showModal(
        '🎉 تهانينا على إكمال الرحلة!',
        `
            <div style="text-align: center;">
                <div style="font-size: 64px; margin-bottom: 20px;">🏆</div>
                <p style="font-size: 18px; color: #10b981; font-weight: 700; margin-bottom: 16px;">لقد أكملت المستوى الأعلى بنجاح!</p>
                <p style="font-size: 15px; color: #94a3b8; margin-bottom: 20px; line-height: 1.6;">
                    نأمل أن تكون قد استمتعت بالتجربة وحققت أرباحاً رائعة معنا 💰
                </p>
                <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1)); padding: 20px; border-radius: 16px; margin: 24px 0;">
                    <p style="font-size: 14px; color: #3b82f6; font-weight: 600; margin-bottom: 12px;">لإتاحة الفرصة للآخرين</p>
                    <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
                        سيتم نقلك إلى الباقة المجانية لمنح فرصة للمستخدمين الآخرين للاستفادة من الباقات المميزة. 
                        يمكنك دائماً الترقية مرة أخرى والبدء في رحلة ربح جديدة! 🚀
                    </p>
                </div>
                <p style="font-size: 13px; color: #f59e0b; margin-top: 16px;">
                    ✨ شكراً لكونك جزءاً من عائلة Pi Mining
                </p>
            </div>
        `,
        [
            {
                text: 'فهمت، لنبدأ من جديد! 🎯', action: () => {
                    resetToFreeTier();
                    closeModal();
                }
            }
        ]
    );
}

function resetToFreeTier() {
    // Reset user to free tier
    state.user.tier = 'free';
    state.user.tierData = tiers.find(t => t.id === 'free');

    // Reset mining stats
    state.user.minedToday = 0;
    state.user.miningActive = false;
    state.user.miningStartTime = null;

    // Reset tasks for new tier
    state.user.tasksCompleted = [];
    state.user.tasksResetTime = null;

    // Keep withdrawal history and balance (they earned it!)
    // Keep wallet address for future withdrawals

    saveUserData();

    // Reload the page to show new tier
    setTimeout(() => {
        location.reload();
    }, 500);

    showToast('تم نقلك إلى الباقة المجانية. بالتوفيق في رحلتك الجديدة! 🌟', 'success');
}

function validateWalletAddress(address) {
    // Remove all whitespace and control characters
    let cleaned = address.replace(/\s+/g, '');

    // Handle potential mobile paste duplication
    if (cleaned.length > 42) {
        const firstPart = cleaned.substring(0, 42);
        const remainder = cleaned.substring(42);

        // If the remainder is the same as first part (duplication), use first part only
        if (firstPart === remainder) {
            cleaned = firstPart;
        } else {
            // Otherwise, just take the first 42 characters
            cleaned = firstPart;
        }
    }

    // Validate Ethereum address format:
    // - Must start with 0x
    // - Must be exactly 42 characters
    // - Must contain only hex characters (0-9, a-f, A-F) after 0x
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

    if (!ethAddressRegex.test(cleaned)) {
        return { valid: false, cleaned: null };
    }

    return { valid: true, cleaned: cleaned };
}

function showWalletSetupModal() {
    showModal(
        'إعداد محفظة السحب',
        `
            <div style="text-align: right;">
                <p style="margin-bottom: 16px;">أدخل عنوان محفظة USDT BEP20 الخاصة بك:</p>
                <input type="text" id="walletAddressInput" placeholder="0x..." 
                    style="width: 100%; padding: 12px; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; background: rgba(18, 23, 43, 0.8); color: white; font-family: monospace; font-size: 13px; margin-bottom: 12px;">
                <div style="background: rgba(245, 158, 11, 0.1); padding: 12px; border-radius: 8px; margin-top: 12px;">
                    <p style="font-size: 13px; color: #f59e0b; margin: 0;">⚠️ تأكد من أن العنوان يدعم شبكة BEP20</p>
                </div>
            </div>
        `,
        [
            {
                text: 'حفظ', action: () => {
                    const walletInput = document.getElementById('walletAddressInput');
                    const rawAddress = walletInput?.value || '';

                    const validation = validateWalletAddress(rawAddress);

                    if (!validation.valid) {
                        showToast('عنوان المحفظة غير صحيح. يجب أن يبدأ بـ 0x ويتكون من 42 حرف.', 'error');
                        return;
                    }

                    state.user.walletAddress = validation.cleaned;
                    saveUserData();
                    closeModal();
                    showToast('تم حفظ عنوان المحفظة بنجاح! ✓', 'success');

                    // Show withdrawal modal again
                    setTimeout(() => handleWithdrawal(), 500);
                }
            },
            { text: 'إلغاء', action: closeModal }
        ]
    );

    // Add paste event handler to auto-clean input
    setTimeout(() => {
        const input = document.getElementById('walletAddressInput');
        if (input) {
            input.focus();

            input.addEventListener('paste', (e) => {
                setTimeout(() => {
                    const validation = validateWalletAddress(input.value);
                    if (validation.valid) {
                        input.value = validation.cleaned;
                        input.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                    } else {
                        input.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                    }
                }, 10);
            });

            input.addEventListener('input', (e) => {
                const validation = validateWalletAddress(input.value);
                if (validation.valid) {
                    input.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                } else if (input.value.length > 0) {
                    input.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                } else {
                    input.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                }
            });
        }
    }, 100);
}

async function processWithdrawal() {
    const amount = state.user.balance; // Declare at function scope for error handling

    // Check if Telegram user ID exists (user must be using app through Telegram)
    const userId = tg.initDataUnsafe?.user?.id;
    if (!userId) {
        showModal(
            'غير مسموح بالسحب',
            `
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <p style="color: #f59e0b; font-size: 16px; font-weight: 700; margin-bottom: 12px;">يجب استخدام التطبيق عبر تليجرام</p>
                    <p style="font-size: 14px; color: #94a3b8; margin-bottom: 16px;">
                        للسحب، يجب عليك فتح التطبيق من خلال بوت تليجرام الرسمي.
                    </p>
                    <div style="background: rgba(245, 158, 11, 0.1); padding: 12px; border-radius: 8px; margin-top: 16px;">
                        <p style="font-size: 13px; color: #f59e0b; margin: 0;">افتح البوت من تليجرام وحاول مرة أخرى</p>
                    </div>
                </div>
            `,
            [
                { text: 'فهمت', action: closeModal }
            ]
        );
        return;
    }

    // Check if wallet address is blocked
    const normalizedWalletAddress = state.user.walletAddress.toLowerCase();
    const isBlocked = CONFIG.blockedWallets.some(blocked => 
        blocked.toLowerCase() === normalizedWalletAddress
    );

    if (isBlocked) {
        showModal(
            'غير مسموح بالسحب',
            `
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🚫</div>
                    <p style="color: #ef4444; font-size: 16px; font-weight: 700; margin-bottom: 12px;">عنوان المحفظة محظور</p>
                    <p style="font-size: 14px; color: #94a3b8; margin-bottom: 16px;">
                        عنوان المحفظة هذا غير مسموح له بإجراء عمليات السحب.
                    </p>
                    <div style="background: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 8px; margin-top: 16px;">
                        <p style="font-size: 13px; color: #ef4444; margin: 0;">يرجى التواصل مع الدعم للمزيد من المعلومات</p>
                    </div>
                </div>
            `,
            [
                {
                    text: 'تواصل مع الدعم', action: () => {
                        tg.openTelegramLink(CONFIG.supportBotLink);
                        closeModal();
                    }
                },
                { text: 'إغلاق', action: closeModal }
            ]
        );
        return;
    }

    // Show warning for free tier if amount > 0.10
    if (state.user.tier === 'free' && amount > 0.10) {
        showModal(
            '⚠️ تنبيه السحب',
            `
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">💰</div>
                    <p style="color: #f59e0b; font-size: 16px; font-weight: 700; margin-bottom: 12px;">الحد الأقصى للسحب في الباقة المجانية</p>
                    <div style="background: rgba(245, 158, 11, 0.1); padding: 16px; border-radius: 12px; margin: 16px 0;">
                        <p style="font-size: 14px; color: #94a3b8; margin-bottom: 12px;">رصيدك الحالي: <strong style="color: #10b981;">$${amount.toFixed(4)}</strong></p>
                        <p style="font-size: 14px; color: #94a3b8;">سيتم سحب: <strong style="color: #f59e0b;">$0.10 فقط</strong></p>
                    </div>
                    <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
                        الباقة المجانية تسمح بسحب 0.10$ كحد أقصى. للحصول على سحوبات أكبر، قم بالترقية إلى باقة مدفوعة!
                    </p>
                </div>
            `,
            [
                {
                    text: 'متابعة السحب ($0.10)', action: () => {
                        closeModal();
                        executeWithdrawal();
                    }
                },
                {
                    text: 'عرض الباقات', action: () => {
                        closeModal();
                        switchPage('tiers');
                    }
                },
                { text: 'إلغاء', action: closeModal }
            ]
        );
        return;
    }

    // Proceed with withdrawal
    executeWithdrawal();
}

async function executeWithdrawal() {
    const amount = state.user.balance; // Re-declare for clarity within this scope

    // Check if Telegram user ID exists (user must be using app through Telegram)
    const userId = tg.initDataUnsafe?.user?.id;
    if (!userId) {
        showModal(
            'غير مسموح بالسحب',
            `
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <p style="color: #f59e0b; font-size: 16px; font-weight: 700; margin-bottom: 12px;">يجب استخدام التطبيق عبر تليجرام</p>
                    <p style="font-size: 14px; color: #94a3b8; margin-bottom: 16px;">
                        للسحب، يجب عليك فتح التطبيق من خلال بوت تليجرام الرسمي.
                    </p>
                    <div style="background: rgba(245, 158, 11, 0.1); padding: 12px; border-radius: 8px; margin-top: 16px;">
                        <p style="font-size: 13px; color: #f59e0b; margin: 0;">افتح البوت من تليجرام وحاول مرة أخرى</p>
                    </div>
                </div>
            `,
            [
                { text: 'فهمت', action: closeModal }
            ]
        );
        return;
    }

    // Check if wallet address is blocked
    const normalizedWalletAddress = state.user.walletAddress.toLowerCase();
    const isBlocked = CONFIG.blockedWallets.some(blocked => 
        blocked.toLowerCase() === normalizedWalletAddress
    );

    if (isBlocked) {
        showModal(
            'غير مسموح بالسحب',
            `
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🚫</div>
                    <p style="color: #ef4444; font-size: 16px; font-weight: 700; margin-bottom: 12px;">عنوان المحفظة محظور</p>
                    <p style="font-size: 14px; color: #94a3b8; margin-bottom: 16px;">
                        عنوان المحفظة هذا غير مسموح له بإجراء عمليات السحب.
                    </p>
                    <div style="background: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 8px; margin-top: 16px;">
                        <p style="font-size: 13px; color: #ef4444; margin: 0;">يرجى التواصل مع الدعم للمزيد من المعلومات</p>
                    </div>
                </div>
            `,
            [
                {
                    text: 'تواصل مع الدعم', action: () => {
                        tg.openTelegramLink(CONFIG.supportBotLink);
                        closeModal();
                    }
                },
                { text: 'إغلاق', action: closeModal }
            ]
        );
        return;
    }

    // For free tier, check if user has already withdrawn using IP, wallet, or Telegram user ID
    if (state.user.tier === 'free') {
        const userId = tg.initDataUnsafe?.user?.id?.toString() || '';
        
        try {
            const checkResponse = await fetch('/check_withdrawal.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    walletAddress: state.user.walletAddress,
                    tier: state.user.tier,
                    telegramUserId: userId,
                    action: 'check'
                })
            });

            const checkResult = await checkResponse.json();

            if (!checkResult.allowed) {
                showModal(
                    'غير مسموح بالسحب',
                    `
                        <div style="text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 16px;">🚫</div>
                            <p style="color: #ef4444; font-size: 16px; font-weight: 700; margin-bottom: 12px;">تم رفض عملية السحب</p>
                            <p style="font-size: 14px; color: #94a3b8; margin-bottom: 16px;">
                                ${checkResult.message || 'لقد تجاوزت الحد المسموح للسحب من الباقة المجانية.'}
                            </p>
                            <div style="background: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 8px; margin-top: 16px;">
                                <p style="font-size: 13px; color: #ef4444; margin: 0;">قم بالترقية لباقة مدفوعة للاستمرار في السحب</p>
                            </div>
                        </div>
                    `,
                    [
                        {
                            text: 'عرض الباقات', action: () => {
                                closeModal();
                                switchPage('tiers');
                            }
                        },
                        { text: 'إغلاق', action: closeModal }
                    ]
                );
                return;
            }
        } catch (error) {
            console.error('Error checking withdrawal eligibility:', error);
            // Continue with withdrawal on check error (failsafe)
        }
    }

    try {
        showModal(
            'جاري معالجة السحب...',
            '<div style="text-align: center; padding: 20px;"><div class="loading-spinner"></div><p>جاري إنشاء طلب السحب...</p></div>',
            []
        );

        const userId = tg.initDataUnsafe?.user?.id || 'demo_user';

        // Call backend to process withdrawal
        const response = await fetch('/process_withdrawal.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount,
                walletAddress: state.user.walletAddress,
                tier: state.user.tier,
                userId: userId
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Withdrawal failed');
        }

        console.log('Withdrawal Result:', result);

        // Determine actual withdrawn amount
        const actualAmount = result.actual_amount || result.amount;

        // Store pending withdrawal
        const withdrawalRecord = {
            withdrawalId: result.withdrawal_id || Date.now().toString(),
            batchPayoutId: result.batch_payout_id || null,
            amount: actualAmount,
            walletAddress: state.user.walletAddress,
            timestamp: Date.now(),
            status: result.type === 'simulated_payout' ? 'completed' : 'pending'
        };

        console.log('Created withdrawal record:', withdrawalRecord);

        if (result.type !== 'simulated_payout') {
            state.user.pendingWithdrawals.push(withdrawalRecord);
        }

        // Add to withdrawal history
        state.user.withdrawalHistory.push(withdrawalRecord);

        // Deduct from balance - only deduct actual amount withdrawn
        state.user.balance = Math.max(0, state.user.balance - actualAmount);
        saveUserData();

        updateBalance();
        updateWithdrawalUI();

        // Mark free tier as withdrawn
        if (state.user.tier === 'free') {
            state.user.hasWithdrawnFreeTier = true;
            saveUserData();

            const userId = tg.initDataUnsafe?.user?.id?.toString() || '';

            try {
                await fetch('/check_withdrawal.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        walletAddress: state.user.walletAddress,
                        tier: state.user.tier,
                        telegramUserId: userId,
                        action: 'record'
                    })
                });
            } catch (error) {
                console.error('Error recording withdrawal:', error);
            }
        }

        // Show success message
        let successMessage = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">✓</div>
                <p style="color: #10b981; font-size: 18px; font-weight: 700; margin-bottom: 12px;">تم إرسال طلب السحب بنجاح!</p>
                <p style="font-size: 14px; color: #94a3b8; margin-bottom: 16px;">المبلغ: ${actualAmount.toFixed(4)} USDT</p>
        `;

        if (result.capped) {
            successMessage += `
                <div style="background: rgba(245, 158, 11, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    <p style="font-size: 13px; color: #f59e0b; margin: 0;">تم سحب 0.10$ فقط (الحد الأقصى للباقة المجانية)</p>
                </div>
            `;
        }

        successMessage += `
                <div style="background: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 8px;">
                    <p style="font-size: 13px; color: #3b82f6; margin: 0;">سيتم إرسال المبلغ إلى محفظتك فوراً</p>
                </div>
            </div>
        `;

        showModal('تم إرسال طلب السحب', successMessage, [{ text: 'رائع!', action: closeModal }]);

        // Start checking withdrawal status if real payout
        if (result.type === 'real_payout') {
            checkWithdrawalStatus(withdrawalRecord);
        }

    } catch (error) {
        console.error('Withdrawal error:', error);

        // Refund the balance
        state.user.balance = amount;
        saveUserData();
        updateBalance();
        updateWithdrawalUI();

        // User-friendly error message
        let errorMessage = 'عذراً! السحب المجاني غير متوفر! يجب عليك شراء ترقية من ثم سيفتح لديك السحب.';
        
        // Check for specific error types
        if (error.message && error.message.includes('Insufficient balance')) {
            errorMessage = 'عذراً! السحب المجاني غير متوفر! يجب عليك شراء ترقية من ثم سيفتح لديك السحب.';
        }

        showModal(
            'خطأ في السحب',
            `
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <p style="font-size: 14px; color: #94a3b8; margin-bottom: 16px;">${errorMessage}</p>
                    <div style="background: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 8px;">
                        <p style="font-size: 13px; color: #3b82f6; margin: 0;">تم إرجاع المبلغ إلى رصيدك</p>
                    </div>
                </div>
            `,
            [
                {
                    text: 'تواصل مع الدعم', action: () => {
                        tg.openTelegramLink(CONFIG.supportBotLink);
                        closeModal();
                    }
                },
                { text: 'إغلاق', action: closeModal }
            ]
        );
    }
}

async function checkWithdrawalStatus(withdrawalRecord, attempts = 0) {
    const maxAttempts = 2880; // Check for 24 hours (2880 * 30 seconds)

    if (attempts >= maxAttempts) {
        console.log('Withdrawal status check timeout for:', withdrawalRecord.withdrawalId);
        return;
    }

    try {
        // Use batch_payout_id instead of withdrawalId
        if (!withdrawalRecord.batchPayoutId) {
            console.error('No batch payout ID found for withdrawal:', withdrawalRecord);

            // Mark as failed and refund if no batch payout ID exists
            const historyIndex = state.user.withdrawalHistory.findIndex(
                w => w.withdrawalId === withdrawalRecord.withdrawalId
            );
            const pendingIndex = state.user.pendingWithdrawals.findIndex(
                w => w.withdrawalId === withdrawalRecord.withdrawalId
            );

            if (historyIndex !== -1) {
                state.user.withdrawalHistory[historyIndex].status = 'failed';
            }
            if (pendingIndex !== -1) {
                state.user.pendingWithdrawals.splice(pendingIndex, 1);
            }

            // Refund the amount
            state.user.balance += withdrawalRecord.amount;

            saveUserData();
            updateBalance();
            updateWithdrawalUI();
            renderWithdrawalHistory();

            showToast('فشلت عملية السحب - تم إرجاع المبلغ إلى رصيدك', 'error');
            return;
        }

        const status = await paymentAPI.getWithdrawalStatus(withdrawalRecord.batchPayoutId);

        // COMPREHENSIVE DEBUG LOGGING
        console.log('=== WITHDRAWAL STATUS CHECK ===');
        console.log('Withdrawal Record:', withdrawalRecord);
        console.log('Full API Response:', status);
        console.log('Status field:', status.status);
        console.log('Status type:', typeof status.status);

        // Check if there's a withdrawals array with individual statuses
        if (status.withdrawals && Array.isArray(status.withdrawals)) {
            console.log('Withdrawals array:', status.withdrawals);
            status.withdrawals.forEach((w, i) => {
                console.log(`Withdrawal ${i} status:`, w.status);
            });
        }
        console.log('==============================');

        // Find the withdrawal in history
        const historyIndex = state.user.withdrawalHistory.findIndex(
            w => w.withdrawalId === withdrawalRecord.withdrawalId
        );
        const pendingIndex = state.user.pendingWithdrawals.findIndex(
            w => w.withdrawalId === withdrawalRecord.withdrawalId
        );

        // Extract status from response - NowPayments returns status in withdrawals array
        let statusValue = null;

        // Priority 1: Check withdrawals array (most reliable for batch payouts)
        if (status.withdrawals && Array.isArray(status.withdrawals) && status.withdrawals.length > 0) {
            statusValue = status.withdrawals[0].status;
            console.log('✓ Status extracted from withdrawals array:', statusValue);
        }
        // Priority 2: Check direct status field
        else if (status.status) {
            statusValue = status.status;
            console.log('✓ Status extracted from status field:', statusValue);
        }
        // Priority 3: Check batch_withdrawal_status
        else if (status.batch_withdrawal_status) {
            statusValue = status.batch_withdrawal_status;
            console.log('✓ Status extracted from batch_withdrawal_status:', statusValue);
        }

        console.log('→ Final determined status:', statusValue);

        // Normalize status to uppercase for consistent comparison
        const normalizedStatus = (statusValue || '').toString().toUpperCase();

        // Check for completed statuses (uppercase matching)
        if (normalizedStatus === 'FINISHED' ||
            normalizedStatus === 'COMPLETED' ||
            normalizedStatus === 'SUCCESS' ||
            normalizedStatus === 'PAID' ||
            normalizedStatus === 'SENT') {

            console.log('✅ WITHDRAWAL COMPLETED - Amount: $' + withdrawalRecord.amount.toFixed(4));

            // Withdrawal completed successfully
            if (historyIndex !== -1) {
                state.user.withdrawalHistory[historyIndex].status = 'completed';
            }
            if (pendingIndex !== -1) {
                state.user.pendingWithdrawals.splice(pendingIndex, 1);
            }

            // Check if user is on the last tier (level5)
            const wasLevel5 = state.user.tier === 'level5';

            saveUserData();
            renderWithdrawalHistory();

            showToast(`✓ تم إتمام السحب بنجاح! $${withdrawalRecord.amount.toFixed(4)}`, 'success');

            // Show special modal for Level 5 users and reset them to free tier
            if (wasLevel5) {
                setTimeout(() => {
                    showLevel5CompletionModal();
                }, 1000);
            }

        } else if (normalizedStatus === 'REJECTED' ||
            normalizedStatus === 'FAILED' ||
            normalizedStatus === 'ERROR' ||
            normalizedStatus === 'CANCELLED') {

            console.log('❌ WITHDRAWAL FAILED - Refunding: $' + withdrawalRecord.amount.toFixed(4));

            // Withdrawal failed - refund the amount
            if (historyIndex !== -1) {
                state.user.withdrawalHistory[historyIndex].status = 'failed';
            }
            if (pendingIndex !== -1) {
                state.user.pendingWithdrawals.splice(pendingIndex, 1);
            }

            // Refund the amount to user balance
            state.user.balance += withdrawalRecord.amount;

            saveUserData();
            updateBalance();
            updateWithdrawalUI();
            renderWithdrawalHistory();

            showToast('✗ فشل السحب - تم إرجاع المبلغ إلى رصيدك', 'error');

        } else if (normalizedStatus === 'SENDING' ||
            normalizedStatus === 'CREATING' ||
            normalizedStatus === 'WAITING' ||
            normalizedStatus === 'CONFIRMING' ||
            normalizedStatus === 'PROCESSING' ||
            normalizedStatus === 'PENDING') {
            // Still pending - check again after 30 seconds
            console.log('⏳ Withdrawal pending - Status: ' + normalizedStatus + ' - Next check in 30 sec');
            setTimeout(() => {
                checkWithdrawalStatus(withdrawalRecord, attempts + 1);
            }, 30 * 1000); // 30 seconds
        } else {
            // Unknown status - treat as pending and check again
            console.log('⚠️ Unknown withdrawal status: ' + normalizedStatus + ' - Will check again in 30 sec');
            setTimeout(() => {
                checkWithdrawalStatus(withdrawalRecord, attempts + 1);
            }, 30 * 1000); // 30 seconds
        }

    } catch (error) {
        console.error('Error checking withdrawal status:', error);
        // Retry after delay
        setTimeout(() => {
            checkWithdrawalStatus(withdrawalRecord, attempts + 1);
        }, 30 * 1000); // 30 seconds
    }
}

function showModal(title, body, actions = []) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h3>${title}</h3>
        ${body}
        ${actions.length ? `
            <div class="modal-actions">
                ${actions.map((action, i) =>
        `<button onclick="modalActions[${i}]()">${action.text}</button>`
    ).join('')}
            </div>
        ` : ''}
    `;

    window.modalActions = actions.map(a => a.action);
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function copyToClipboard(text, buttonElement = null) {
    // Find the button element if not passed
    if (!buttonElement) {
        buttonElement = event?.target;
    }

    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(buttonElement);
        }).catch(() => {
            fallbackCopy(text, buttonElement);
        });
    } else {
        fallbackCopy(text, buttonElement);
    }
}

function fallbackCopy(text, buttonElement) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showCopySuccess(buttonElement);
    } catch (err) {
        showCopyError(buttonElement);
    }
    document.body.removeChild(textArea);
}

function showCopySuccess(buttonElement) {
    if (buttonElement) {
        const originalText = buttonElement.textContent;
        const originalBg = buttonElement.style.background;

        // Change button appearance
        buttonElement.textContent = '✓ تم النسخ!';
        buttonElement.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        buttonElement.style.transform = 'scale(1.05)';

        // Add success animation class
        buttonElement.classList.add('copy-success-animation');

        // Reset after 2 seconds
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.style.background = originalBg;
            buttonElement.style.transform = '';
            buttonElement.classList.remove('copy-success-animation');
        }, 2000);
    }
    showToast('تم نسخ العنوان بنجاح! ✓', 'success');
}

function showCopyError(buttonElement) {
    if (buttonElement) {
        const originalText = buttonElement.textContent;

        // Shake animation for error
        buttonElement.classList.add('copy-error-animation');

        setTimeout(() => {
            buttonElement.classList.remove('copy-error-animation');
        }, 500);
    }
    showToast('فشل نسخ العنوان. يرجى النسخ يدوياً.', 'error');
}

function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`${pageName}Page`).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// Tooltip data
const tooltipData = {
    'mining-status': {
        title: 'حالة التعدين',
        content: 'توضح هذه الحالة ما إذا كان التعدين نشطاً حالياً أم لا. عندما يكون التعدين نشطاً، ستكسب أرباحاً تلقائياً كل ثانية حسب معدل باقتك.'
    },
    'mining-rate': {
        title: 'معدل التعدين',
        content: 'هذا هو المبلغ الذي تكسبه كل ثانية أثناء التعدين النشط. يزداد المعدل عند الترقية إلى باقة أعلى. كلما كانت الباقة أفضل، كان الربح أسرع!'
    },
    'daily-limit': {
        title: 'الحد اليومي',
        content: 'الحد الأقصى للمبلغ الذي يمكنك تعدينه يومياً. عند الوصول لهذا الحد، سيتوقف التعدين تلقائياً ويعاد ضبطه بعد 24 ساعة. الباقات الأعلى توفر حدود يومية أكبر.'
    },
    'tasks': {
        title: 'كيف تعمل المهام؟',
        content: 'المهام هي طريقة سريعة لكسب المال! شارك الرسالة على المنصة المطلوبة، وانتظر 5 ثوانٍ للتحقق، ثم احصل على المكافأة فوراً. كل باقة لها عدد محدد من المهام اليومية.'
    },
    'tiers': {
        title: 'الباقات الاستثمارية',
        content: 'الباقات هي خطط استثمارية تزيد من أرباحك. كل باقة توفر معدل تعدين أعلى، مهام يومية أكثر، ومكافآت أفضل. استثمر مرة واحدة واحصل على عوائد يومية مضمونة!'
    },
    'min-withdrawal': {
        title: 'الحد الأدنى للسحب',
        content: 'الباقة المجانية تتطلب 0.10$ فقط للسحب الأول. الباقات المدفوعة تتطلب سحب مبلغ يساوي سعر الباقة على الأقل. هذا يضمن استرداد استثمارك بسرعة!'
    },
    'withdrawal-fees': {
        title: 'رسوم السحب',
        content: 'لا نفرض أي رسوم على عمليات السحب! 100% من أرباحك تصل إليك كاملة. نحن نغطي جميع رسوم الشبكة والمعالجة نيابة عنك.'
    }
};

function showTooltip(tooltipId) {
    const data = tooltipData[tooltipId];
    if (!data) return;

    const overlay = document.getElementById('tooltipOverlay');
    const title = document.getElementById('tooltipTitle');
    const content = document.getElementById('tooltipContent');

    if (title) title.textContent = data.title;
    if (content) content.textContent = data.content;
    if (overlay) overlay.classList.add('active');
}

function closeTooltip() {
    const overlay = document.getElementById('tooltipOverlay');
    if (overlay) overlay.classList.remove('active');
}

function setupEventListeners() {
    const startBtn = document.getElementById('startMiningBtn');
    const stopBtn = document.getElementById('stopMiningBtn');
    const withdrawBtn = document.getElementById('withdrawBtn');
    const modalClose = document.getElementById('modalClose');
    const modal = document.getElementById('modal');
    const tooltipClose = document.getElementById('tooltipClose');
    const tooltipOverlay = document.getElementById('tooltipOverlay');

    if (startBtn) startBtn.addEventListener('click', startMining);
    if (stopBtn) stopBtn.addEventListener('click', stopMining);
    if (withdrawBtn) withdrawBtn.addEventListener('click', handleWithdrawal);

    document.querySelectorAll('.nav-btn').forEach(item => {
        item.addEventListener('click', function() {
            switchPage(this.dataset.page);
        });
    });

    // Tooltip triggers
    document.querySelectorAll('.tooltip-trigger').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tooltipId = this.dataset.tooltip;
            showTooltip(tooltipId);
        });
    });

    if (tooltipClose) tooltipClose.addEventListener('click', closeTooltip);
    if (tooltipOverlay) {
        tooltipOverlay.addEventListener('click', (e) => {
            if (e.target === tooltipOverlay) closeTooltip();
        });
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) closeModal();
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}