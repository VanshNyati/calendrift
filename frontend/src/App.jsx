import { useEffect } from "react";
import Viewport from "./components/calendar/Viewport";
import Header from "./components/Header";
import JournalModal from "./components/modal/JournalModal";
import JournalForm from "./components/journal/JournalForm";
import { useJournalStore } from "./state/journalStore";

export default function App() {
  const entries = useJournalStore((s) => s.entries);
  const loadInitial = useJournalStore((s) => s.loadInitial);

  useEffect(() => {
    // only load sample if we have nothing persisted yet
    if (entries && entries.length) return;
    fetch("/sample.json")
      .then((r) => r.json())
      .then((data) => loadInitial(data))
      .catch(() => {}); // ignore if missing
  }, [entries, loadInitial]);

  return (
    <div className="h-screen">
      <Header />
      <Viewport />
      <JournalModal />
      <JournalForm />
    </div>
  );
}
