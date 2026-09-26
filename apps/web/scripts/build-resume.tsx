/**
 * Renders public/Manoj-C-Resume.pdf from packages/content/resume.ts.
 *
 * Runs during `next build`, before the site is compiled, so the download link
 * always points at a PDF generated from the same facts as the page. No
 * headless browser is involved, which keeps a Vercel Hobby build fast.
 *
 * ATS rules (PRD §10): a single column, standard headings, real selectable
 * text, no tables used for layout, links written out in full, 10.5pt body,
 * 14mm margins. The visual style echoes the site — serif name, one pigment
 * rule — without anything that would confuse a parser.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer';

import {
  resumeFooter,
  resumeHeader,
  resumeSections,
  resumeSkills,
  resumeSummary,
} from '../../../packages/content/resume';

// Run from apps/web, which is where the npm script puts us.
const ROOT = process.cwd();
const FONTS = path.join(ROOT, 'assets', 'fonts');
const OUT = path.join(ROOT, 'public', 'Manoj-C-Resume.pdf');

Font.register({
  family: 'Newsreader',
  src: path.join(FONTS, 'Newsreader-Static.ttf'),
});
Font.register({
  family: 'Switzer',
  src: path.join(FONTS, 'Switzer-Regular.ttf'),
});
Font.register({
  family: 'Switzer-Medium',
  src: path.join(FONTS, 'Switzer-Medium.ttf'),
});
Font.register({
  family: 'JBMono',
  src: path.join(FONTS, 'JetBrainsMono-Regular.ttf'),
});

// Let long URLs and hyphenated terms break naturally instead of overflowing.
Font.registerHyphenationCallback((word) => [word]);

const INK = '#1A1917';
const GRAPHITE = '#403E39';
const PIGMENT = '#002FA7';
const RULE = '#D6D3C8';

const s = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 40, // ~14mm
    fontFamily: 'Switzer',
    fontSize: 9.2,
    color: INK,
    lineHeight: 1.42,
  },
  name: { fontFamily: 'Newsreader', fontSize: 25, color: INK, letterSpacing: -0.4 },
  role: { fontFamily: 'Switzer', fontSize: 9.6, color: GRAPHITE, marginTop: 3 },
  pigmentRule: { height: 1.2, backgroundColor: PIGMENT, marginTop: 7, marginBottom: 6 },
  hairline: { height: 0.6, backgroundColor: RULE, marginTop: 5, marginBottom: 7 },
  contact: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  contactItem: { fontFamily: 'JBMono', fontSize: 7.6, color: GRAPHITE },

  h2: {
    fontFamily: 'Switzer',
    fontSize: 7.8,
    letterSpacing: 1.2,
    color: GRAPHITE,
    textTransform: 'uppercase',
    marginTop: 8.5,
    marginBottom: 3.5,
  },
  h2Rule: { height: 0.8, backgroundColor: INK, marginBottom: 5.5 },

  entryHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  entryTitle: { fontFamily: 'Newsreader', fontSize: 11, color: INK },
  entryMeta: { fontFamily: 'Switzer', fontSize: 7.6, color: GRAPHITE },
  entryDetail: { fontSize: 8.8, color: GRAPHITE, marginTop: 1.5 },

  bulletRow: { flexDirection: 'row', marginTop: 2.8 },
  bulletMark: {
    width: 7,
    marginTop: 4.6,
    height: 0.8,
    backgroundColor: PIGMENT,
    marginRight: 6,
  },
  bulletText: { flex: 1, fontSize: 8.7, lineHeight: 1.4 },

  skillRow: { flexDirection: 'row', marginTop: 2.2 },
  skillGroup: {
    width: 78,
    fontFamily: 'Switzer',
    fontSize: 7.6,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: GRAPHITE,
    marginTop: 0.6,
  },
  skillList: { flex: 1, fontSize: 8.7 },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontFamily: 'JBMono', fontSize: 7, color: GRAPHITE },
});

function Resume() {
  return (
    <Document
      title="Manoj C — Résumé"
      author="Manoj C"
      subject="Full-stack engineer and ML systems — résumé"
      keywords="Full-stack, ML, Machine Learning, PyTorch, React, Next.js, FastAPI, Python, TypeScript, Bengaluru"
      creator="manojc.vercel.app"
      producer="manojc.vercel.app"
      language="en-IN"
    >
      <Page size="A4" style={s.page}>
        <View>
          <Text style={s.name}>{resumeHeader.name}</Text>
          <Text style={s.role}>{resumeHeader.title}</Text>
          <View style={s.pigmentRule} />
          <View style={s.contact}>
            {resumeHeader.contact.map((c) => (
              <Text key={c} style={s.contactItem}>
                {c}
              </Text>
            ))}
          </View>
        </View>

        <Text style={s.h2}>Summary</Text>
        <View style={s.h2Rule} />
        <Text style={{ fontSize: 8.7, lineHeight: 1.42 }}>{resumeSummary}</Text>

        {resumeSections.map((section) => (
          <View key={section.heading}>
            <Text style={s.h2}>{section.heading}</Text>
            <View style={s.h2Rule} />
            {section.entries.map((entry, i) => (
              <View
                key={entry.title}
                wrap={false}
                style={{ marginBottom: i === section.entries.length - 1 ? 0 : 5 }}
              >
                <View style={s.entryHead}>
                  <Text style={s.entryTitle}>{entry.title}</Text>
                  {entry.meta ? <Text style={s.entryMeta}>{entry.meta}</Text> : null}
                </View>
                {entry.detail ? <Text style={s.entryDetail}>{entry.detail}</Text> : null}
                {entry.bullets?.map((b) => (
                  <View key={b} style={s.bulletRow}>
                    <View style={s.bulletMark} />
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}

        <Text style={s.h2}>Skills</Text>
        <View style={s.h2Rule} />
        {resumeSkills.map(([group, list]) => (
          <View key={group} style={s.skillRow}>
            <Text style={s.skillGroup}>{group}</Text>
            <Text style={s.skillList}>{list}</Text>
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>{resumeFooter}</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

async function main() {
  const buffer = await renderToBuffer(<Resume />);
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, buffer);

  /* The PRD's own acceptance criterion: exactly one page. A résumé that spills
     onto a second page has failed, so the build says so and stops rather than
     shipping it and hoping nobody scrolls. */
  const pages = buffer.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length ?? 0;
  const kb = (buffer.length / 1024).toFixed(0);
  console.log(
    `  résumé → public/Manoj-C-Resume.pdf  ${kb} KB, ${pages} page${pages === 1 ? '' : 's'}`,
  );

  if (pages !== 1) {
    console.error(
      `\n  The résumé is ${pages} pages. It must be exactly one.\n` +
        `  Trim a bullet in packages/content/resume.ts and run again.\n`,
    );
    process.exit(1);
  }
}

void main();
