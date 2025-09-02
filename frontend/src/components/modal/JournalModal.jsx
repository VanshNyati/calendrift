import { useEffect, useMemo, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { useJournalStore } from "../../state/journalStore";

export default function JournalModal() {
  const isModalOpen = useJournalStore((s) => s.isModalOpen);
  const currentIndex = useJournalStore((s) => s.activeIndex);
  const sortedEntries = useJournalStore((s) => s.sorted);

  const closeModal = useJournalStore((s) => s.closeModal);
  const goToPrevious = useJournalStore((s) => s.goPrev);
  const goToNext = useJournalStore((s) => s.goNext);

  // Using refs to avoid stale closures in event listeners
  const closeModalRef = useRef(closeModal);
  const goPrevRef = useRef(goToPrevious);
  const goNextRef = useRef(goToNext);

  // Keep refs up to date
  useEffect(() => {
    closeModalRef.current = closeModal;
  }, [closeModal]);

  useEffect(() => {
    goPrevRef.current = goToPrevious;
  }, [goToPrevious]);

  useEffect(() => {
    goNextRef.current = goToNext;
  }, [goToNext]);

  // Get the current entry based on active index
  const currentEntry = useMemo(() => {
    if (!sortedEntries || sortedEntries.length === 0) {
      return null;
    }

    const safeIndex = Math.max(
      0,
      Math.min(sortedEntries.length - 1, currentIndex || 0)
    );
    return sortedEntries[safeIndex];
  }, [sortedEntries, currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyPress = (event) => {
      switch (event.key) {
        case "Escape":
          closeModalRef.current?.();
          break;
        case "ArrowLeft":
          goPrevRef.current?.();
          break;
        case "ArrowRight":
          goNextRef.current?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isModalOpen]);

  // Set up swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goNextRef.current?.(),
    onSwipedRight: () => goPrevRef.current?.(),
    trackMouse: true,
  });

  // Don't render if modal is closed or no entry
  if (!isModalOpen || !currentEntry) {
    return null;
  }

  const handleBackdropClick = () => {
    closeModalRef.current?.();
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handlePrevClick = () => {
    goPrevRef.current?.();
  };

  const handleNextClick = () => {
    goNextRef.current?.();
  };

  const handleCloseClick = () => {
    closeModalRef.current?.();
  };

  return (
    <div
      className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 p-3 sm:items-center"
      onClick={handleBackdropClick}
    >
      <div
        {...swipeHandlers}
        onClick={handleContentClick}
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-lg"
      >
        <div className="relative">
          <img
            src={currentEntry.imgUrl}
            alt=""
            loading="lazy"
            className="h-56 w-full object-cover"
          />
          <button
            onClick={handleCloseClick}
            className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm shadow"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-semibold">{currentEntry.rating}★</span>
            {currentEntry.categories?.slice(0, 3).map((category) => (
              <span
                key={category}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-xs"
              >
                {category}
              </span>
            ))}
          </div>
          <p className="mt-2 text-gray-900">{currentEntry.description}</p>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={handlePrevClick}
              className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
            >
              ← Prev
            </button>
            <div className="text-xs text-gray-500">
              {Math.min((currentIndex || 0) + 1, sortedEntries.length)} /{" "}
              {sortedEntries.length}
            </div>
            <button
              onClick={handleNextClick}
              className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
