# Movemates

Movemates is an AI-powered physiotherapy and movement screening tool. It uses a standard webcam and real-time computer vision to track skeletal landmarks, assess movement quality, and provide live, actionable feedback.

*Note: Movemates is an AI screening tool, not a substitute for professional medical advice. Always consult your physiotherapist for diagnoses.*

## Features

- **Real-Time AR Tracking**: Leverages Google's MediaPipe Tasks Vision API to map 33 3D skeletal landmarks dynamically in the browser at 30+ FPS.
- **Advanced Mathematical Smoothing**: Built-in adaptive 1€ (OneEuro) filters smooth out coordinate jitter, ensuring highly accurate biometric readings. Includes a "Local Filter Targeting" system to selectively bypass filters on a per-axis, per-landmark basis.
- **Movement Analytics Engine**: Custom movement analysers (e.g., *One-Legged Stand*, *Underarm Throw*) interpret the raw skeleton data into human-readable metrics like Swing Angle, Posture State, and Lifted Leg height.
- **Local-First Database**: Uses a fully offline, local IndexedDB layer (`DatabaseEngine`) to store high-fidelity session telemetry, settings, and user progress entirely on-device for maximum privacy and zero latency.
- **Comprehensive Reports**: Automatically generates rich, responsive post-session reports, featuring `Recharts` data visualization and detailed biomechanical breakdowns. 
- **Premium Custom Design System**: Built completely from scratch using vanilla CSS variables, featuring a high-end, dynamic UI without heavy styling frameworks like Tailwind.

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Machine Learning**: [MediaPipe Pose Landmarker](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Styling**: Vanilla CSS (CSS Variables + Component Scoping)

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate into the project directory.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

To spin up the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to the local host address provided in your terminal (typically `http://localhost:5173`).

## Project Structure Overview

- `src/components/`: Reusable, modular UI elements (Buttons, StatCards, ToggleTabs) and specialized components like `VideoPlayer` and `LiveMetrics`.
- `src/engine/`: The core brains of Movemates. 
  - `/db`: Offline IndexedDB management (`DatabaseEngine.ts`).
  - `/factories`: Movement analyser registry to map movements to their specific algorithmic tracking classes.
  - `/math`: Signal processing logic, including the `OneEuroFilter` and `PoseFilter`.
  - `/mediapipe`: Wrapper classes that interface directly with the MediaPipe WASM bundle.
  - `/movements`: The logic that calculates specific biometric metrics from skeletal coordinates (e.g., `OneLeggedStandAnalyser.ts`).
- `src/pages/`: Main application routes (e.g., `movements`, `record`, `report`, `settings`, `progress`).
- `src/types/`: TypeScript definitions ensuring strong typing across the app.

## Building for Production

To create a minified, production-ready bundle:
```bash
npm run build
```
You can then preview the build locally using:
```bash
npm run preview
```
