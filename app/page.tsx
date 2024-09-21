import InteractiveDisplay from './components/InteractiveDisplay';
import config from './config.json';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <InteractiveDisplay initialTheme={config.currentTheme} />
    </main>
  );
}