# Linear Hill Charts

Visualize your Linear issues as interactive hill charts. Track progress from "figuring things out" to "making it happen" with an intuitive drag-and-drop interface.

## Features

- **OAuth 2.0 Authentication** - Secure integration with Linear's official OAuth flow
- **Auto-sync** with Linear issues based on labels
- **Drag-and-drop** positioning to track progress
- **Multiple projects** - organize different hill charts
- **Browser storage** - positions persist locally
- **Real-time updates** - syncs with Linear every 5 minutes
- **Token refresh** - automatic token renewal for uninterrupted access

## Getting Started

### Prerequisites

- Node.js 20.3.0 or higher
- A Linear account with workspace admin access
- Linear OAuth application credentials

### OAuth Application Setup

1. **Create a Linear OAuth Application**:
   - Go to [Linear Settings > API > Applications](https://linear.app/settings/api/applications)
   - Click "New OAuth application"
   - Fill in the application details:
     - **Name**: Linear Hill Charts
     - **Description**: Visualize Linear issues as interactive hill charts
     - **Redirect URLs**: Add your callback URLs:
       - Development: `http://localhost:3000/api/auth/callback`
       - Production: `https://yourdomain.com/api/auth/callback`
     - **Scopes**: Select `read` and `write`

2. **Copy your OAuth credentials**:
   - Client ID
   - Client Secret (keep this secure!)

### Installation

1. **Clone or download** this repository

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your OAuth credentials:
   ```env
   LINEAR_OAUTH_CLIENT_ID=your_client_id_here
   LINEAR_OAUTH_CLIENT_SECRET=your_client_secret_here
   LINEAR_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback
   SESSION_SECRET=your_random_session_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

   Generate a secure session secret:
   ```bash
   openssl rand -base64 32
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. Click "Connect with Linear" on the setup page
2. Authorize the application in Linear
3. Create your first project:
   - Choose a name for your hill chart
   - Select a Linear team
   - Enter a label filter (e.g., "hill-chart")
4. Add the label to issues in Linear that you want to track
5. Start dragging issues along the hill to track their progress!

## How Hill Charts Work

Hill charts are inspired by [Basecamp's hill charts](https://basecamp.com/features/hill-charts) and provide a visual way to track project progress:

### The Hill Metaphor

- **Left side (0-50%)**: "Figuring it out"
  - High uncertainty
  - Exploration and discovery
  - Understanding the problem

- **Peak (50%)**: Maximum uncertainty
  - Transition point
  - Key decisions being made

- **Right side (50-100%)**: "Making it happen"
  - Decreasing uncertainty
  - Execution mode
  - Shipping and finishing

### Using the Interface

- **Drag horizontally** - Move issues along the hill to update their progress
- **Color indicators** - Priority levels shown by colored dots
  - Red: Urgent
  - Orange: High
  - Blue: Medium
  - Gray: Low
- **Sync button** - Manually refresh issues from Linear
- **Auto-sync** - Issues automatically refresh every 5 minutes

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── api/
│   │   └── auth/            # OAuth API routes
│   │       ├── login/       # Initiate OAuth flow
│   │       ├── callback/    # OAuth callback handler
│   │       ├── token/       # Token endpoint with auto-refresh
│   │       ├── logout/      # Logout and token revocation
│   │       └── session/     # Session status check
│   ├── setup/               # OAuth login page
│   ├── projects/            # Projects list and individual views
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Home page (redirects)
├── components/
│   ├── hill-chart/          # Hill chart visualization
│   ├── projects/            # Project management UI
│   ├── layout/              # Layout components
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── auth/                # OAuth and session management
│   │   ├── oauth.ts         # OAuth utilities
│   │   └── session.ts       # Encrypted session management
│   ├── linear/              # Linear API integration
│   ├── storage/             # localStorage management
│   ├── store/               # Zustand state management
│   ├── hooks/               # React hooks
│   └── utils/               # Utility functions
└── types/                   # TypeScript type definitions
```

## Technical Details

### Built With

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Query** - Server state
- **Linear SDK** - Linear API client
- **Zod** - Runtime validation

### Authentication & Security

- **OAuth 2.0** - Industry-standard authorization protocol
- **PKCE** - Proof Key for Code Exchange for enhanced security
- **Encrypted Sessions** - Server-side encrypted cookie sessions
- **Automatic Token Refresh** - Tokens refresh automatically before expiration
- **Secure Storage** - OAuth tokens never stored in browser localStorage
- **CSRF Protection** - State parameter validation

### Data Storage

- **OAuth Tokens**: Encrypted server-side session cookies
- **Projects**: Browser localStorage
- **Issue Positions**: Browser localStorage
- **Issue Metadata**: Fetched from Linear (not stored)

### Browser Support

Modern browsers with localStorage support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Deployment

### Environment Variables (Production)

Update your production environment variables:

```env
LINEAR_OAUTH_CLIENT_ID=your_production_client_id
LINEAR_OAUTH_CLIENT_SECRET=your_production_client_secret
LINEAR_OAUTH_REDIRECT_URI=https://yourdomain.com/api/auth/callback
SESSION_SECRET=your_production_session_secret
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
```

### OAuth Application Settings

In your Linear OAuth application settings, add your production redirect URL:
- `https://yourdomain.com/api/auth/callback`

### Deployment Platforms

This app works with any Next.js-compatible platform:
- Vercel (recommended)
- Netlify
- Railway
- Your own server

## Troubleshooting

### OAuth Issues

**Problem**: "OAuth error" or "Invalid state"

**Solutions**:
- Verify your OAuth credentials are correct
- Check redirect URI matches exactly what's in Linear settings
- Ensure SESSION_SECRET is set
- Try clearing browser cookies and logging in again

### Connection Issues

**Problem**: "Failed to get access token"

**Solutions**:
- Check your internet connection
- Verify OAuth application is active in Linear
- Check server logs for detailed error messages
- Try logging out and back in

### No Issues Showing

**Problem**: "No issues found with label X"

**Solutions**:
- Verify issues have the correct label in Linear
- Check you selected the right team
- Try clicking the "Sync" button
- Ensure the label name matches exactly (case-sensitive)

### Issues Not Saving Position

**Problem**: Positions reset after refresh

**Solutions**:
- Check browser allows localStorage
- Ensure you're not in private/incognito mode
- Try a different browser
- Check browser storage quota

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Testing OAuth Flow Locally

1. Ensure `.env.local` is properly configured
2. Start the development server: `npm run dev`
3. Navigate to `http://localhost:3000`
4. Click "Connect with Linear"
5. Authorize the application
6. You should be redirected back to `/projects`

## Submitting to Linear Marketplace

This integration is built following Linear's OAuth best practices and is ready for marketplace submission:

1. **OAuth 2.0** - Uses recommended OAuth flow instead of API keys
2. **Refresh Tokens** - Implements token refresh for long-lived sessions
3. **Minimal Scopes** - Requests only required permissions (`read`, `write`)
4. **Security** - Implements PKCE, CSRF protection, and secure token storage
5. **No Hardcoded Credentials** - All sensitive data in environment variables

To submit to the Linear marketplace:
1. Visit the [Linear Integration Directory](https://linear.app/docs/integration-directory)
2. Fill out the submission form
3. Contact integrations@linear.app with your assets

## Roadmap

Future enhancements:
- [ ] Backend database for multi-device sync
- [ ] Position history and timeline view
- [ ] Export to PDF/PNG
- [ ] Multiple label filters per project
- [ ] Issue filtering by assignee, state, priority
- [ ] Collaborative features
- [ ] Mobile app
- [ ] Webhooks for real-time updates

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## Security

If you discover a security vulnerability, please email the maintainer directly rather than opening an issue.

## License

MIT

## Acknowledgments

- Hill chart concept inspired by [Basecamp](https://basecamp.com)
- Built with tools from [Linear](https://linear.app)
- UI components from [shadcn/ui](https://ui.shadcn.com)
