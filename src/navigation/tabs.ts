export type TabKey = 'home' | 'my-infobae' | 'media' | 'chat' | 'menu';

export type Tab = {
  key: TabKey;
  route: string;
  labelKey: string;
};

export const tabs: readonly Tab[] = [
  { key: 'home', route: 'index', labelKey: 'tabs.home' },
  { key: 'my-infobae', route: 'my-infobae', labelKey: 'tabs.myInfobae' },
  { key: 'media', route: 'media', labelKey: 'tabs.media' },
  { key: 'chat', route: 'chat', labelKey: 'tabs.chat' },
  { key: 'menu', route: 'menu', labelKey: 'tabs.menu' },
];
