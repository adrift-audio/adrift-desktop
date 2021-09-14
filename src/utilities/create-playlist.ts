import { PlaylistEntry, ProcessedFile } from '../@types/models';

/**
 * Create a playlist
 * @param {ProcessedFile[]} list - list of available files
 * @returns {PlaylistEntry[]}
 */
export default function createPlaylist(list: ProcessedFile[]): PlaylistEntry[] {
  return list.map((file: ProcessedFile): PlaylistEntry => ({
    added: file.added,
    duration: file.duration,
    id: file.id,
    name: file.name,
    size: file.size,
    type: file.type,
  }));
}
