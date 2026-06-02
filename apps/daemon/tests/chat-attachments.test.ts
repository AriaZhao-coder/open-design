import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatProjectAttachmentHint, resolveSafeProjectAttachments } from '../src/server.js';

describe('resolveSafeProjectAttachments', () => {
  it('keeps Windows attachments when root and attachment path use different separators and drive casing', () => {
    const existing = new Set([
      'C:\\Users\\Designer\\Open Design\\m5-logo.png',
      'c:\\users\\designer\\open design\\assets\\mark.png',
    ]);

    const safe = resolveSafeProjectAttachments(
      'C:/Users/Designer/Open Design/',
      [
        'm5-logo.png',
        'c:/users/designer/open design/assets/mark.png',
        'C:/Users/Designer/Open Design Adjacent/secret.png',
        '..\\secret.png',
      ],
      {
        existsSync: (target: string) => existing.has(target),
        pathImpl: path.win32,
      },
    );

    expect(safe).toEqual([
      'm5-logo.png',
      'c:/users/designer/open design/assets/mark.png',
    ]);
  });

  it('renders project attachments in explicit user-visible order', () => {
    expect(formatProjectAttachmentHint(['first.png', 'second.png'])).toContain(
      [
        'Attached project files in user-visible order:',
        '1. `first.png`',
        '2. `second.png`',
        '',
        'When the user says "first attachment", "second file", or similar, map those references to the numbered list above.',
      ].join('\n'),
    );
  });
});
