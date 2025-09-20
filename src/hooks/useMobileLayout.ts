import { useState, useEffect } from "react";
import { BoardWithTasks } from "@/lib/types";

export function useMobileLayout(boards: BoardWithTasks[]) {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedBoard, setExpandedBoard] = useState<string | null>(null);

  // Mobile detection and setup
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Set first board (backlog) as expanded by default on mobile
  useEffect(() => {
    if (isMobile && boards.length > 0 && !expandedBoard) {
      const backlogBoard = boards.find((board) => board.slug === "backlog");
      if (backlogBoard) {
        setExpandedBoard(backlogBoard.id);
      }
    }
  }, [isMobile, boards, expandedBoard]);

  const handleToggleBoard = (boardId: string) => {
    setExpandedBoard(expandedBoard === boardId ? null : boardId);
  };

  const isBoardExpanded = (boardId: string) => {
    return !isMobile || expandedBoard === boardId;
  };

  return {
    isMobile,
    expandedBoard,
    handleToggleBoard,
    isBoardExpanded,
  };
}
