# Interactive Letter Application

A multi-level interactive letter application with 3D flip animations and lazy loading, built according to the provided UML workflow specification.

## Features

### Core Functionality
- **3D Letter Animation**: Beautiful 3D flip animation when transitioning from phone input to language selection
- **Multi-Language Support**: Full support for English, Arabic, and Persian languages
- **Lazy Loading**: Optimized performance with Intersection Observer API and lazy loading for SVGs and content
- **Multi-Level Questions**: Hierarchical question structure with nested sub-questions
- **Responsive Design**: Mobile-first design that works on all devices

### Technical Implementation
- **Frontend**: React.js with modern hooks and component architecture
- **Backend**: Node.js with Express.js REST API
- **Styling**: Custom CSS with advanced animations and responsive design
- **Data Storage**: JSON-based data structure for questions and content
- **API Integration**: RESTful API with fallback mechanisms for offline functionality

## Architecture

### Frontend Structure
```
client/
├── src/
│   ├── components/
│   │   ├── LetterFront.js      # Phone input with 3D letter
│   │   ├── LetterBack.js       # Language selection
│   │   ├── HomePage.js         # Main question page
│   │   ├── SubPage.js          # Sub-questions and content
│   │   └── LazyImage.js        # Lazy loading component
│   ├── hooks/
│   │   └── useLazyLoad.js      # Custom lazy loading hook
│   ├── services/
│   │   └── api.js              # API service layer
│   └── App.js                  # Main application component
```

### Backend Structure
```
server/
├── routes/
│   ├── questions.js            # Question management API
│   └── content.js              # Content and language API
├── data/
│   └── questions.json          # Question data storage
└── index.js                    # Express server setup
```

## UML Workflow Implementation

The application follows the exact UML workflow specification:

1. **Letter Front**: Displays SVG letter with phone number input
2. **3D Flip Animation**: Smooth transition using CSS transforms
3. **Language Selection**: Three language options with native text
4. **Home Page**: Main question with multiple choice options
5. **Sub-Pages**: Nested questions with optional letter content
6. **Lazy Loading**: All content loaded on-demand for performance

## API Endpoints

### Questions API
- `GET /api/questions/home/:language` - Get home question
- `GET /api/questions/:questionId/:language` - Get specific question
- `GET /api/questions/all/:language` - Get all questions
- `POST /api/questions/navigate` - Navigate between questions

### Content API
- `GET /api/content/languages` - Get available languages
- `GET /api/content/letter/:questionId/:language` - Get letter content
- `POST /api/content/phone` - Store phone number
- `GET /api/content/stats` - Get application statistics

## Deployment

### Frontend
- **Deployed URL**: https://rdwzwhlr.manus.space
- **Framework**: React.js (Static Build)
- **Features**: Responsive design, PWA-ready

### Backend
- **API URL**: https://5000-i3sr8fbqi05gdua3a20nj-06d21d07.manus.computer
- **Framework**: Node.js + Express
- **Features**: CORS enabled, JSON data storage

## Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Frontend Setup
```bash
cd client
npm install
npm start
```

### Backend Setup
```bash
cd server
npm install
npm start
```

### Environment Variables
```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api

# Backend (.env)
PORT=5000
```

## Performance Features

### Lazy Loading
- **Intersection Observer**: Efficient viewport detection
- **SVG Optimization**: Lazy loaded graphics with placeholders
- **Content Streaming**: Progressive content loading

### 3D Animations
- **GPU Acceleration**: Hardware-accelerated transforms
- **Smooth Transitions**: Cubic-bezier easing functions
- **Mobile Optimized**: Touch-friendly interactions

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Flexible Layouts**: CSS Grid and Flexbox
- **Touch Support**: Enhanced mobile interactions

## Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Technologies Used

### Frontend
- React.js 18
- CSS3 (Animations, Grid, Flexbox)
- Intersection Observer API
- Fetch API

### Backend
- Node.js 20
- Express.js 5
- CORS middleware
- Helmet security
- Morgan logging

### Development Tools
- Create React App
- ESLint
- npm scripts

## Future Enhancements
- Database integration (MongoDB/PostgreSQL)
- User authentication
- Analytics tracking
- Content management system
- Progressive Web App features
- Offline functionality

## License
MIT License - Feel free to use and modify as needed.

## Support
For questions or issues, please refer to the API documentation or contact the development team.

