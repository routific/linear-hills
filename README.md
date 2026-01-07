# Linear Hill Charts

Visualize your Linear issues as interactive hill charts. Track progress from "figuring things out" to "making it happen" with an intuitive drag-and-drop interface.

## Features

- **Auto-sync** with Linear issues based on labels
- **Drag-and-drop** positioning to track progress
- **Multiple projects** - organize different hill charts
- **Browser storage** - positions persist locally
- **Real-time updates** - syncs with Linear every 5 minutes

## Getting Started

### Prerequisites

- Node.js 20.3.0 or higher
- A Linear account with API access
- Linear API key ([Get one here](https://linear.app/settings/api))

### Installation

1. **Clone or download** this repository

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. Enter your Linear API key on the setup page
2. Click "Test Connection" to verify
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
│   ├── setup/               # API key setup page
│   ├── projects/            # Projects list and individual views
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Home page (redirects)
├── components/
│   ├── hill-chart/          # Hill chart visualization
│   ├── projects/            # Project management UI
│   ├── layout/              # Layout components
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── linear/              # Linear API integration
│   ├── storage/             # localStorage management
│   ├── store/               # Zustand state management
│   ├── hooks/               # React hooks
│   └── utils/               # Utility functions
└── types/                   # TypeScript type definitions
```

## Technical Details

### Built With

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Query** - Server state
- **Linear SDK** - Linear API client
- **Zod** - Runtime validation

### Data Storage

- **API Key**: Stored in browser localStorage
- **Projects**: Stored in browser localStorage
- **Issue Positions**: Stored in browser localStorage
- **Issue Metadata**: Fetched from Linear (not stored)

### Browser Support

Modern browsers with localStorage support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Troubleshooting

### Connection Issues

**Problem**: "Failed to connect to Linear"

**Solutions**:
- Verify your API key is correct
- Check you have internet connection
- Ensure your Linear account has API access
- Try generating a new API key

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

### Environment Variables

No environment variables required! The app uses localStorage for all configuration.

## Roadmap

Future enhancements:
- [ ] Backend sync for multi-device support
- [ ] Position history and timeline view
- [ ] Export to PDF/PNG
- [ ] Multiple label filters per project
- [ ] Issue filtering by assignee, state, priority
- [ ] Collaborative features
- [ ] Mobile app

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT

## Acknowledgments

- Hill chart concept inspired by [Basecamp](https://basecamp.com)
- Built with tools from [Linear](https://linear.app)
- UI components from [shadcn/ui](https://ui.shadcn.com)
