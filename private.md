# Interlink Multi-Account Bot

Automate multiple Interlink accounts simultaneously with this powerful bot.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (Version 16 or higher required)
- **5+ Interlink accounts** with login credentials

### Installation

1. **Install Node.js**:

2. **Download and setup the bot**:
   ```bash
   npm install
   ```

## 📁 File Setup

### 1. accounts.json - Add Your Accounts
Create this file with your account details:

```json
[
  {
    "name": "Account1",
    "loginId": "your_username_1",
    "passcode": "your_password_1",
    "email": "your_email_1@gmail.com"
  },
  {
    "name": "Account2",
    "loginId": "your_username_2", 
    "passcode": "your_password_2",
    "email": "your_email_2@gmail.com"
  },
  {
    "name": "Account3",
    "loginId": "your_username_3",
    "passcode": "your_password_3",
    "email": "your_email_3@gmail.com"
  },
  {
    "name": "Account4",
    "loginId": "your_username_4",
    "passcode": "your_password_4",
    "email": "your_email_4@gmail.com"
  },
  {
    "name": "Account5",
    "loginId": "your_username_5",
    "passcode": "your_password_5",
    "email": "your_email_5@gmail.com"
  }
]
```

### 2. proxies.txt - Add Proxies (Recommended for multiple accounts)
```txt
# HTTP proxies with authentication
http://username:password@proxy1.com:8080
http://username:password@proxy2.com:8080

# SOCKS5 proxies
socks5://username:password@proxy3.com:1080
socks5://username:password@proxy4.com:1080

# Proxies without authentication
http://proxy5.com:8080
socks5://proxy6.com:1080

# Add more as needed
http://proxy7.com:8080
http://proxy8.com:8080
```

## 🚦 How to Use

### First Time Setup:
```bash
node index.js
```

**The bot will guide you through:**
1. Adding your first account
2. OTP verification via email
3. Saving login tokens

### Main Menu Options:
```
=== ACCOUNT MANAGER ===
Found X account(s)

Options:
1. Run all accounts
2. Add new account  
3. Remove account
4. Run single account
5. Exit
```

### Adding More Accounts:
1. Run the bot: `node index.js`
2. Choose option `2` (Add new account)
3. Enter account details:
   - Login ID/email
   - Passcode
   - Email for OTP
   - Account name (for identification)
4. Complete OTP verification for each account

### Running the Bot:
- **Option 1**: Run all accounts simultaneously
- **Option 4**: Run specific account only
- Each account shows individual countdown timer
- Automatic token claiming every 4 hours
- Automatic spin wheel operation

## 🎯 Features

- ✅ **Multi-Account Support**: Run 5+ accounts simultaneously
- ✅ **Automatic Claims**: Claims tokens every 4 hours automatically
- ✅ **Spin Wheel**: Automatically uses spin tickets
- ✅ **Individual Timers**: Each account has its own countdown
- ✅ **Proxy Support**: Use different proxies for each account
- ✅ **Token Management**: Secure storage of login tokens
- ✅ **Color-Coded Logs**: Easy identification of each account
- ✅ **Graceful Shutdown**: Stop all accounts with Ctrl+C

## ⚙️ Account Management

### Maximum Accounts:
- **Recommended**: 5-10 accounts
- **Technical Limit**: No hard limit, but practical limits apply
- **Performance**: Each account runs independently

### File Structure Created:
```
interlink-bot/
├── accounts.json          # Account credentials
├── proxies.txt           # Proxy list
├── accounts/             # Auto-created directory
│   ├── Account1/         # Account 1 data
│   │   ├── token.txt     # Auth token
│   │   ├── mini_token.txt # Mini app token  
│   │   └── device.txt    # Device ID
│   ├── Account2/         # Account 2 data
│   └── ...
```

## 🔧 Troubleshooting

### Common Issues:

**❌ OTP Not Received:**
- Check spam folder
- Wait 2-3 minutes
- Verify email address in accounts.json
- Ensure email is registered with Interlink

**❌ Login Failed:**
- Verify login credentials
- Check internet connection
- Try without proxies first
- Ensure account is active

**❌ Bot Not Starting:**
- Check Node.js version: `node --version`
- Verify all files are in same directory
- Run `npm install` to install dependencies

**❌ Connection Errors:**
- Test without proxies
- Check proxy format in proxies.txt
- Verify proxy credentials
- Try different proxy types

### Performance Tips:
- Use residential proxies for better success
- Add 2-3 second delays between account operations
- Monitor logs for any account-specific issues
- Keep Node.js updated to latest LTS version

## 🛑 Stopping the Bot

**Graceful Shutdown:**
```bash
Press Ctrl+C
```
- All accounts will stop gracefully
- Tokens and progress are saved
- Can restart anytime without re-login

**Force Stop:**
```bash
Ctrl+Z or close terminal
```
- May require re-login for some accounts

## 📝 Important Notes

- **First Run**: Requires OTP verification for each account
- **Subsequent Runs**: Uses saved tokens (no OTP needed)
- **Token Expiry**: Tokens typically last 30 days
- **Security**: Credentials stored locally in accounts.json
- **Updates**: Check for bot updates regularly
- **Compliance**: Use at your own risk, follow platform TOS

## 🔄 Maintenance

**Regular Checks:**
- Verify all accounts are running properly
- Check for updated dependencies: `npm update`
- Monitor token balances in logs
- Update proxies if needed

**File Backups:**
- Regularly backup `accounts.json` and `accounts/` directory
- Keep proxies.txt updated with working proxies

## 📞 Support

If you encounter issues:
1. Check this README first
2. Verify all file formats are correct
3. Ensure Node.js version is compatible
4. Check account credentials are valid

---

**Happy Farming! 🌟**
