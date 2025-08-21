import React, { useEffect, ReactNode } from "react";
import { startEventBatcher, stopEventBatcher } from "./eventBatcher";

type Props = {
  children: ReactNode;
};

const EventBatcherWrapper: React.FC<Props> = ({ children }) => {
  useEffect(() => {
    startEventBatcher(5000);
    return () => {
      stopEventBatcher();
    };
  }, []);

  return <>{children}</>;
};

export default EventBatcherWrapper;
