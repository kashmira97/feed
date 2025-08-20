# MemberSense Discord Integration - CLAUDE.md

This file provides guidance to Claude Code when working with the MemberSense Discord integration within the feed repository.

## System Overview

MemberSense is a React-based Discord integration that provides:
- **Member Showcase**: Grid display of Discord server members
- **Channel Viewer**: Discord-style interface for viewing channels and messages  
- **Authentication**: Token-based Discord bot authentication
- **Dual Mode**: Demo mode with mock data + Production mode with live Discord API

## Architecture

### Frontend (React)
- **Location**: `/src/components/MemberSenseComponents/`
- **Entry Point**: `App.jsx` handles routing and state management
- **Components**:
  - `MemberSenseLogin/MemberSense.jsx` - Authentication interface
  - `MemberShowcase/MemberShowcase.jsx` - Member grid display
  - `DiscordChannelViewer/DiscordChannelViewer.jsx` - Channel/message viewer
- **Services**: `src/services/Dataservice.js` - API calls and mock data generation

### Backend (Bun + Discord.js)
- **Location**: `/membersense/backend/`
- **Server**: `src/server.js` - Main Bun server with CORS support
- **Discord Bot**: `src/discordBot.js` - Discord.js integration
- **Port**: 3000 (configurable)

## Environment Configuration

### Required Environment Variables

**Frontend (.env in feed root)**:
```env
VITE_API_BASE_URL=http://localhost:3000/
VITE_DISCORD_BOT_TOKEN=your_discord_bot_token_here
```

**Backend (membersense/backend/.env)**:
```env
DISCORD_BOT_TOKEN=your_discord_bot_token_here
```

### Token Flow
1. Frontend checks for `VITE_DISCORD_BOT_TOKEN` environment variable
2. If available, auto-populates token field and enables one-click authentication
3. Backend validates token and creates Discord.js client session
4. Session ID returned to frontend for subsequent API calls

## API Endpoints

**Base URL**: `http://localhost:3000/api`

- `POST /auth/login` - Authenticate with Discord bot token
- `POST /auth/logout` - Destroy bot session  
- `GET /members` - Fetch guild members (requires auth)
- `GET /channels` - Fetch guild channels (requires auth)
- `GET /messages?channelId=<id>&limit=<num>` - Fetch channel messages (requires auth)

**Authentication**: All endpoints except login require `Authorization: SESSION_ID` header.

## Discord Bot Setup

### Required Discord Permissions
**OAuth2 Scopes**:
- `bot` - Bot application access
- `guilds` - Server access
- `guilds.members.read` - Member information

**Bot Permissions** (integer: 592896):
- View Channels
- View Server Insights  
- Send Messages
- Read Message History

### OAuth2 Configuration
**Redirect URI**: `http://localhost:8887/feed/#members=discord`

**Privileged Gateway Intents** (must be enabled):
- Presence Intent
- Server Members Intent
- Message Content Intent

## Development Workflow

### Starting the System
1. **Backend**: 
   ```bash
   cd membersense/backend
   bun run src/server.js
   ```

2. **Frontend**:
   ```bash
   yarn build
   python -m http.server 8887
   ```

3. **Access**: `http://localhost:8887/feed/#members=discord`

### Why Not yarn dev?
- Hash-driven navigation requires static serving
- Swiper component integration needs proper build assets
- Local embedding samples require static file structure

## Component Integration

### URL Hash Navigation
- `#members=discord` - Triggers MemberSense overlay
- App.jsx detects hash and shows MemberSense interface
- Supports fullscreen mode and return navigation

### State Management
- **Authentication State**: Token, sessionId, serverInfo stored in App.jsx
- **Data State**: Members, channels, messages cached in parent component
- **UI State**: Loading, errors, current view managed hierarchically

### Mock Data System
- Toggle between demo and production modes
- Mock data generators in Dataservice.js
- Consistent interfaces for both real and fake data

## Common Issues & Troubleshooting

### "Unauthorized" Errors
- Check API endpoints include `/api` prefix
- Verify backend .env has correct DISCORD_BOT_TOKEN
- Ensure frontend .env has VITE_DISCORD_BOT_TOKEN
- Confirm backend server is running on port 3000

### "Manage Server Permission" Error
- User must have "Manage Server" permission on Discord server
- Bot must be properly authorized with correct OAuth2 URL
- Check Discord Developer Portal bot permissions

### Loading Spinner Stuck
- Check browser console for network errors
- Verify Discord bot token is valid and not expired
- Ensure Discord server has bot properly added

### CORS Issues
- Backend server.js includes CORS headers for localhost
- If deploying, update CORS origin settings
- Check browser network tab for blocked requests

## File Structure

```
membersense/
├── README.md                     # Main documentation
├── CLAUDE.md                     # This file - Claude Code guidance
├── backend/
│   ├── README.md                 # Backend-specific docs
│   ├── DESIGNDOC.md             # Technical architecture
│   ├── GUIDE.md                 # Bun setup guide
│   ├── .env                     # Backend environment (create this)
│   ├── src/
│   │   ├── server.js            # Main Bun server
│   │   └── discordBot.js        # Discord.js integration
│   └── package.json             # Backend dependencies
├── index.html                   # Standalone demo page
└── (frontend components in src/components/MemberSenseComponents/)
```

## Future Improvements

### Immediate Tasks
- [ ] Implement proper error handling for expired tokens
- [ ] Add connection status indicators
- [ ] Cache Discord data for offline development
- [ ] Add rate limiting for API calls

### Long-term Enhancements
- [ ] WebSocket integration for real-time updates  
- [ ] Multiple server support
- [ ] Role-based permission display
- [ ] Message search functionality
- [ ] Integration with Google Sheets for member data export

## Development Notes

- **Always start backend before frontend testing**
- **Use environment tokens to avoid manual entry during development**
- **Test both demo and production modes**
- **Verify Discord bot permissions when adding new API features**
- **Check browser console for authentication/API errors**
- **Use `yarn build` instead of `yarn dev` for proper integration**

## Security Considerations

- Discord bot tokens are sensitive - never commit to version control
- Frontend environment variables are exposed to client - use only for non-sensitive config
- Backend handles actual Discord token securely
- Session IDs provide temporary access without exposing bot token
- CORS restricts backend access to localhost during development

## Token Management & Commit Safety

**IMPORTANT**: The `VITE_DISCORD_BOT_TOKEN` gets embedded in the built JavaScript bundle.

### Before Committing:
1. **Always remove tokens** from `.env` before committing:
   ```bash
   # Remove token temporarily
   VITE_DISCORD_BOT_TOKEN=
   yarn build
   # Commit the clean build
   ```

2. **After committing**, add your token back:
   ```bash
   # Add token back for local development
   VITE_DISCORD_BOT_TOKEN=your_token_here
   yarn build
   ```

### Safety Pattern:
- Use `.env.example` with empty values for commits
- Keep actual tokens only in local `.env` (git-ignored)
- Always build without tokens before committing `dist/` files