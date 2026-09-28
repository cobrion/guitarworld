import { useState } from 'react';
import { ChordProvider } from '@/context/ChordContext';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import KeySelector from '@/components/KeySelector';
import KeyChordTable from '@/components/KeyChordTable';
import ScalesTab from '@/components/ScalesTab';
import FretboardTab from '@/components/FretboardTab';
import Footer from '@/components/Footer';
import type { TabView } from '@/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>('explorer');

  return (
    <ChordProvider>
      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div className="mx-auto max-w-[1200px]">
          <Header />
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'explorer' && (
            <>
              <KeySelector />
              <KeyChordTable />
            </>
          )}
          {activeTab === 'scales' && <ScalesTab />}
          {activeTab === 'fretboard' && <FretboardTab />}
          <Footer />
        </div>
      </div>
    </ChordProvider>
  );
}
