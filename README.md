# Zara Chat - Multi-Provider AI Chatbot

A modern, full-stack AI chatbot application built with React, TypeScript, and FastAPI. Zara Chat supports multiple AI providers and features a beautiful, responsive interface.

![Zara Chat Preview](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Zara+Chat+Preview)

## ✨ Features

- 🤖 **Multi-Provider AI Support** - Gemini, DeepSeek, and Groq
- 💬 **Real-time Chat Interface** - Streaming responses with loading states
- 🎨 **Modern UI/UX** - Built with shadcn/ui and Tailwind CSS
- 🌙 **Dark/Light Theme** - System preference detection
- 📱 **Responsive Design** - Mobile-first approach
- 🔄 **Conversation Management** - Create, switch, and delete conversations
- 📝 **Code Highlighting** - Syntax highlighting for code blocks
- ♿ **Accessibility** - ARIA labels and keyboard navigation

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **shadcn/ui** + Radix UI components
- **Tailwind CSS** for styling
- **TanStack Query** for state management
- **React Router** for navigation

### Backend
- **FastAPI** with Python
- **Pydantic** for data validation
- **Uvicorn** ASGI server
- **Multiple AI Provider APIs**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- API keys for AI providers (see Environment Variables)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zara-chat.git
   cd zara-chat
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up Python environment**
   ```bash
   cd server
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start:
- Frontend on http://localhost:8080
- Backend on http://localhost:8787

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# AI Provider API Keys
GEMINI_API_KEY=your_gemini_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Default Provider (optional)
MODEL_PROVIDER=gemini

# CORS Origins (optional)
CORS_ORIGINS=http://localhost:8080,http://localhost:3000
```

## 📁 Project Structure

```
zara-chat/
├── src/                          # Frontend React app
│   ├── components/
│   │   ├── chat/                 # Chat-specific components
│   │   ├── theme/                # Theme provider
│   │   └── ui/                   # Reusable UI components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities and API client
│   └── pages/                    # Route components
├── server/                       # Backend FastAPI app
│   ├── app/
│   │   ├── providers/            # AI provider implementations
│   │   ├── memory/               # Conversation storage
│   │   └── main.py              # Main API server
├── .env.example                  # Environment variables template
└── README.md
```

## 🎯 Available Scripts

### Frontend
- `npm run dev:frontend` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript checks

### Backend
- `npm run dev:backend` - Start FastAPI server
- `cd server && python -m uvicorn app.main:app --reload` - Direct backend start

### Full Stack
- `npm run dev` - Start both frontend and backend

## 🤖 Supported AI Providers

| Provider | Models | Description |
|----------|--------|-------------|
| **Gemini** | 1.5 Flash, 2.0 Flash, 1.5 Pro | Google's advanced AI models |
| **DeepSeek** | Chat, Coder | Specialized for coding and general chat |
| **Groq** | Llama 3.1 8B, 3.3 70B | Fast inference with Llama models |

## 🔌 API Endpoints

- `GET /health` - Health check
- `GET /models` - Available AI models by provider
- `POST /api/chat` - Main chat endpoint

## 🎨 UI Components

Built with shadcn/ui and includes:
- Responsive sidebar navigation
- Message bubbles with syntax highlighting
- Loading states and animations
- Theme toggle
- Toast notifications
- Modal dialogs and forms

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Heroku/DigitalOcean)
```bash
cd server
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [FastAPI](https://fastapi.tiangolo.com/) for the Python web framework

## 📞 Contact

Your Name - [@yourusername](https://github.com/yourusername) - your.email@example.com

Project Link: [https://github.com/yourusername/zara-chat](https://github.com/yourusername/zara-chat)

---

⭐ Star this repo if you found it helpful!