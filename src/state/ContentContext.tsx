import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import { contentSource, type ContentSource } from '@/domain/content';

const ContentContext = createContext<ContentSource>(contentSource);

type ContentProviderProps = {
  children: ReactNode;
  /** Defaults to the source the build chose (live APIs, or fixtures for screenshot tests). */
  source?: ContentSource;
};

export function ContentProvider({ children, source = contentSource }: ContentProviderProps) {
  return <ContentContext.Provider value={source}>{children}</ContentContext.Provider>;
}

export function useContentSource(): ContentSource {
  return useContext(ContentContext);
}
