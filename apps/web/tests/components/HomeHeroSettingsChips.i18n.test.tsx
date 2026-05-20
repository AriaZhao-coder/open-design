// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HomeHeroSettingsChips } from '../../src/components/HomeHeroSettingsChips';
import { I18nProvider } from '../../src/i18n';
import type { DesignSystemSummary } from '../../src/types';

vi.mock('../../src/providers/registry', () => ({
  fetchDesignSystemPreview: vi.fn().mockResolvedValue('<html><body>Preview</body></html>'),
  openFolderDialog: vi.fn().mockResolvedValue(null),
}));

const designSystems: DesignSystemSummary[] = [
  {
    id: 'clay',
    title: 'Clay',
    summary: 'Friendly tactile product UI.',
    category: 'Product',
    swatches: ['#f4efe7', '#25211d'],
  },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('HomeHeroSettingsChips i18n', () => {
  it('localizes the home working-dir and design-system selectors', () => {
    render(
      <I18nProvider initial="zh-CN">
        <HomeHeroSettingsChips
          workingDir={null}
          onChangeWorkingDir={() => undefined}
          designSystems={designSystems}
          designSystemsLoading={false}
          selectedDesignSystemId={null}
          onChangeDesignSystemId={() => undefined}
          variant="inline"
        />
      </I18nProvider>,
    );

    expect(screen.getByText('选择工作目录')).toBeTruthy();
    expect(screen.getByText('选择设计系统')).toBeTruthy();

    fireEvent.click(screen.getByTestId('home-hero-design-system-chip'));

    expect(screen.getByPlaceholderText('搜索设计系统（标题 / 分类 / 摘要）')).toBeTruthy();
    expect(screen.getByText('不指定设计系统')).toBeTruthy();
  });

  it('uses localized design-system category labels while searching', () => {
    render(
      <I18nProvider initial="fr">
        <HomeHeroSettingsChips
          workingDir={null}
          onChangeWorkingDir={() => undefined}
          designSystems={designSystems}
          designSystemsLoading={false}
          selectedDesignSystemId={null}
          onChangeDesignSystemId={() => undefined}
          variant="inline"
        />
      </I18nProvider>,
    );

    fireEvent.click(screen.getByTestId('home-hero-design-system-chip'));

    expect(screen.getByText('Produit')).toBeTruthy();
    expect(screen.getByPlaceholderText('Rechercher des design systems (titre / catégorie / résumé)')).toBeTruthy();
  });
});
