import { useSongbook } from '@/context/SongbookContext';
import SongList from './SongList';
import SongViewer from './SongViewer';

export default function SongbookView() {
  const { activeSong } = useSongbook();

  if (activeSong) {
    return <SongViewer song={activeSong} />;
  }

  return <SongList />;
}
