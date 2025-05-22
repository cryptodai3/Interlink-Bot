const fs = require("fs");
const path = require("path");
const readline = require('readline');
const axios = require("axios");
const chalk = require("chalk");

const SESSIONS_DIR = path.join(__dirname, "sessions");
const ACCOUNTS_FILE = path.join(__dirname, "accounts.json");
const API_BASE_URL = "https://prod.interlinklabs.ai/api/v1";

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

function logInfo(msg) {
  console.log(chalk.green("[✓]"), msg);
}
function logError(msg) {
  console.log(chalk.red("[✗]"), msg);
}
function logStep(msg) {
  console.log(chalk.cyan("[➤]"), msg);
}

function saveSession(email, token) {
  const filepath = path.join(SESSIONS_DIR, `${email}.json`);
  fs.writeFileSync(filepath, JSON.stringify({ token }, null, 2));
}

function getSession(email) {
  const filepath = path.join(SESSIONS_DIR, `${email}.json`);
  if (fs.existsSync(filepath)) {
    const data = fs.readFileSync(filepath);
    return JSON.parse(data).token;
  }
  return null;
}

async function loginFlow(account) {
  logStep(`Logging in for: ${account.email}`);

  try {
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      loginId: account.loginId,
      passcode: account.passcode,
      email: account.email,
    });

    if (!loginRes.data.success) throw new Error("Login failed.");

    const otp = readline.question(`Enter OTP for ${account.email}: `);

    const otpRes = await axios.post(`${API_BASE_URL}/auth/verify-email-otp`, {
      email: account.email,
      otp,
    });

    if (!otpRes.data.data || !otpRes.data.data.accessToken)
      throw new Error("OTP verification failed.");

    const token = otpRes.data.data.accessToken;
    saveSession(account.email, token);
    logInfo(`Login successful for ${account.email}`);
    return token;
  } catch (err) {
    logError(`Login error for ${account.email}: ${err.message}`);
    return null;
  }
}

async function claimToken(token, email) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "User-Agent": "okhttp/4.12.0",
    "Accept-Encoding": "gzip",
  };
  try {
    const userRes = await axios.get(`${API_BASE_URL}/auth/current-user`, { headers });
    logInfo(`User: ${userRes.data.data.username} (${email})`);

    const checkRes = await axios.get(`${API_BASE_URL}/token/check-is-claimable`, { headers });

    if (checkRes.data.data.isClaimable) {
      const claimRes = await axios.post(`${API_BASE_URL}/token/claim-airdrop`, {}, { headers });
      if (claimRes.data.success) {
        logInfo(`Airdrop claimed successfully for ${email}!`);
      } else {
        logError(`Failed to claim for ${email}.`);
      }
    } else {
      logStep(`Not claimable yet for ${email}. Next: ${new Date(checkRes.data.data.nextFrame).toLocaleString()}`);
    }
  } catch (err) {
    logError(`Error claiming for ${email}: ${err.message}`);
  }
}

async function main() {
  if (!fs.existsSync(ACCOUNTS_FILE)) {
    logError("accounts.json file not found!");
    return;
  }

  const accounts = JSON.parse(fs.readFileSync(ACCOUNTS_FILE));

  for (const account of accounts) {
    let token = getSession(account.email);
    if (!token) {
      token = await loginFlow(account);
    }
    if (token) await claimToken(token, account.email);
  }
}

main();
