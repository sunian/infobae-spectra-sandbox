import fs from 'fs';
import path from 'path';

import { t } from '@/localization';

import { tabs } from './tabs';

const tabsDir = path.join(__dirname, '..', '..', 'app', '(tabs)');

describe('tabs', () => {
  it('has exactly 5 tabs', () => {
    expect(tabs).toHaveLength(5);
  });

  it('lists the tabs in the required order', () => {
    expect(tabs.map((tab) => tab.key)).toEqual(['home', 'my-infobae', 'media', 'chat', 'menu']);
  });

  it('has unique keys', () => {
    expect(new Set(tabs.map((tab) => tab.key)).size).toBe(tabs.length);
  });

  it('has a label key that resolves to a string', () => {
    for (const tab of tabs) {
      expect(t(tab.labelKey)).not.toBe(tab.labelKey);
    }
  });

  it('has a route file for every tab', () => {
    for (const tab of tabs) {
      expect(fs.existsSync(path.join(tabsDir, `${tab.route}.tsx`))).toBe(true);
    }
  });
});
