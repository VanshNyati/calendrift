import { useJournalStore } from "../../state/journalStore";

export default function JournalChip({ entry }) {
  const openModal = useJournalStore((state) => state.openModalById);
  const handleClick = () => {
    openModal(entry.id);
  };
  const categoryText = entry.categories && entry.categories.length > 0 
    ? entry.categories[0] 
    : "Journal";
  return (
    <button 
      onClick={handleClick} 
      className="w-full text-left truncate rounded-md border border-gray-200 px-2 py-1 text-[11px] hover:bg-gray-50" 
      title={entry.description}
    >
      <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-1"></span>
      <span className="font-medium">{entry.rating}</span>
      <span className="text-gray-400 mx-1">•</span>
      <span className="opacity-80">{categoryText}</span>
    </button>
  );
}
