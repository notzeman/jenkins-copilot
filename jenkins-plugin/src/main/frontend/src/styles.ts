/*
 * Jenkins Copilot's visual language: cool neutrals around Jenkins' #0e1016, Jenkins' own symbols,
 * a serif voice borrowed from the Jenkins wordmark, and work recorded on a rail like entries in a
 * ledger. Few boxes, no pill badges.
 */
export const css = `
.cp-reset { all: initial; }
.cp-shell {
  --cp-bg: #f5f6f8;
  --cp-panel: #ffffff;
  --cp-panel-2: #f5f6f8;
  --cp-text: #14161b;
  --cp-muted: #5c6370;
  --cp-faint: #858b97;
  --cp-border: #e4e6eb;
  --cp-border-strong: #cdd1d9;
  --cp-success: #1f8a4c;
  --cp-warning: #a8620a;
  --cp-danger: #c0342c;
  --cp-danger-soft: color-mix(in srgb, var(--cp-danger) 8%, transparent);
  --cp-warning-soft: color-mix(in srgb, var(--cp-warning) 9%, transparent);
  --cp-accent-soft: color-mix(in srgb, var(--cp-accent) 9%, transparent);
  --cp-code: #14161b;
  --cp-code-text: #e7e9ee;
  --cp-code-muted: #9ba1ad;
  --cp-tip-bg: #14161b;
  --cp-tip-text: #ffffff;
  --cp-shadow: -18px 0 50px rgba(15, 18, 28, .14);
  --cp-pop: 0 10px 30px rgba(15, 18, 28, .18);
  --cp-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  --cp-sans: var(--font-family-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif);
  --cp-serif: Georgia, "Times New Roman", "Noto Serif", serif;
  --cp-ease: cubic-bezier(.22, .8, .24, 1);

  /* Variables read by Jenkins' own status symbols. */
  --card-background: var(--cp-panel);
  --accent-color: var(--cp-accent);
  --success-color: var(--cp-success);
  --error-color: var(--cp-danger);
  --warning-color: var(--cp-warning);
  --skipped-color: var(--cp-faint);
  --status-background-opacity: .12;
  --status-border-opacity: .3;
  --standard-transition: none;

  position: fixed;
  inset: 0;
  z-index: 2147483000;
  pointer-events: none;
  font-family: var(--cp-sans);
  color: var(--cp-text);
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
.cp-shell[data-theme="dark"] {
  --cp-bg: #0e1016;
  --cp-panel: #0e1016;
  --cp-panel-2: #161922;
  --cp-text: #e7e9ee;
  --cp-muted: #a0a6b3;
  --cp-faint: #7a8190;
  --cp-border: #232733;
  --cp-border-strong: #343a48;
  --cp-success: #6fc48d;
  --cp-warning: #e2a64b;
  --cp-danger: #f0837a;
  --cp-code: #090b10;
  --cp-tip-bg: #e7e9ee;
  --cp-tip-text: #0e1016;
  --cp-shadow: -18px 0 60px rgba(0, 0, 0, .5);
  --cp-pop: 0 12px 34px rgba(0, 0, 0, .5);
}
.cp-shell * { box-sizing: border-box; }
.cp-shell svg { display: block; }
.cp-shell button { font-family: var(--cp-sans); }
.cp-shell :focus-visible { outline: 2px solid var(--cp-accent-ink); outline-offset: 1px; }
.cp-sr {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; border: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}
.cp-grow { flex: 1; }

/* Copilot mark: ring and stage turn as one, so the mark keeps its shape */
.cp-mark { width: 18px; height: 18px; flex: 0 0 auto; overflow: visible; }
.cp-mark-ring, .cp-mark-stage { transform-box: view-box; transform-origin: 124px 128px; }
.cp-mark-busy { color: var(--cp-accent-ink); }
.cp-mark-busy .cp-mark-ring { animation: cp-mark-turn 1.7s cubic-bezier(.62, .04, .3, 1) infinite; }
.cp-mark-busy .cp-mark-stage { animation: cp-mark-turn 1.7s cubic-bezier(.62, .04, .3, 1) infinite, cp-mark-hold 1.7s ease-in-out infinite; }
.cp-mark-still { color: var(--cp-faint); }
@keyframes cp-mark-turn { to { transform: rotate(360deg); } }
@keyframes cp-mark-hold {
  0%, 100% { opacity: 1; }
  50% { opacity: .45; }
}

/* Shimmering text, for anything in progress */
.cp-shimmer {
  color: var(--cp-muted);
  background: linear-gradient(100deg, var(--cp-muted) 35%, var(--cp-accent-ink) 50%, var(--cp-muted) 65%);
  background-size: 260% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: cp-shimmer 2.2s linear infinite, cp-fade .3s ease-out;
}
@keyframes cp-shimmer {
  from { background-position: 130% 0; }
  to { background-position: -130% 0; }
}
@keyframes cp-fade { from { opacity: 0; } }
@keyframes cp-rise { from { opacity: 0; transform: translateY(5px); } }
@keyframes cp-pop-in { from { opacity: 0; transform: translateY(3px) scale(.985); } }

/* Height animation that works for content of any size */
.cp-fold {
  display: grid; grid-template-rows: 0fr; min-width: 0;
  transition: grid-template-rows .24s var(--cp-ease);
}
.cp-fold-open { grid-template-rows: 1fr; }
.cp-fold-inner {
  min-height: 0; min-width: 0; overflow: hidden; visibility: hidden;
  transition: visibility 0s linear .24s, opacity .2s ease; opacity: 0;
}
.cp-fold-open > .cp-fold-inner { visibility: visible; opacity: 1; transition-delay: 0s; }

/* Tooltip */
.cp-tip {
  position: fixed; z-index: 2147483004; pointer-events: none; max-width: 280px;
  padding: 4px 8px; border-radius: 5px; background: var(--cp-tip-bg); color: var(--cp-tip-text);
  font-family: var(--cp-sans); font-size: 11.5px; line-height: 1.4; overflow-wrap: anywhere;
}
.cp-tip-show { animation: cp-tip-in .12s ease-out; }
@keyframes cp-tip-in { from { opacity: 0; transform: translateY(2px); } }
.cp-tip-below.cp-tip-show { animation-name: cp-tip-in-below; }
@keyframes cp-tip-in-below { from { opacity: 0; transform: translateY(-2px); } }

/* Status icons */
.cp-statusicon { display: inline-flex; width: 16px; height: 16px; flex: 0 0 auto; border-radius: 50%; cursor: default; }
.cp-statusicon svg { width: 100%; height: 100%; }
.cp-statusicon .app-status-icon-running { transform-box: fill-box; transform-origin: center; animation: cp-status-run 1.2s ease-in-out infinite; }
@keyframes cp-status-run {
  0%, 100% { transform: scale(.7); opacity: .55; }
  50% { transform: scale(2.1); opacity: 1; }
}

/* Floating button */
.cp-fab {
  pointer-events: auto; position: fixed; right: 22px; bottom: 22px;
  width: 46px; height: 46px; border-radius: 50%; border: 0;
  background: var(--cp-accent); color: var(--cp-on-accent);
  display: grid; place-items: center; cursor: pointer;
  box-shadow: 0 6px 18px rgba(15, 18, 28, .3);
  transition: transform .2s var(--cp-ease), box-shadow .2s ease;
  animation: cp-pop-in .25s var(--cp-ease);
}
.cp-fab:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(15, 18, 28, .36); }
.cp-fab .cp-mark { width: 24px; height: 24px; }
.cp-fab:hover .cp-mark-ring, .cp-fab:hover .cp-mark-stage { animation: cp-mark-turn .7s cubic-bezier(.62, .04, .3, 1); }
.cp-fab-alert { background: var(--cp-danger); color: #fff; }
.cp-shell[data-theme="dark"] .cp-fab-alert { background: #b3322c; }
.cp-fab-alert::after {
  content: ''; position: absolute; inset: 0; border-radius: 50%;
  border: 2px solid #d9443d; animation: cp-fab-ring 2s var(--cp-ease) infinite;
}
@keyframes cp-fab-ring {
  from { transform: scale(1); opacity: .8; }
  to { transform: scale(1.65); opacity: 0; }
}

/* Drawer */
.cp-drawer {
  pointer-events: auto; position: fixed; top: 0; right: 0; bottom: 0;
  width: 440px; max-width: 100vw; background: var(--cp-panel);
  border-left: 1px solid var(--cp-border); box-shadow: var(--cp-shadow);
  display: flex; flex-direction: column; transform: translateX(100%); visibility: hidden;
  transition: transform .28s var(--cp-ease), visibility 0s linear .28s;
}
.cp-drawer.cp-open { transform: translateX(0); visibility: visible; transition-delay: 0s; }
.cp-resize { position: absolute; left: -3px; top: 0; bottom: 0; width: 6px; cursor: col-resize; z-index: 2; transition: background .15s ease; }
.cp-resize:hover { background: color-mix(in srgb, var(--cp-accent) 40%, transparent); }

/* Header */
.cp-head { padding: 10px 12px 9px 8px; border-bottom: 1px solid var(--cp-border); display: flex; flex-direction: column; gap: 5px; }
.cp-head-row { display: flex; align-items: center; gap: 1px; }
.cp-logo { color: var(--cp-accent-ink); display: grid; place-items: center; flex: 0 0 auto; margin: 0 7px 0 3px; }
.cp-logo .cp-mark { width: 20px; height: 20px; }
.cp-logo-alert { color: var(--cp-danger); }
.cp-title { font-family: var(--cp-serif); font-weight: 700; font-size: 16px; letter-spacing: -.005em; white-space: nowrap; }
.cp-head-text { min-width: 0; overflow: hidden; }
.cp-context {
  display: flex; align-items: center; gap: 6px; min-width: 0; min-height: 20px;
  padding-left: 7px; color: var(--cp-muted); font-size: 12px;
}
.cp-context-job { font-weight: 600; color: var(--cp-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 0 1 auto; }
.cp-context-build { font-variant-numeric: tabular-nums; flex: 0 0 auto; }
.cp-context-session { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; flex: 1 1 0; color: var(--cp-muted); }
.cp-context-session::before { content: '/'; margin-right: 6px; color: var(--cp-faint); }
.cp-context-flags { display: flex; align-items: center; gap: 4px; margin-left: auto; flex: 0 0 auto; }
.cp-flag { display: grid; place-items: center; width: 18px; height: 18px; color: var(--cp-faint); border-radius: 4px; cursor: default; }
.cp-flag svg { width: 14px; height: 14px; }
.cp-flag-danger { color: var(--cp-danger); }

.cp-iconbtn, .cp-bar-btn, .cp-session-new, .cp-session-action, .cp-menu-refresh {
  border: 0; background: transparent; color: var(--cp-muted); cursor: pointer;
  width: 28px; height: 28px; padding: 0; border-radius: 5px;
  display: grid; place-items: center; flex: 0 0 auto;
  transition: background .14s ease, color .14s ease;
}
.cp-iconbtn:hover, .cp-bar-btn:hover, .cp-session-new:hover, .cp-session-action:hover, .cp-menu-refresh:hover {
  background: color-mix(in srgb, var(--cp-text) 8%, transparent); color: var(--cp-text);
}
.cp-iconbtn:active, .cp-bar-btn:active { transform: scale(.94); }
.cp-iconbtn svg, .cp-bar-btn svg { width: 16px; height: 16px; }
.cp-back-chevron { transform: rotate(90deg); }

/* Thread */
.cp-thread {
  flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 16px 16px 10px;
  display: flex; flex-direction: column; gap: 12px;
  scrollbar-width: thin; scrollbar-color: var(--cp-border-strong) transparent;
}
.cp-thread > * { flex: 0 0 auto; animation: cp-rise .26s var(--cp-ease); }
.cp-thread::-webkit-scrollbar, .cp-sessions-scroll::-webkit-scrollbar, .cp-settings-scroll::-webkit-scrollbar, .cp-menu-scroll::-webkit-scrollbar, .cp-reasoning-body::-webkit-scrollbar { width: 8px; }
.cp-thread::-webkit-scrollbar-thumb, .cp-sessions-scroll::-webkit-scrollbar-thumb, .cp-settings-scroll::-webkit-scrollbar-thumb, .cp-menu-scroll::-webkit-scrollbar-thumb, .cp-reasoning-body::-webkit-scrollbar-thumb { background: var(--cp-border-strong); border-radius: 8px; }

/* Empty state */
.cp-empty { margin: auto 0; display: flex; flex-direction: column; gap: 9px; max-width: 420px; }
.cp-empty h3 { margin: 0; font-family: var(--cp-serif); font-size: 21px; font-weight: 400; letter-spacing: -.01em; line-height: 1.25; }
.cp-empty p { margin: 0; color: var(--cp-muted); font-size: 12.5px; }
.cp-empty-session { font-size: 12px; }
.cp-quick { display: flex; flex-direction: column; margin-top: 6px; border-top: 1px solid var(--cp-border); }
.cp-quick button {
  display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
  border: 0; border-bottom: 1px solid var(--cp-border); background: transparent;
  color: var(--cp-text); padding: 9px 2px; font-size: 12.5px; cursor: pointer;
  transition: color .14s ease, padding .18s var(--cp-ease);
}
.cp-quick button::after { content: '→'; margin-left: auto; color: var(--cp-faint); opacity: 0; transform: translateX(-4px); transition: opacity .14s ease, transform .18s var(--cp-ease); }
.cp-quick button:hover { color: var(--cp-accent-ink); padding-left: 6px; }
.cp-quick button:hover::after { opacity: 1; transform: none; color: var(--cp-accent-ink); }

.cp-alert { display: flex; flex-direction: column; gap: 8px; padding-bottom: 14px; margin-bottom: 8px; border-bottom: 1px solid var(--cp-border); }
.cp-alert-title { display: flex; align-items: center; gap: 8px; font-family: var(--cp-serif); font-size: 18px; line-height: 1.25; }
.cp-alert-title .cp-statusicon { width: 22px; height: 22px; }
.cp-alert p { color: var(--cp-text); font-size: 12.5px; line-height: 1.55; }
.cp-alert-actions { display: flex; gap: 6px; flex-wrap: wrap; }

/* Messages */
.cp-msg { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.cp-msg-body { overflow-wrap: anywhere; line-height: 1.6; font-size: 13.5px; min-width: 0; animation: cp-fade .22s ease-out; }
.cp-msg.cp-user { align-self: flex-end; max-width: 88%; }
.cp-msg.cp-user .cp-msg-body {
  padding: 7px 11px; background: var(--cp-accent-soft); border-radius: 8px 8px 2px 8px; line-height: 1.5; font-size: 13px;
}
.cp-msg.cp-user .cp-thumbs { justify-content: flex-end; }
.cp-narration-msg .cp-msg-body { color: var(--cp-muted); font-size: 12.5px; line-height: 1.5; }
.cp-msg-body > :first-child { margin-top: 0; }
.cp-msg-body > :last-child { margin-bottom: 0; }
.cp-msg-body p { margin: 0 0 9px; }
.cp-msg-body h1, .cp-msg-body h2, .cp-msg-body h3, .cp-msg-body h4 { margin: 14px 0 6px; font-family: var(--cp-serif); font-size: 15px; font-weight: 700; }
.cp-msg-body ul, .cp-msg-body ol { margin: 4px 0 9px; padding-left: 20px; }
.cp-msg-body li { margin: 3px 0; }
.cp-msg-body li::marker { color: var(--cp-faint); }
.cp-msg-body code {
  font-family: var(--cp-mono); font-size: .86em; background: color-mix(in srgb, var(--cp-text) 7%, transparent);
  border-radius: 3px; padding: 1px 4px;
}
.cp-msg-body a { color: var(--cp-accent-ink); text-decoration: underline; text-underline-offset: 2px; }
.cp-msg-body blockquote { margin: 7px 0; padding: 1px 0 1px 11px; border-left: 2px solid var(--cp-accent); color: var(--cp-muted); }
.cp-msg-body table { border-collapse: collapse; width: 100%; margin: 7px 0; font-size: 12px; display: block; overflow-x: auto; }
.cp-msg-body th, .cp-msg-body td { border-bottom: 1px solid var(--cp-border); padding: 5px 10px 5px 0; text-align: left; }
.cp-msg-body th { font-weight: 600; border-bottom-color: var(--cp-border-strong); }
.cp-msg-foot { display: flex; height: 22px; align-items: center; justify-content: flex-end; }
.cp-copy-btn {
  width: 24px; height: 22px; padding: 0; margin-left: 0; border: 0; border-radius: 4px; background: transparent; color: var(--cp-faint);
  display: grid; place-items: center; cursor: pointer; opacity: .55;
  transition: opacity .14s ease, background .14s ease, color .14s ease;
}
.cp-msg:hover .cp-copy-btn, .cp-copy-btn:focus-visible, .cp-copy-btn-done { opacity: 1; }
.cp-copy-btn:hover { background: color-mix(in srgb, var(--cp-text) 8%, transparent); color: var(--cp-text); }
.cp-copy-btn:disabled { opacity: 0; cursor: not-allowed; }
.cp-copy-btn svg { width: 14px; height: 14px; }
.cp-copy-btn-done, .cp-copy-btn-done:hover { color: var(--cp-success); }
@media (hover: none) { .cp-copy-btn { opacity: 1; } }

.cp-code { margin: 9px 0; border-radius: 6px; overflow: hidden; background: var(--cp-code); }
.cp-code-head {
  display: flex; align-items: center; gap: 8px; padding: 4px 6px 4px 11px;
  border-bottom: 1px solid rgba(255,255,255,.07); color: var(--cp-code-muted); font-size: 11px; font-family: var(--cp-mono);
}
.cp-copy { border: 0; background: transparent; color: var(--cp-code-muted); cursor: pointer; font-size: 11px; font-family: var(--cp-mono); padding: 2px 6px; border-radius: 4px; }
.cp-copy:hover { color: #fff; background: rgba(255,255,255,.08); }
.cp-code pre { margin: 0; padding: 10px 11px; overflow-x: auto; color: var(--cp-code-text); font-family: var(--cp-mono); font-size: 12px; line-height: 1.55; }
.cp-code pre code { background: transparent; padding: 0; color: inherit; font-size: inherit; }
.hljs-keyword, .hljs-selector-tag, .hljs-built_in, .hljs-name { color: #e6a06f; }
.hljs-string, .hljs-attr, .hljs-symbol, .hljs-bullet { color: #a9c98a; }
.hljs-comment, .hljs-quote { color: #7c8494; font-style: italic; }
.hljs-number, .hljs-literal, .hljs-variable, .hljs-template-variable { color: #8fbcd4; }
.hljs-title, .hljs-section, .hljs-type { color: #e3c678; }
.cp-cursor {
  display: inline-block; width: 2px; height: 1.05em; margin-left: 2px; vertical-align: -.16em;
  background: var(--cp-accent-ink); border-radius: 1px; animation: cp-caret 1s ease-in-out infinite;
}
@keyframes cp-caret { 0%, 100% { opacity: 1; } 50% { opacity: .15; } }

/* Working line */
.cp-working { display: flex; align-items: center; gap: 8px; min-height: 22px; font-size: 12.5px; color: var(--cp-muted); }
.cp-working-time { font-family: var(--cp-mono); font-size: 11px; color: var(--cp-faint); font-variant-numeric: tabular-nums; }

/* Thought process */
.cp-reasoning { display: flex; flex-direction: column; min-width: 0; }
.cp-reasoning-head {
  display: inline-flex; align-items: center; gap: 8px; align-self: flex-start;
  border: 0; background: transparent; color: var(--cp-muted); cursor: pointer;
  padding: 2px 4px 2px 0; font-size: 12.5px; text-align: left; border-radius: 4px;
  transition: color .14s ease;
}
.cp-reasoning-head:hover { color: var(--cp-text); }
.cp-reasoning-chevron { width: 12px; height: 12px; opacity: .7; transition: transform .22s var(--cp-ease); }
.cp-reasoning-open .cp-reasoning-chevron { transform: rotate(180deg); }
.cp-reasoning-body {
  margin: 5px 0 2px 8px; padding: 1px 0 1px 17px; border-left: 1px solid var(--cp-border-strong);
  color: var(--cp-muted); font-size: 12.5px; line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: anywhere; max-height: 240px; overflow-y: auto; scrollbar-width: thin;
}
.cp-reasoning-live .cp-reasoning-clipped {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 22px);
  mask-image: linear-gradient(to bottom, transparent 0, #000 22px);
}

/* Tool ledger: consecutive tools share a rail */
.cp-tool { position: relative; min-width: 0; }
.cp-tool + .cp-tool { margin-top: -10px; }
.cp-tool + .cp-tool::before {
  content: ''; position: absolute; left: 8px; top: -3px; height: 9px; width: 1px; background: var(--cp-border-strong);
}
.cp-tool-head { display: flex; align-items: center; gap: 2px; min-height: 26px; }
.cp-tool-toggle {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 7px; height: 26px; padding: 0 5px;
  border: 0; border-radius: 4px; background: transparent; color: var(--cp-text); cursor: pointer; text-align: left;
  transition: background .14s ease;
}
.cp-tool-toggle:hover { background: color-mix(in srgb, var(--cp-text) 6%, transparent); }
.cp-tool-icon { width: 14px; height: 14px; color: var(--cp-faint); flex: 0 0 auto; }
.cp-tool-name { font-family: var(--cp-mono); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 0 1 auto; min-width: 0; }
.cp-tool-running .cp-tool-name { color: var(--cp-accent-ink); }
.cp-tool-failed .cp-tool-name { color: var(--cp-danger); }
.cp-tool-target { color: var(--cp-muted); font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 0 2 auto; min-width: 0; }
.cp-tool-chevron { width: 12px; height: 12px; margin-left: auto; color: var(--cp-faint); opacity: 0; flex: 0 0 auto; transition: transform .22s var(--cp-ease), opacity .14s ease; }
.cp-tool-toggle:hover .cp-tool-chevron, .cp-tool-toggle:focus-visible .cp-tool-chevron, .cp-tool-open .cp-tool-chevron { opacity: 1; }
.cp-tool-open .cp-tool-chevron { transform: rotate(180deg); }
.cp-tool-body { margin: 3px 0 6px 8px; padding: 2px 0 2px 17px; border-left: 1px solid var(--cp-border-strong); display: flex; flex-direction: column; gap: 7px; }
.cp-label { font-size: 11px; color: var(--cp-muted); margin-bottom: 3px; }
.cp-pre {
  margin: 0; padding: 8px 9px; background: var(--cp-code); color: var(--cp-code-text); border-radius: 5px;
  font-family: var(--cp-mono); font-size: 11.5px; line-height: 1.5; max-height: 220px; overflow: auto;
  white-space: pre-wrap; overflow-wrap: anywhere;
}

/* Approvals */
.cp-approval {
  border-left: 3px solid var(--cp-warning); background: var(--cp-warning-soft); border-radius: 0 6px 6px 0; padding: 10px 12px 12px;
  display: flex; flex-direction: column; gap: 8px; transition: border-color .2s ease, background .2s ease;
}
.cp-approval.cp-risk3 { border-left-color: var(--cp-danger); background: var(--cp-danger-soft); }
.cp-approval-approved, .cp-approval-approved.cp-risk3 { border-left-color: var(--cp-success); background: color-mix(in srgb, var(--cp-success) 8%, transparent); }
.cp-approval-rejected, .cp-approval-rejected.cp-risk3 { border-left-color: var(--cp-faint); background: color-mix(in srgb, var(--cp-text) 4%, transparent); }
.cp-approval-head { display: flex; align-items: center; gap: 8px; }
.cp-approval-title { font-family: var(--cp-serif); font-size: 15px; font-weight: 700; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-risk { position: relative; display: grid; place-items: center; width: 22px; height: 22px; margin-left: auto; border-radius: 4px; cursor: default; }
.cp-risk svg { width: 17px; height: 17px; }
.cp-risk.cp-r2 { color: var(--cp-warning); }
.cp-risk.cp-r3 { color: var(--cp-danger); }
.cp-approval-body { display: flex; flex-direction: column; gap: 9px; }
.cp-kv { display: grid; grid-template-columns: 58px 1fr; gap: 3px 8px; margin: 0; font-size: 12.5px; }
.cp-kv dt { color: var(--cp-muted); }
.cp-kv dd { margin: 0; font-family: var(--cp-mono); font-size: 12px; overflow-wrap: anywhere; }
.cp-validation { display: flex; gap: 7px; align-items: center; font-size: 12.5px; }
.cp-disclose {
  display: inline-flex; align-items: center; gap: 5px; align-self: flex-start; padding: 2px 4px 2px 0;
  border: 0; background: transparent; color: var(--cp-text); font-size: 12.5px; font-weight: 600; cursor: pointer; border-radius: 4px;
}
.cp-disclose svg { width: 12px; height: 12px; transform: rotate(-90deg); transition: transform .22s var(--cp-ease); }
.cp-disclose:hover { color: var(--cp-accent-ink); }
.cp-disclose-open svg { transform: none; }
.cp-approval details summary { font-size: 12px; color: var(--cp-muted); margin: 0; }
.cp-approval details .cp-pre { margin-top: 5px; }
.cp-actions { display: flex; gap: 6px; align-items: center; }
.cp-input {
  flex: 1; min-width: 0; background: var(--cp-panel); border: 1px solid var(--cp-border-strong);
  border-radius: 5px; padding: 6px 8px; color: var(--cp-text); font-size: 12.5px; font-family: var(--cp-sans);
  transition: border-color .14s ease;
}
.cp-input:focus { outline: none; border-color: var(--cp-accent-ink); }
.cp-input::placeholder, .cp-field input::placeholder, .cp-session-search::placeholder { color: var(--cp-faint); }
.cp-btn {
  border: 1px solid var(--cp-border-strong); background: transparent; color: var(--cp-text);
  border-radius: 5px; padding: 5px 11px; font-size: 12.5px; font-weight: 600; cursor: pointer;
  font-family: var(--cp-sans); white-space: nowrap;
  transition: background .14s ease, border-color .14s ease, color .14s ease, transform .1s ease;
}
.cp-btn:hover { background: color-mix(in srgb, var(--cp-text) 6%, transparent); }
.cp-btn:active { transform: translateY(1px); }
.cp-btn.cp-primary { background: var(--cp-accent); border-color: var(--cp-accent); color: var(--cp-on-accent); }
.cp-btn.cp-primary:hover { background: color-mix(in srgb, var(--cp-accent) 88%, var(--cp-text)); }
.cp-btn.cp-danger { color: var(--cp-danger); border-color: color-mix(in srgb, var(--cp-danger) 50%, var(--cp-border)); }
.cp-btn.cp-danger:hover { background: var(--cp-danger-soft); }
.cp-btn:disabled { opacity: .5; cursor: not-allowed; }
.cp-btn.cp-btn-sm { padding: 3px 9px; font-size: 12px; }
.cp-diff { border-radius: 5px; overflow: hidden; background: var(--cp-code); }
.cp-diff-head { display: flex; align-items: center; gap: 6px; padding: 5px 10px; border-bottom: 1px solid rgba(255,255,255,.07); color: var(--cp-code-muted); font-size: 11px; font-family: var(--cp-mono); }
.cp-diff pre { margin: 0; padding: 6px 0; overflow: auto; max-height: 300px; font-family: var(--cp-mono); font-size: 11.5px; line-height: 1.55; color: var(--cp-code-text); }
.cp-diff .cp-line { display: block; padding: 0 10px; white-space: pre; width: max-content; min-width: 100%; }
.cp-diff .cp-add { background: rgba(111, 196, 141, .14); color: #a6dcb7; }
.cp-diff .cp-del { background: rgba(236, 128, 119, .14); color: #f0a9a2; }
.cp-diff .cp-hunk { color: var(--cp-code-muted); }
.cp-errline { padding: 7px 10px; border-left: 3px solid var(--cp-danger); background: var(--cp-danger-soft); color: var(--cp-danger); border-radius: 0 5px 5px 0; font-size: 12.5px; }
.cp-banner { padding: 6px 14px; background: var(--cp-warning-soft); color: var(--cp-warning); font-size: 12px; border-bottom: 1px solid var(--cp-border); animation: cp-fade .2s ease-out; }

/* Approval dock */
.cp-approval-dock {
  flex: 0 0 auto; display: flex; align-items: center; gap: 8px; padding: 7px 14px;
  border-top: 1px solid var(--cp-border); background: var(--cp-warning-soft); animation: cp-rise .24s var(--cp-ease);
}
.cp-approval-dock-risk3 { background: var(--cp-danger-soft); }
.cp-approval-dock-main { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.cp-approval-dock-main svg { width: 15px; height: 15px; color: var(--cp-warning); flex: 0 0 auto; }
.cp-approval-dock-risk3 .cp-approval-dock-main svg { color: var(--cp-danger); }
.cp-approval-dock-text { min-width: 0; }
.cp-approval-dock-title { font-size: 12.5px; font-weight: 600; }
.cp-approval-dock-meta { font-size: 11.5px; font-family: var(--cp-mono); color: var(--cp-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-approval-dock-actions { display: flex; align-items: center; gap: 4px; flex: 0 0 auto; }

/* Composer */
.cp-composer { border-top: 1px solid var(--cp-border); padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
.cp-composer-box {
  border: 1px solid var(--cp-border-strong); border-radius: 8px; background: var(--cp-panel-2);
  padding: 6px 6px 5px; display: flex; flex-direction: column; gap: 2px;
  transition: border-color .16s ease; container-type: inline-size;
}
.cp-composer-box:focus-within { border-color: var(--cp-accent-ink); }
.cp-textarea {
  border: 0; background: transparent; outline: none; resize: none; width: 100%; padding: 4px 6px; min-height: 30px; max-height: 160px;
  color: var(--cp-text); font-family: var(--cp-sans); font-size: 13.5px; line-height: 1.45;
}
.cp-shell .cp-textarea:focus-visible { outline: none; }
.cp-textarea::placeholder { color: var(--cp-faint); }
.cp-composer-bar { display: flex; align-items: center; gap: 2px; min-width: 0; }
.cp-bar-left { display: flex; align-items: center; gap: 1px; }
.cp-bar-right { display: flex; align-items: center; gap: 1px; margin-left: auto; min-width: 0; }
.cp-shield-wrap { display: inline-flex; border-radius: 5px; }
.cp-shield {
  width: 28px; height: 28px; padding: 0; display: grid; place-items: center; color: var(--cp-success);
  cursor: pointer; border: 0; background: transparent; border-radius: 5px; transition: background .14s ease, color .14s ease;
}
.cp-shield:hover { background: color-mix(in srgb, var(--cp-text) 8%, transparent); }
.cp-shield:disabled { pointer-events: none; opacity: .5; }
.cp-shield svg { width: 16px; height: 16px; }
.cp-shield-bypass { color: var(--cp-danger); background: var(--cp-danger-soft); }
.cp-pill {
  display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 5px; border-radius: 5px; border: 0;
  background: transparent; color: var(--cp-muted); min-width: 0; cursor: pointer; font-family: var(--cp-sans);
  transition: background .14s ease, color .14s ease;
}
.cp-pill:hover, .cp-pill-active { background: color-mix(in srgb, var(--cp-text) 8%, transparent); color: var(--cp-text); }
.cp-pill-icon { display: block; width: 14px; height: 14px; flex: 0 0 auto; }
.cp-pill-icon svg { width: 100%; height: 100%; }
.cp-pill-chevron { width: 10px; height: 10px; opacity: .55; flex: 0 0 auto; }
.cp-pill-value { font-size: 11.5px; max-width: 124px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-pill-thinking { flex: 0 0 auto; }
@container (max-width: 470px) {
  .cp-pill-provider { flex: 0 0 auto; }
  .cp-pill-provider .cp-pill-value { display: none; }
}
@container (max-width: 330px) {
  .cp-pill-thinking .cp-pill-value { display: none; }
}
.cp-composer .cp-send {
  width: 30px; height: 30px; border-radius: 6px; border: 0; background: var(--cp-accent); color: var(--cp-on-accent);
  display: grid; place-items: center; cursor: pointer; padding: 0; margin-left: 3px; flex: 0 0 auto;
  transition: opacity .16s ease, transform .16s var(--cp-ease), background .14s ease;
}
.cp-composer .cp-send:hover:not(:disabled) { transform: translateY(-1px); }
.cp-composer .cp-send svg { width: 14px; height: 14px; }
.cp-composer .cp-send:disabled { background: color-mix(in srgb, var(--cp-text) 12%, transparent); color: var(--cp-faint); cursor: not-allowed; }
.cp-thumbs { display: flex; gap: 6px; flex-wrap: wrap; }
.cp-thumb { position: relative; width: 54px; height: 54px; border-radius: 6px; overflow: hidden; background: var(--cp-panel-2); display: inline-flex; animation: cp-pop-in .2s var(--cp-ease); }
.cp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cp-thumb button { position: absolute; top: 2px; right: 2px; width: 17px; height: 17px; padding: 0; border-radius: 50%; border: 0; background: rgba(14, 16, 22, .78); color: #fff; cursor: pointer; display: grid; place-items: center; }
.cp-thumb button svg { width: 10px; height: 10px; }

/* Dialog */
.cp-confirm-backdrop {
  position: fixed; inset: 0; z-index: 2147483003; display: grid; place-items: center; padding: 20px;
  background: rgba(9, 11, 16, .5); pointer-events: auto; animation: cp-fade .16s ease-out;
}
.cp-confirm {
  width: min(360px, 100%); background: var(--cp-panel); color: var(--cp-text);
  border-radius: 8px; box-shadow: var(--cp-pop); padding: 18px; animation: cp-pop-in .2s var(--cp-ease);
}
.cp-confirm h3 { margin: 0 0 7px; font-family: var(--cp-serif); font-size: 17px; font-weight: 700; }
.cp-confirm p { margin: 0; color: var(--cp-muted); font-size: 12.5px; line-height: 1.55; overflow-wrap: anywhere; }
.cp-confirm-actions { display: flex; justify-content: flex-end; gap: 7px; margin-top: 16px; }

/* Menus */
.cp-portal-root { position: fixed; inset: 0; pointer-events: none; z-index: 2147483001; }
.cp-menu {
  pointer-events: auto; display: flex; flex-direction: column; min-height: 0; overflow: hidden;
  background: var(--cp-panel); color: var(--cp-text); border: 1px solid var(--cp-border);
  border-radius: 7px; box-shadow: var(--cp-pop); padding: 4px; font-family: var(--cp-sans); font-size: 12.5px;
  animation: cp-pop-in .14s var(--cp-ease);
}
.cp-menu-search { display: flex; align-items: center; gap: 4px; padding: 2px 2px 5px; border-bottom: 1px solid var(--cp-border); margin-bottom: 4px; }
.cp-menu-search input { flex: 1; min-width: 0; height: 28px; border: 0; background: transparent; color: var(--cp-text); padding: 0 6px; font-size: 12.5px; font-family: var(--cp-sans); }
.cp-shell .cp-menu-search input:focus-visible { outline: none; }
.cp-menu-refresh svg { width: 14px; height: 14px; }
.cp-menu-scroll { overflow-y: auto; min-height: 0; scrollbar-width: thin; }
.cp-menu-label { display: flex; align-items: center; gap: 6px; padding: 7px 8px 3px; font-size: 11.5px; font-weight: 600; color: var(--cp-muted); }
.cp-menu-label-meta { margin-left: auto; font-weight: 400; font-size: 11px; color: var(--cp-faint); }
.cp-menu-group + .cp-menu-group { border-top: 1px solid var(--cp-border); margin-top: 3px; }
.cp-menu-empty { padding: 8px; color: var(--cp-muted); font-size: 12px; }
.cp-menu-error { color: var(--cp-danger); overflow-wrap: anywhere; }
.cp-menu-item {
  display: flex; align-items: center; gap: 8px; width: 100%; border: 0; background: transparent; color: var(--cp-text);
  padding: 6px 8px; border-radius: 4px; cursor: pointer; text-align: left; font-family: var(--cp-sans); font-size: 12.5px;
}
.cp-menu-item:hover, .cp-menu-item-active { background: color-mix(in srgb, var(--cp-text) 7%, transparent); }
.cp-menu-item-selected, .cp-menu-item-selected:hover, .cp-menu-item-selected.cp-menu-item-active { background: var(--cp-accent-soft); }
.cp-menu-item-icon { width: 14px; height: 14px; color: var(--cp-muted); flex: 0 0 auto; }
.cp-menu-item-selected .cp-menu-item-icon { color: var(--cp-accent-ink); }
.cp-menu-item-main { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.cp-menu-item-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-menu-item-meta { color: var(--cp-muted); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-menu-check { width: 14px; height: 14px; color: var(--cp-accent-ink); flex: 0 0 auto; }

/* Session manager */
.cp-sessions, .cp-settings { display: flex; flex-direction: column; min-height: 0; flex: 1; animation: cp-fade .18s ease-out; }
.cp-sessions-head { padding: 10px 12px 10px 14px; border-bottom: 1px solid var(--cp-border); display: flex; flex-direction: column; gap: 8px; }
.cp-sessions-title-row { display: flex; align-items: baseline; gap: 7px; }
.cp-sessions-title-row .cp-bar-btn { align-self: center; }
.cp-sessions-title { font-family: var(--cp-serif); font-weight: 700; font-size: 16px; }
.cp-sessions-count { font-size: 12px; color: var(--cp-faint); font-variant-numeric: tabular-nums; }
.cp-session-search {
  width: 100%; height: 30px; border: 1px solid var(--cp-border-strong); border-radius: 5px; background: var(--cp-panel-2);
  color: var(--cp-text); padding: 0 9px; font-size: 12.5px; font-family: var(--cp-sans); transition: border-color .14s ease;
}
.cp-session-search:focus { outline: none; border-color: var(--cp-accent-ink); }
.cp-sessions-scroll { flex: 1; overflow-y: auto; padding: 8px 8px 18px; scrollbar-width: thin; }
.cp-session-empty { padding: 28px 12px; text-align: center; color: var(--cp-muted); font-size: 12.5px; }
.cp-session-group { margin-bottom: 8px; }
.cp-session-group-head { display: flex; align-items: center; gap: 2px; border-radius: 5px; }
.cp-session-group-toggle {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; border: 0; background: transparent; color: var(--cp-text);
  cursor: pointer; padding: 5px 6px; border-radius: 5px; font-size: 12.5px; text-align: left;
}
.cp-session-group-toggle:hover { background: color-mix(in srgb, var(--cp-text) 5%, transparent); }
.cp-session-chevron { width: 12px; height: 12px; color: var(--cp-faint); transition: transform .2s var(--cp-ease); flex: 0 0 auto; }
.cp-session-chevron.cp-collapsed { transform: rotate(-90deg); }
.cp-session-folder { width: 15px; height: 15px; color: var(--cp-muted); flex: 0 0 auto; }
.cp-session-pipeline { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-session-group-count { font-size: 11.5px; color: var(--cp-faint); font-variant-numeric: tabular-nums; }
.cp-session-new { width: 24px; height: 24px; opacity: 0; }
.cp-session-group-head:hover .cp-session-new, .cp-session-new:focus-visible { opacity: 1; }
.cp-session-new svg { width: 14px; height: 14px; }
.cp-session-rows { display: flex; flex-direction: column; padding: 1px 0 2px 10px; animation: cp-fade .18s ease-out; }
.cp-session-row { display: flex; align-items: center; gap: 2px; border-radius: 5px; transition: background .12s ease; }
.cp-session-row:hover { background: color-mix(in srgb, var(--cp-text) 5%, transparent); }
.cp-session-row-active, .cp-session-row-active:hover { background: var(--cp-accent-soft); }
.cp-session-row-main { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; padding-left: 6px; }
.cp-session-open { flex: 1; min-width: 0; border: 0; background: transparent; color: inherit; text-align: left; padding: 5px 2px; cursor: pointer; border-radius: 4px; }
.cp-session-status { display: inline-flex; width: 16px; flex: 0 0 auto; justify-content: center; }
.cp-session-row-text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.cp-session-name { font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-session-meta { color: var(--cp-faint); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-session-rename { flex: 1; min-width: 0; height: 26px; margin: 3px 4px 3px 0; border: 1px solid var(--cp-accent-ink); border-radius: 4px; background: var(--cp-panel); color: var(--cp-text); padding: 0 6px; font-size: 12.5px; font-family: var(--cp-sans); }
.cp-session-rename:focus { outline: none; }
.cp-session-actions { display: none; align-items: center; gap: 1px; padding-right: 4px; }
.cp-session-row:hover .cp-session-actions, .cp-session-row:focus-within .cp-session-actions { display: flex; }
.cp-session-action { width: 24px; height: 24px; }
.cp-session-action svg { width: 14px; height: 14px; }
@media (hover: none) { .cp-session-actions { display: flex; } .cp-session-new { opacity: 1; } }

/* Settings */
.cp-settings-head { display: flex; align-items: center; gap: 5px; padding: 10px 12px 8px 8px; }
.cp-settings-title { font-family: var(--cp-serif); font-weight: 700; font-size: 16px; }
.cp-settings-tabs { display: flex; gap: 12px; padding: 0 14px; border-bottom: 1px solid var(--cp-border); overflow-x: auto; scrollbar-width: none; }
.cp-settings-tab {
  display: inline-flex; align-items: center; gap: 5px; border: 0; background: transparent; color: var(--cp-muted); cursor: pointer;
  padding: 6px 1px 8px; font-size: 12.5px; font-weight: 600; white-space: nowrap;
  box-shadow: inset 0 0 0 transparent; transition: color .14s ease, box-shadow .18s var(--cp-ease);
}
.cp-settings-tab svg { width: 14px; height: 14px; }
.cp-settings-tab:hover { color: var(--cp-text); }
.cp-settings-tab-active { color: var(--cp-text); box-shadow: inset 0 -2px 0 var(--cp-accent-ink); }
.cp-settings-scroll { flex: 1; overflow-y: auto; padding: 14px 14px 24px; scrollbar-width: thin; }
.cp-settings-section { display: flex; flex-direction: column; gap: 10px; animation: cp-fade .18s ease-out; }
.cp-settings-section h3 { margin: 0; font-family: var(--cp-serif); font-size: 17px; font-weight: 700; }
.cp-settings-section p { margin: 3px 0 0; color: var(--cp-muted); font-size: 12.5px; line-height: 1.5; }
.cp-settings-section a { color: var(--cp-accent-ink); }
.cp-settings-section h4 { margin: 8px 0 0; font-size: 12.5px; font-weight: 600; }
.cp-about-head { display: flex; align-items: baseline; gap: 8px; }
.cp-settings-version { font-family: var(--cp-mono); font-size: 11.5px; color: var(--cp-faint); }
.cp-settings-section .cp-about-lede { color: var(--cp-text); font-size: 13px; line-height: 1.6; }
.cp-settings-section-head { display: flex; align-items: flex-start; gap: 8px; justify-content: space-between; }
.cp-settings-note { color: var(--cp-muted); font-size: 12px; line-height: 1.55; padding-top: 10px; border-top: 1px solid var(--cp-border); }
.cp-settings-note code { font-family: var(--cp-mono); font-size: 11.5px; }
.cp-settings-list { display: flex; flex-direction: column; border-top: 1px solid var(--cp-border); }
.cp-settings-card { display: flex; align-items: center; gap: 10px; padding: 9px 2px; border-bottom: 1px solid var(--cp-border); }
.cp-settings-card-icon { color: var(--cp-muted); display: grid; place-items: center; flex: 0 0 auto; }
.cp-settings-card-icon svg { width: 18px; height: 18px; }
.cp-settings-card-main { min-width: 0; flex: 1; }
.cp-settings-card-title { display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 600; }
.cp-settings-card-meta { color: var(--cp-muted); font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-settings-card-actions { display: flex; align-items: center; gap: 1px; flex: 0 0 auto; }
.cp-settings-badge { display: grid; place-items: center; color: var(--cp-accent-ink); border-radius: 50%; cursor: default; }
.cp-settings-badge svg { width: 14px; height: 14px; }
.cp-settings-form { padding: 12px; border-radius: 6px; display: flex; flex-direction: column; gap: 10px; background: var(--cp-panel-2); animation: cp-rise .2s var(--cp-ease); }
.cp-settings-form-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px; }
.cp-settings-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.cp-settings-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--cp-border); }
.cp-settings-row > span { font-size: 12.5px; font-weight: 600; }
.cp-provider-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; }
.cp-provider {
  border: 1px solid var(--cp-border-strong); background: transparent; border-radius: 5px; padding: 7px 9px; cursor: pointer; text-align: left;
  display: flex; flex-direction: column; gap: 2px; color: var(--cp-text); transition: border-color .14s ease, background .14s ease;
}
.cp-provider:hover { border-color: var(--cp-accent-ink); }
.cp-provider-active { border-color: var(--cp-accent-ink); background: var(--cp-accent-soft); }
.cp-provider-name { font-weight: 600; font-size: 12.5px; }
.cp-provider-state { font-size: 11px; color: var(--cp-muted); }
.cp-provider-state.cp-configured { color: var(--cp-success); }
.cp-field { display: flex; flex-direction: column; gap: 4px; }
.cp-field > span { font-size: 12px; font-weight: 600; color: var(--cp-text); }
.cp-field > span.cp-field-hint { font-size: 11.5px; font-weight: 400; color: var(--cp-muted); }
.cp-field input, .cp-field select {
  width: 100%; height: 32px; border: 1px solid var(--cp-border-strong); border-radius: 5px; background: var(--cp-panel);
  color: var(--cp-text); padding: 0 9px; font-size: 12.5px; font-family: var(--cp-sans); transition: border-color .14s ease;
}
.cp-field input:focus, .cp-field select:focus { outline: none; border-color: var(--cp-accent-ink); }
.cp-setup { display: flex; flex-direction: column; gap: 12px; }
.cp-setup h3 { margin: 0; font-family: var(--cp-serif); font-size: 17px; }
.cp-setup p { margin: 0; color: var(--cp-muted); font-size: 12.5px; }
.cp-setup-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cp-setup-note { color: var(--cp-muted); font-size: 12px; }

/* Appearance */
.cp-swatches { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; }
.cp-swatch {
  position: relative; width: 34px; height: 34px; padding: 0; border: 0; border-radius: 50%; cursor: pointer; display: grid; place-items: center;
  background: var(--cp-swatch); color: var(--cp-swatch-on);
  transition: transform .18s var(--cp-ease), box-shadow .16s ease;
}
.cp-swatch:hover { transform: scale(1.08); }
.cp-swatch-active { box-shadow: 0 0 0 2px var(--cp-panel), 0 0 0 4px var(--cp-swatch); }
.cp-swatch svg { width: 15px; height: 15px; animation: cp-pop-in .18s var(--cp-ease); }
.cp-swatch .cp-mark { width: 18px; height: 18px; }
.cp-accent-name { font-size: 12.5px; color: var(--cp-muted); }
.cp-accent-name b { color: var(--cp-text); font-weight: 600; }
.cp-accent-preview { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 12px 0 4px; }
.cp-accent-link { color: var(--cp-accent-ink); font-size: 12.5px; text-decoration: underline; text-underline-offset: 2px; }
.cp-accent-mark { color: var(--cp-accent-ink); }
.cp-segment { display: inline-flex; border: 1px solid var(--cp-border-strong); border-radius: 5px; overflow: hidden; }
.cp-segment button {
  display: inline-flex; align-items: center; gap: 5px; border: 0; background: transparent; color: var(--cp-muted); cursor: pointer;
  padding: 4px 10px; font-size: 12.5px; font-weight: 600; transition: background .14s ease, color .14s ease;
}
.cp-segment button + button { border-left: 1px solid var(--cp-border-strong); }
.cp-segment button svg { width: 14px; height: 14px; }
.cp-segment button:hover { color: var(--cp-text); }
.cp-segment button[aria-pressed="true"] { background: var(--cp-accent-soft); color: var(--cp-accent-ink); }

@media (max-width: 640px) {
  .cp-drawer { width: 100vw !important; }
  .cp-fab { right: 14px; bottom: 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .cp-shell *, .cp-shell *::before, .cp-shell *::after { animation: none !important; transition: none !important; }
  .cp-shimmer { background: none; -webkit-text-fill-color: currentColor; }
}
`;
