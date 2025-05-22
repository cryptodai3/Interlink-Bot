const axios = require('axios');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');

const API_BASE_URL = 'https://prod.interlinklabs.ai/api/v1';
const TOKENS_FILE_PATH = path.join(__dirname, 'tokens.txt');
const PROXIES_FILE_PATH = path.join(__dirname, 'proxies.txt');
const CLAIM_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

// Colors for console hype
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const logger = {
  info: (msg) => console.log(`${colors.green}[✓] ${msg}${colors.reset}`),
  wallet: (msg) => console.log(`${colors.yellow}[➤] ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}[⚠] ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}[✗] ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`),
  loading: (msg) => console.log(`${colors.cyan}[⟳] ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.white}[➤] ${msg}${colors.reset}`),
  banner: () => {
    console.clear();
    console.log(`${colors.cyan}${colors.bold}`);
    console.log('---------------------------------------------');
    console.log('      Interlink Auto Bot - cryptodai3');
    console.log('---------------------------------------------');
    console.log(colors.reset);
  }
};

// Load tokens from tokens.txt
function readTokens() {
  if (!fs.existsSync(TOKENS_FILE_PATH)) {
    logger.error(`Tokens file not found at ${TOKENS_FILE_PATH}. Create one token per line.`);
    process.exit(1);
  }
  const tokensRaw = fs.readFileSync(TOKENS_FILE_PATH, 'utf8');
  const tokens = tokensRaw.split('\n').map(t => t.trim()).filter(Boolean);
  if (!tokens.length) {
    logger.error('Tokens file is empty. Add one token per line.');
    process.exit(1);
  }
  return tokens;
}

// Load proxies from proxies.txt (optional)
function readProxies() {
  if (!fs.existsSync(PROXIES_FILE_PATH)) {
    logger.warn('Proxies file not found. Running without proxies.');
    return [];
  }
  const proxiesRaw = fs.readFileSync(PROXIES_FILE_PATH, 'utf8');
  return proxiesRaw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

// Pick a random proxy from list
function getRandomProxy(proxies) {
  if (!proxies.length) return null;
  return proxies[Math.floor(Math.random() * proxies.length)];
}

// Create Axios instance with token + optional proxy
function createApiClient(token, proxyUrl = null) {
  const config = {
    baseURL: API_BASE_URL,
    headers: {
      'User-Agent': 'okhttp/4.12.0',
      'Accept-Encoding': 'gzip',
      'Authorization': `Bearer ${token}`,
    },
    timeout: 30000,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    proxy: false,
  };

  if (proxyUrl) {
    try {
      if (proxyUrl.startsWith('socks://') || proxyUrl.startsWith('socks4://') || proxyUrl.startsWith('socks5://')) {
        config.httpsAgent = new SocksProxyAgent(proxyUrl);
      } else {
        config.httpsAgent = new HttpsProxyAgent(proxyUrl);
      }
      logger.info(`Using proxy: ${proxyUrl}`);
    } catch (e) {
      logger.error(`Failed to setup proxy agent: ${e.message}`);
    }
  }

  return axios.create(config);
}

// Format milliseconds to HH:mm:ss
function formatTime(ms) {
  if (ms <= 0) return '00:00:00';
  const sec = Math.floor((ms / 1000) % 60);
  const min = Math.floor((ms / 1000 / 60) % 60);
  const hr = Math.floor(ms / 1000 / 60 / 60);
  return [hr, min, sec].map(n => n.toString().padStart(2, '0')).join(':');
}

// API calls
async function getCurrentUser(api) {
  try {
    const res = await api.get('/auth/current-user');
    return res.data.data;
  } catch {
    return null;
  }
}

async function getTokenBalance(api) {
  try {
    const res = await api.get('/token/get-token');
    return res.data.data;
  } catch {
    return null;
  }
}

async function checkIsClaimable(api) {
  try {
    const res = await api.get('/token/check-is-claimable');
    return res.data.data;
  } catch {
    return { isClaimable: false, nextFrame: Date.now() + 5 * 60 * 1000 };
  }
}

async function claimAirdrop(api) {
  try {
    const res = await api.post('/token/claim-airdrop');
    return res.data;
  } catch {
    return null;
  }
}

// Display user info + tokens
function displayUserInfo(user, tokens) {
  if (!user || !tokens) return;

  console.log('\n' + '='.repeat(50));
  console.log(`${colors.bold}${colors.white}USER INFO${colors.reset}`);
  console.log(`Username: ${user.username}`);
  console.log(`Email: ${user.email}`);
  console.log(`Wallet: ${user.connectedAccounts?.wallet?.address || 'Not connected'}`);
  console.log(`User ID: ${user.loginId}`);
  console.log(`Referral ID: ${tokens.userReferralId}`);

  console.log('\n' + '='.repeat(50));
  console.log(`${colors.bold}${colors.yellow}TOKEN BALANCE${colors.reset}`);
  console.log(`Gold Tokens: ${tokens.interlinkGoldTokenAmount}`);
  console.log(`Silver Tokens: ${tokens.interlinkSilverTokenAmount}`);
  console.log(`Diamond Tokens: ${tokens.interlinkDiamondTokenAmount}`);
  console.log(`Interlink Tokens: ${tokens.interlinkTokenAmount}`);
  console.log(`Last Claim: ${moment(tokens.lastClaimTime).format('YYYY-MM-DD HH:mm:ss')}`);
  console.log('='.repeat(50) + '\n');
}

// Main flow per account
async function runAccount(token, proxies, idx) {
  logger.banner();
  logger.info(`Starting Account #${idx + 1}`);

  let proxy = getRandomProxy(proxies);
  let api = createApiClient(token, proxy);

  // Try fetching user info with proxy first, fallback no proxy
  let user = await getCurrentUser(api);
  if (!user) {
    logger.warn(`Failed to fetch user info with proxy, retrying without proxy...`);
    api = createApiClient(token);
    user = await getCurrentUser(api);
    if (!user) {
      logger.error(`Failed to fetch user info. Skipping account #${idx + 1}`);
      return;
    }
  }

  let tokens = await getTokenBalance(api);
  if (!tokens) {
    logger.warn(`Failed to get token balance. Skipping account #${idx + 1}`);
    return;
  }

  displayUserInfo(user, tokens);

  async function claimCycle() {
    if (proxies.length) {
      proxy = getRandomProxy(proxies);
      api = createApiClient(token, proxy);
    }

    const claimStatus = await checkIsClaimable(api);
    if (claimStatus.isClaimable) {
      logger.loading(`Account #${idx + 1}: Airdrop is claimable. Claiming now...`);
      const claimRes = await claimAirdrop(api);
      if (claimRes) {
        logger.success(`Account #${idx + 1}: Successfully claimed airdrop!`);
      } else {
        logger.error(`Account #${idx + 1}: Failed to claim airdrop.`);
      }
      tokens = await getTokenBalance(api);
      displayUserInfo(user, tokens);
    } else {
      const nextTime = new Date(claimStatus.nextFrame).getTime();
      const now = Date.now();
      const waitMs = nextTime - now;
      logger.info(`Account #${idx + 1}: Not claimable yet. Next claim available in ${formatTime(waitMs)}.`);
    }
  }

  // Run claimCycle immediately, then every 4 hours
  await claimCycle();
  setInterval(claimCycle, CLAIM_INTERVAL_MS);
}

// Start bot for all accounts
async function startBot() {
  const tokens = readTokens();
  const proxies = readProxies();

  for (let i = 0; i < tokens.length; i++) {
    runAccount(tokens[i], proxies, i).catch(e => {
      logger.error(`Error in account #${i + 1}: ${e.message}`);
    });
  }
}

startBot();
