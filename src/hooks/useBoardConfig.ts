import { BoardWithTasks } from "@/lib/types";

export function useBoardConfig() {
  const getBoardConfig = (slug: BoardWithTasks["slug"]) => {
    const configs = {
      backlog: {
        title: "Backlog",
        color: "bg-purple-50 border-purple-200",
        headerColor: "bg-purple-100",
        textColor: "text-purple-800",
      },
      todo: {
        title: "To Do",
        color: "bg-gray-50 border-gray-200",
        headerColor: "bg-gray-100",
        textColor: "text-gray-800",
      },
      in_progress: {
        title: "In Progress",
        color: "bg-blue-50 border-blue-200",
        headerColor: "bg-blue-100",
        textColor: "text-blue-800",
      },
      done: {
        title: "Done",
        color: "bg-green-50 border-green-200",
        headerColor: "bg-green-100",
        textColor: "text-green-800",
      },
    };
    return configs[slug];
  };

  const getWipStatus = (board: BoardWithTasks) => {
    const isWipLimitReached = Boolean(
      board.wip_limit && board.tasks.length >= board.wip_limit
    );
    const isOverWipLimit = Boolean(
      board.wip_limit && board.tasks.length > board.wip_limit
    );

    return {
      isWipLimitReached,
      isOverWipLimit,
    };
  };

  return {
    getBoardConfig,
    getWipStatus,
  };
}
