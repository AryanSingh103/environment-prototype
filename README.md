# What's Happening Around Me? 🌍

**What's Happening Around Me** is a premium, state-of-the-art web application designed to explain local environmental conditions, simulate future climate impacts, and provide immersive conversational guidance using AI.

Instead of overwhelming users with complex charts or confusing scientific jargon, this app translates real-time environmental metrics into relatable analogies that anyone can understand. With a brand new **Dynamic Glassmorphism** design system, interactive maps, and AI integrations, it is both a research-grade tool and a beautiful consumer application.

---

## 🚀 Key Features

### 1. 🌍 Current Focus (Real-time Explainer)
- **Interactive Mini-Map:** An integrated OpenStreetMap component that allows users to click anywhere on the globe. The app instantly reverse-geocodes the coordinates to fetch localized data.
- **Auto-Geolocation:** A quick "Detect Location" button that automatically finds your geographic coordinates.
- **Relatable Analogies:** The app uses AI to generate conversational summaries. Instead of just "AQI 165", it might say: *"That's like breathing smoke from a campfire all day."*
- **Dynamic Alerts:** Automatically evaluates data against dangerous thresholds (e.g., AQI > 150) and renders pulsing warning banners to alert you of hazardous conditions.

### 2. 🔍 Research & Comparison Tools
- **Location Comparison:** A dedicated side-by-side split screen where users can query two different cities simultaneously to compare their environmental metrics.
- **Historical Trend Chart:** A 7-day look-back line chart (built with Recharts) visualizing **real** recent fluctuations in Temperature, AQI, and Humidity. History is pulled from the free [Open-Meteo](https://open-meteo.com/) archive (weather + air quality), so it works even without any API keys — the chart clearly badges whether it is showing live history or an estimated fallback.
- **Search History & Bookmarks:** Automatically saves the last 20 queries locally. Access them via a slide-out drawer, and "Pin" favorite locations to keep them forever.
- **Data Export Suite:** Download raw environmental data and AI explanations as `CSV` or `JSON`, or generate a beautifully formatted `PDF` report.

### 3. 🤖 Eco-Assistant (AI Chatbot)
- **Real-Time Streaming Chat:** Powered by the Vercel AI SDK, responses stream character-by-character for a fast, engaging experience.
- **Rich Formatting:** The AI supports full Markdown, rendering bold text, lists, and code blocks.
- **Smart Follow-Ups:** Automatically generates three clickable, context-aware suggestion chips after every AI response so you never have to type out long questions.

### 4. 🔮 Future Simulator (Impact Visualization)
- **Time Travel:** Enter your Current Age, future target Age, and City.
- **Trajectory Mapping:** Slide the "World Trajectory Twist" to choose between a Cleaner Future or an extreme +2°C World.
- **Immersive Projections:** Generates numerical metrics and an immersive story of what your physical daily life will feel like in that exact future year.

### 5. ✨ Premium UI / UX
- **Animated Mesh Gradients:** Vibrant, slow-moving CSS orbs make the app feel alive and breathing.
- **True Glassmorphism:** All panels, sidebars, and input cards utilize frosted glass (`backdrop-blur-2xl`).
- **Tactile Micro-Interactions:** Hovering over elements triggers neon glows, drop shadows, and physical lift animations.

---

## 🛠️ Tech Stack
- **Framework:** [Next.js 14+ (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS Modules
- **Language:** TypeScript
- **AI Integration:** [OpenAI API](https://openai.com/) & Vercel AI SDK
- **Data APIs:** OpenWeatherMap, World Air Quality Index (WAQI), Open-Meteo (key-free historical archive)
- **Components:** Pigeon-Maps (Mapping), Recharts (Data Visualization), React-Markdown

---

## 💻 Getting Started

Follow these steps to clone the repository and run the project locally.

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm or yarn
- **API Keys**: You will need an active API key from OpenAI, OpenWeatherMap, and WAQI.

### Installation & Local Development

**1. Clone the repository**
```bash
git clone https://github.com/AryanSingh103/Whats-Happening-Around-Me.git
```

**2. Navigate into the directory**
```bash
cd "Whats-Happening-Around-Me"
```

**3. Install dependencies**
```bash
npm install
```

**4. Set up Environment Variables**
Create a new file named `.env.local` in the root of your project:
```bash
touch .env.local
```
Then, add your API keys inside `.env.local` exactly like this:
```env
OPENAI_API_KEY="your_openai_key"
OPENWEATHERMAP_API_KEY="your_openweather_key"
WAQI_API_KEY="your_waqi_key"
```

**5. Start the Development Server**
```bash
npm run dev
```

**6. View the App**
Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## 📜 License
This project is for educational and prototyping purposes. Feel free to clone, edit, and experiment!
