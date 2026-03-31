import { useState } from 'react';
import { ChordProvider } from '@/context/ChordContext';
import { SongbookProvider } from '@/context/SongbookContext';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import KeySelector from '@/components/KeySelector';
import KeyChordTable from '@/components/KeyChordTable';
import ChordAnalyzer from '@/components/ChordAnalyzer';
import ScalesTab from '@/components/ScalesTab';
import SongbookView from '@/components/songbook/SongbookView';
import Footer from '@/components/Footer';
import type { TabView } from '@/types';

export default function App() {
  // Auto-switch to songbook tab if URL has shared songbook data
  const [activeTab, setActiveTab] = useState<TabView>(
    () => window.location.hash.startsWith('#songbook=') ? 'songbook' : 'explorer'
  );

  return (
    <ChordProvider>
      <SongbookProvider>
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
            {activeTab === 'analyzer' && <ChordAnalyzer />}
            {activeTab === 'scales' && <ScalesTab />}
            {activeTab === 'songbook' && <SongbookView />}
            <Footer />
          </div>
        </div>
      </SongbookProvider>
    </ChordProvider>
  );
}
