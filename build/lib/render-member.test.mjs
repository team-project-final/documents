// build/lib/render-member.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMemberHubs } from './render-member.mjs';
import { ROLE_MAP } from './parse-metadata.mjs';

function g(week, step, role) {
  return {
    week, step, role, roleLabel: ROLE_MAP[role].label,
    authorHandle: ROLE_MAP[role].handle, authorName: 'a', topicSlug: 't',
    title: 't', sourcePath: 'x',
    outputPath: `w${week}/step${step}/${role}__t-workflow-guide.html`,
    url: `/w${week}/step${step}/${role}__t-workflow-guide.html`,
  };
}

test('renderMemberHubs returns one entry per role present in guides', () => {
  const out = renderMemberHubs([g(1, 1, 'team-lead'), g(1, 2, 'frontend-owner')]);
  const paths = out.map(o => o.outputPath).sort();
  assert.deepEqual(paths, ['members/frontend-owner.html', 'members/team-lead.html']);
});

test('member hub groups by week with anchor ids', () => {
  const out = renderMemberHubs([g(1, 1, 'team-lead'), g(2, 4, 'team-lead')]);
  const tl = out.find(o => o.outputPath === 'members/team-lead.html');
  assert.match(tl.html, /id="w1"/);
  assert.match(tl.html, /id="w2"/);
});
