export const css = `
.cp-reset { all: initial; }
.cp-shell {
  --cp-bg: #f6f7f9;
  --cp-panel: #ffffff;
  --cp-panel-2: #fbfbfd;
  --cp-text: #111827;
  --cp-muted: #667085;
  --cp-border: #e4e7ec;
  --cp-border-strong: #d0d5dd;
  --cp-accent: #4f46e5;
  --cp-accent-soft: #eef2ff;
  --cp-cyan: #0e7490;
  --cp-success: #15803d;
  --cp-success-soft: #ecfdf3;
  --cp-warning: #b45309;
  --cp-warning-soft: #fffbeb;
  --cp-danger: #b42318;
  --cp-danger-soft: #fef3f2;
  --cp-code: #0f172a;
  --cp-shadow: 0 18px 50px rgba(16, 24, 40, .18), 0 2px 8px rgba(16, 24, 40, .08);
  --cp-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  --cp-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
  --cp-bg: #0b0f16;
  --cp-panel: #101722;
  --cp-panel-2: #0d141d;
  --cp-text: #e6eaf0;
  --cp-muted: #94a3b8;
  --cp-border: #1e293b;
  --cp-border-strong: #2b3a4f;
  --cp-accent: #818cf8;
  --cp-accent-soft: #1e1b4b;
  --cp-cyan: #22d3ee;
  --cp-success: #4ade80;
  --cp-success-soft: #052e16;
  --cp-warning: #fbbf24;
  --cp-warning-soft: #2a1a02;
  --cp-danger: #f87171;
  --cp-danger-soft: #2a0b0b;
  --cp-code: #050810;
  --cp-shadow: 0 24px 60px rgba(0, 0, 0, .55), 0 2px 10px rgba(0, 0, 0, .4);
}
.cp-shell * { box-sizing: border-box; }
.cp-fab {
  pointer-events: auto;
  position: fixed;
  right: 22px;
  bottom: 22px;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--cp-accent) 55%, transparent);
  background: linear-gradient(145deg, var(--cp-accent), color-mix(in srgb, var(--cp-accent) 55%, #000));
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(79, 70, 229, .35);
  transition: transform .15s ease, box-shadow .15s ease;
}
.cp-fab:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(79, 70, 229, .45); }
.cp-fab:focus-visible { outline: 2px solid var(--cp-cyan); outline-offset: 3px; }
.cp-fab svg { width: 24px; height: 24px; }
.cp-drawer {
  pointer-events: auto;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 440px;
  max-width: 100vw;
  background: var(--cp-panel);
  border-left: 1px solid var(--cp-border);
  box-shadow: var(--cp-shadow);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform .22s cubic-bezier(.2, .8, .2, 1);
}
.cp-drawer.cp-open { transform: translateX(0); }
.cp-resize {
  position: absolute;
  left: -3px;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  background: transparent;
}
.cp-resize:hover { background: color-mix(in srgb, var(--cp-accent) 35%, transparent); }
.cp-head {
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--cp-border);
  background: linear-gradient(180deg, var(--cp-panel-2), var(--cp-panel));
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cp-head-row { display: flex; align-items: center; gap: 7px; }
.cp-logo {
  width: 30px; height: 30px; border-radius: 9px;
  background: var(--cp-accent-soft); color: var(--cp-accent);
  display: grid; place-items: center; flex: 0 0 auto;
}
.cp-logo svg { width: 18px; height: 18px; }
.cp-title { font-weight: 650; font-size: 14px; letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cp-sub { color: var(--cp-muted); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cp-grow { flex: 1; }
.cp-iconbtn {
  border: 1px solid transparent; background: transparent; color: var(--cp-muted);
  width: 28px; height: 28px; border-radius: 7px; cursor: pointer;
  display: grid; place-items: center; flex: 0 0 auto;
}
.cp-iconbtn:hover { background: var(--cp-panel-2); border-color: var(--cp-border); color: var(--cp-text); }
.cp-iconbtn:focus-visible { outline: 2px solid var(--cp-accent); outline-offset: 1px; }
.cp-iconbtn svg { width: 15px; height: 15px; }
.cp-convbar { display: flex; gap: 6px; align-items: center; }
.cp-select {
  flex: 1; min-width: 0; background: var(--cp-panel); color: var(--cp-text);
  border: 1px solid var(--cp-border); border-radius: 8px; padding: 5px 8px;
  font-size: 12px; font-family: var(--cp-sans); height: 30px;
}
.cp-model {
  font-family: var(--cp-mono); font-size: 10px; color: var(--cp-muted);
  border: 1px solid var(--cp-border); border-radius: 6px; padding: 3px 6px;
  background: var(--cp-panel-2); max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  cursor: pointer;
}
.cp-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.cp-chip {
  display: inline-flex; align-items: center; gap: 5px; max-width: 100%;
  border: 1px solid var(--cp-border); background: var(--cp-panel-2);
  border-radius: 999px; padding: 2px 8px; font-size: 10.5px; color: var(--cp-muted);
  font-family: var(--cp-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.cp-chip b { color: var(--cp-text); font-weight: 600; }
.cp-chip.cp-fail { border-color: color-mix(in srgb, var(--cp-danger) 40%, var(--cp-border)); color: var(--cp-danger); }
.cp-chip.cp-ok { border-color: color-mix(in srgb, var(--cp-success) 40%, var(--cp-border)); color: var(--cp-success); }
.cp-thread {
  flex: 1; overflow-y: auto; overflow-x: hidden; padding: 14px 14px 8px;
  display: flex; flex-direction: column; gap: 12px;
  scrollbar-width: thin; scrollbar-color: var(--cp-border-strong) transparent;
}
.cp-thread::-webkit-scrollbar { width: 8px; }
.cp-thread::-webkit-scrollbar-thumb { background: var(--cp-border-strong); border-radius: 8px; }
.cp-empty {
  margin: auto; text-align: left; max-width: 330px; padding: 24px 6px;
  display: flex; flex-direction: column; gap: 10px;
}
.cp-empty h3 { margin: 0; font-size: 15px; font-weight: 650; letter-spacing: -.01em; }
.cp-empty p { margin: 0; color: var(--cp-muted); font-size: 12px; }
.cp-empty-session { color: var(--cp-muted); font-size: 11px; font-family: var(--cp-mono); }
.cp-head-text { min-width: 0; overflow: hidden; }
.cp-quick { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.cp-quick button {
  text-align: left; border: 1px solid var(--cp-border); background: var(--cp-panel-2);
  color: var(--cp-text); border-radius: 8px; padding: 8px 10px; font-size: 12px; cursor: pointer;
}
.cp-quick button:hover { border-color: var(--cp-accent); color: var(--cp-accent); }
.cp-msg { display: flex; flex-direction: column; gap: 5px; }
.cp-msg-head { display: flex; align-items: center; gap: 6px; font-size: 10.5px; color: var(--cp-muted); text-transform: uppercase; letter-spacing: .06em; }
.cp-msg-head .cp-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--cp-accent); }
.cp-msg.cp-user .cp-msg-head .cp-dot { background: var(--cp-cyan); }
.cp-msg-body {
  border: 1px solid var(--cp-border); border-radius: 10px; padding: 9px 11px;
  background: var(--cp-panel); overflow-wrap: anywhere;
}
.cp-msg.cp-user .cp-msg-body { background: var(--cp-panel-2); }
.cp-msg-body > :first-child { margin-top: 0; }
.cp-msg-body > :last-child { margin-bottom: 0; }
.cp-msg-body p { margin: 0 0 8px; }
.cp-msg-body h1, .cp-msg-body h2, .cp-msg-body h3, .cp-msg-body h4 {
  margin: 12px 0 6px; font-size: 13px; font-weight: 650;
}
.cp-msg-body ul, .cp-msg-body ol { margin: 4px 0 8px; padding-left: 18px; }
.cp-msg-body li { margin: 2px 0; }
.cp-msg-body code {
  font-family: var(--cp-mono); font-size: 11.5px; background: var(--cp-panel-2);
  border: 1px solid var(--cp-border); border-radius: 4px; padding: 0 4px;
}
.cp-msg-body a { color: var(--cp-accent); text-decoration: underline; text-underline-offset: 2px; }
.cp-msg-body blockquote {
  margin: 6px 0; padding: 4px 10px; border-left: 3px solid var(--cp-accent);
  background: var(--cp-accent-soft); color: var(--cp-text); border-radius: 0 6px 6px 0;
}
.cp-msg-body table { border-collapse: collapse; width: 100%; margin: 6px 0; font-size: 11.5px; }
.cp-msg-body th, .cp-msg-body td { border: 1px solid var(--cp-border); padding: 4px 6px; text-align: left; }
.cp-msg-body th { background: var(--cp-panel-2); }
.cp-code {
  margin: 8px 0; border: 1px solid var(--cp-border); border-radius: 8px; overflow: hidden;
  background: var(--cp-code);
}
.cp-code-head {
  display: flex; align-items: center; gap: 8px; padding: 5px 8px;
  background: rgba(255,255,255,.04); border-bottom: 1px solid rgba(255,255,255,.08);
  color: #9aa7b8; font-size: 10px; font-family: var(--cp-mono);
}
.cp-code-head .cp-grow { flex: 1; }
.cp-copy {
  border: 0; background: transparent; color: #9aa7b8; cursor: pointer; font-size: 10px;
  font-family: var(--cp-mono); padding: 2px 5px; border-radius: 4px;
}
.cp-copy:hover { color: #fff; background: rgba(255,255,255,.08); }
.cp-code pre {
  margin: 0; padding: 9px 10px; overflow-x: auto; color: #e6edf7;
  font-family: var(--cp-mono); font-size: 11.5px; line-height: 1.55;
}
.cp-code pre code { background: transparent; border: 0; padding: 0; color: inherit; font-size: inherit; }
.cp-cursor { display: inline-block; width: 7px; height: 13px; background: var(--cp-accent); vertical-align: -2px; animation: cp-blink 1s steps(2) infinite; }
@keyframes cp-blink { 50% { opacity: 0; } }
.cp-tool {
  border: 1px solid var(--cp-border); border-left: 3px solid var(--cp-accent);
  border-radius: 8px; background: var(--cp-panel-2); overflow: hidden;
}
.cp-tool.cp-failed { border-left-color: var(--cp-danger); }
.cp-tool.cp-done { border-left-color: var(--cp-success); }
.cp-tool-head {
  display: flex; align-items: center; gap: 8px; padding: 7px 9px; cursor: pointer;
}
.cp-tool-name { font-family: var(--cp-mono); font-size: 11px; font-weight: 600; }
.cp-tool-target { color: var(--cp-muted); font-family: var(--cp-mono); font-size: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 190px; }
.cp-status {
  margin-left: auto; font-size: 9.5px; font-family: var(--cp-mono); text-transform: uppercase;
  letter-spacing: .05em; padding: 2px 6px; border-radius: 999px; border: 1px solid var(--cp-border);
  color: var(--cp-muted); white-space: nowrap;
}
.cp-status.cp-running { color: var(--cp-warning); background: var(--cp-warning-soft); border-color: color-mix(in srgb, var(--cp-warning) 30%, transparent); }
.cp-status.cp-succeeded { color: var(--cp-success); background: var(--cp-success-soft); border-color: color-mix(in srgb, var(--cp-success) 30%, transparent); }
.cp-status.cp-failed { color: var(--cp-danger); background: var(--cp-danger-soft); border-color: color-mix(in srgb, var(--cp-danger) 30%, transparent); }
.cp-spin { width: 11px; height: 11px; border: 2px solid var(--cp-border); border-top-color: var(--cp-warning); border-radius: 50%; animation: cp-spin .8s linear infinite; }
@keyframes cp-spin { to { transform: rotate(360deg); } }
.cp-tool-body { border-top: 1px solid var(--cp-border); padding: 8px 9px; display: flex; flex-direction: column; gap: 6px; }
.cp-label { font-size: 9.5px; text-transform: uppercase; letter-spacing: .06em; color: var(--cp-muted); }
.cp-pre {
  margin: 0; padding: 7px 8px; background: var(--cp-code); color: #dbe4f0; border-radius: 6px;
  font-family: var(--cp-mono); font-size: 10.5px; line-height: 1.5; max-height: 220px; overflow: auto;
  white-space: pre-wrap; overflow-wrap: anywhere;
}
.cp-approval {
  border: 1px solid color-mix(in srgb, var(--cp-warning) 45%, var(--cp-border));
  border-radius: 10px; background: var(--cp-panel); overflow: hidden;
  box-shadow: 0 4px 14px rgba(0,0,0,.06);
}
.cp-approval.cp-risk3 { border-color: color-mix(in srgb, var(--cp-danger) 55%, var(--cp-border)); }
.cp-approval-head { padding: 9px 10px; background: var(--cp-warning-soft); display: flex; align-items: center; gap: 8px; }
.cp-approval.cp-risk3 .cp-approval-head { background: var(--cp-danger-soft); }
.cp-approval-title { font-weight: 650; font-size: 12px; }
.cp-risk { margin-left: auto; font-size: 9px; text-transform: uppercase; letter-spacing: .06em; font-family: var(--cp-mono); padding: 2px 7px; border-radius: 999px; border: 1px solid currentColor; }
.cp-risk.cp-r2 { color: var(--cp-warning); }
.cp-risk.cp-r3 { color: var(--cp-danger); }
.cp-approval-body { padding: 9px 10px; display: flex; flex-direction: column; gap: 8px; }
.cp-kv { display: grid; grid-template-columns: 74px 1fr; gap: 4px 8px; font-size: 11.5px; }
.cp-kv dt { color: var(--cp-muted); }
.cp-kv dd { margin: 0; font-family: var(--cp-mono); font-size: 11px; overflow-wrap: anywhere; }
.cp-actions { display: flex; gap: 6px; align-items: center; }
.cp-input {
  flex: 1; min-width: 0; background: var(--cp-panel-2); border: 1px solid var(--cp-border);
  border-radius: 7px; padding: 6px 8px; color: var(--cp-text); font-size: 11.5px; font-family: var(--cp-sans);
}
.cp-input:focus { outline: 2px solid var(--cp-accent); outline-offset: 1px; }
.cp-btn {
  border: 1px solid var(--cp-border-strong); background: var(--cp-panel); color: var(--cp-text);
  border-radius: 7px; padding: 6px 10px; font-size: 11.5px; font-weight: 600; cursor: pointer;
  font-family: var(--cp-sans); white-space: nowrap;
}
.cp-btn:hover { border-color: var(--cp-accent); color: var(--cp-accent); }
.cp-btn.cp-primary { background: var(--cp-accent); border-color: var(--cp-accent); color: #fff; }
.cp-btn.cp-primary:hover { filter: brightness(1.08); color: #fff; }
.cp-btn.cp-danger { color: var(--cp-danger); border-color: color-mix(in srgb, var(--cp-danger) 45%, var(--cp-border)); }
.cp-btn:disabled { opacity: .5; cursor: not-allowed; }
.cp-diff { border: 1px solid var(--cp-border); border-radius: 8px; overflow: hidden; background: var(--cp-code); }
.cp-diff-head { display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: rgba(255,255,255,.04); color: #9aa7b8; font-size: 10px; font-family: var(--cp-mono); }
.cp-diff pre { margin: 0; padding: 6px 0; overflow: auto; max-height: 300px; font-family: var(--cp-mono); font-size: 10.5px; line-height: 1.5; color: #cbd5e1; }
.cp-diff .cp-line { display: block; padding: 0 8px; white-space: pre; }
.cp-diff .cp-add { background: rgba(34,197,94,.12); color: #86efac; }
.cp-diff .cp-del { background: rgba(239,68,68,.12); color: #fca5a5; }
.cp-diff .cp-hunk { color: #93c5fd; background: rgba(59,130,246,.08); }
.cp-validation { display: flex; gap: 6px; align-items: center; font-size: 11px; }
.cp-validation.cp-ok { color: var(--cp-success); }
.cp-validation.cp-bad { color: var(--cp-danger); }
.cp-errline { border: 1px solid color-mix(in srgb, var(--cp-danger) 40%, var(--cp-border)); background: var(--cp-danger-soft); color: var(--cp-danger); border-radius: 8px; padding: 7px 9px; font-size: 11.5px; }
.cp-banner { padding: 6px 12px; background: var(--cp-warning-soft); color: var(--cp-warning); font-size: 11px; border-bottom: 1px solid var(--cp-border); }
.cp-composer { border-top: 1px solid var(--cp-border); padding: 10px 12px 12px; background: var(--cp-panel); display: flex; flex-direction: column; gap: 7px; }
.cp-composer-row { display: flex; gap: 8px; align-items: flex-end; }
.cp-textarea {
  flex: 1; resize: none; min-height: 38px; max-height: 160px; padding: 9px 10px;
  border: 1px solid var(--cp-border-strong); border-radius: 9px; background: var(--cp-panel-2);
  color: var(--cp-text); font-family: var(--cp-sans); font-size: 12.5px; line-height: 1.45;
}
.cp-textarea:focus { outline: 2px solid var(--cp-accent); outline-offset: 1px; border-color: var(--cp-accent); }
.cp-textarea::placeholder { color: var(--cp-muted); }
.cp-send {
  width: 36px; height: 36px; border-radius: 9px; border: 1px solid var(--cp-accent);
  background: var(--cp-accent); color: #fff; display: grid; place-items: center; cursor: pointer;
}
.cp-send:disabled { opacity: .45; cursor: not-allowed; }
.cp-send svg { width: 16px; height: 16px; }
.cp-hint { display: flex; gap: 8px; align-items: center; color: var(--cp-muted); font-size: 10px; }
.cp-hint kbd {
  font-family: var(--cp-mono); font-size: 9.5px; border: 1px solid var(--cp-border);
  border-bottom-width: 2px; border-radius: 4px; padding: 0 3px; background: var(--cp-panel-2);
}

.cp-setup {
  display: flex; flex-direction: column; gap: 12px; padding: 8px 4px 20px;
}
.cp-setup h3 { margin: 0; font-size: 15px; font-weight: 650; letter-spacing: -.01em; }
.cp-setup p { margin: 0; color: var(--cp-muted); font-size: 12px; line-height: 1.55; }
.cp-provider-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.cp-provider {
  border: 1px solid var(--cp-border); background: var(--cp-panel-2); border-radius: 9px;
  padding: 8px; cursor: pointer; text-align: left; display: flex; flex-direction: column; gap: 4px;
  color: var(--cp-text); font-family: var(--cp-sans);
}
.cp-provider:hover { border-color: var(--cp-accent); }
.cp-provider-active { border-color: var(--cp-accent); background: var(--cp-accent-soft); }
.cp-provider-name { font-weight: 650; font-size: 12px; }
.cp-provider-state { font-size: 9.5px; color: var(--cp-muted); font-family: var(--cp-mono); text-transform: uppercase; letter-spacing: .04em; }
.cp-provider-state.cp-configured { color: var(--cp-success); }
.cp-field { display: flex; flex-direction: column; gap: 5px; }
.cp-field > span { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: var(--cp-muted); }
.cp-field input, .cp-field select {
  width: 100%; height: 34px; border: 1px solid var(--cp-border-strong); border-radius: 8px;
  background: var(--cp-panel-2); color: var(--cp-text); padding: 0 9px; font-size: 12px;
  font-family: var(--cp-sans);
}
.cp-field input:focus, .cp-field select:focus { outline: 2px solid var(--cp-accent); outline-offset: 1px; }
.cp-field-hint { font-size: 10px; color: var(--cp-muted); font-family: var(--cp-mono); }
.cp-setup-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cp-setup-note { color: var(--cp-muted); font-size: 11px; font-family: var(--cp-mono); }
.cp-thumbs { display: flex; gap: 6px; flex-wrap: wrap; }
.cp-thumb {
  position: relative; width: 54px; height: 54px; border-radius: 8px; overflow: hidden;
  border: 1px solid var(--cp-border); background: var(--cp-panel-2); display: inline-flex;
}
.cp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cp-thumb button {
  position: absolute; top: 2px; right: 2px; width: 17px; height: 17px; border-radius: 50%;
  border: 1px solid rgba(0,0,0,.15); background: rgba(15,23,42,.75); color: #fff;
  font-size: 11px; line-height: 1; cursor: pointer; display: grid; place-items: center;
}
.cp-modelbar {
  display: flex; align-items: center; gap: 5px; padding: 0 0 2px;
}
.cp-mini-select {
  max-width: 150px; height: 26px; border: 1px solid var(--cp-border); border-radius: 6px;
  background: var(--cp-panel-2); color: var(--cp-text); font-size: 10.5px;
  font-family: var(--cp-mono); padding: 0 5px;
}
.cp-model-select { max-width: 190px; }
.cp-mini-select:focus { outline: 2px solid var(--cp-accent); outline-offset: 1px; }


.cp-composer {
  border-top: 1px solid var(--cp-border);
  padding: 10px 12px 12px;
  background: var(--cp-panel);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cp-composer-box {
  border: 1px solid var(--cp-border-strong);
  border-radius: 12px;
  background: var(--cp-panel-2);
  padding: 8px 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.cp-composer-box:focus-within {
  border-color: color-mix(in srgb, var(--cp-accent) 60%, var(--cp-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--cp-accent) 12%, transparent);
}
.cp-composer-box .cp-textarea {
  border: 0;
  background: transparent;
  padding: 4px 5px;
  min-height: 32px;
  max-height: 160px;
  border-radius: 0;
  font-size: 13px;
}
.cp-composer-box .cp-textarea:focus { outline: none; border: 0; }
.cp-composer-bar { display: flex; align-items: center; gap: 2px; min-width: 0; }
.cp-bar-left { display: flex; align-items: center; gap: 1px; }
.cp-bar-right { display: flex; align-items: center; gap: 1px; margin-left: auto; min-width: 0; }
.cp-bar-btn {
  width: 28px; height: 28px; padding: 0; border: 1px solid transparent; background: transparent;
  color: var(--cp-muted); border-radius: 7px; display: grid; place-items: center; cursor: pointer;
}
.cp-bar-btn:hover { background: var(--cp-panel); border-color: var(--cp-border); color: var(--cp-text); }
.cp-bar-btn svg { width: 15px; height: 15px; }
.cp-shield {
  width: 28px; height: 28px; display: grid; place-items: center;
  color: var(--cp-success); opacity: .9; cursor: default;
}
.cp-shield svg { width: 15px; height: 15px; }
.cp-pill {
  display: inline-flex; align-items: center; gap: 4px; height: 28px;
  padding: 0 5px 0 7px; border-radius: 7px; border: 1px solid transparent;
  color: var(--cp-muted); min-width: 0;
}
.cp-pill:hover { background: var(--cp-panel); border-color: var(--cp-border); color: var(--cp-text); }
.cp-pill-icon { width: 13px; height: 13px; flex: 0 0 auto; }
.cp-pill-chevron { width: 10px; height: 10px; opacity: .55; flex: 0 0 auto; }
.cp-pill-native {
  appearance: none; -webkit-appearance: none; border: 0; background: transparent;
  color: inherit; font-family: var(--cp-mono); font-size: 10.5px; padding: 0;
  max-width: 118px; cursor: pointer; text-overflow: ellipsis;
}
.cp-pill-native:focus { outline: none; }
.cp-pill-model .cp-pill-native { max-width: 175px; }
.cp-pill-input {
  border: 0; background: transparent; color: inherit; font-family: var(--cp-mono);
  font-size: 10.5px; padding: 0; width: 116px;
}
.cp-pill-input:focus { outline: none; }
.cp-thinking-native { max-width: 64px; }
.cp-composer .cp-send {
  width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--cp-accent);
  background: var(--cp-accent); color: #fff; display: grid; place-items: center;
  cursor: pointer; padding: 0; margin-left: 2px;
}
.cp-composer .cp-send svg { width: 15px; height: 15px; }
.cp-composer .cp-send:disabled { opacity: .4; cursor: not-allowed; }
.cp-thumb button svg { width: 9px; height: 9px; }
.cp-approval-head > svg { width: 13px; height: 13px; color: var(--cp-warning); flex: 0 0 auto; }
.cp-validation svg { width: 13px; height: 13px; flex: 0 0 auto; }

/* Portal + custom menus */
.cp-portal-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2147483001;
}
.cp-menu {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: var(--cp-panel);
  color: var(--cp-text);
  border: 1px solid var(--cp-border-strong);
  border-radius: 11px;
  box-shadow: var(--cp-shadow);
  padding: 5px;
  font-family: var(--cp-sans);
  font-size: 12px;
}
.cp-menu-search {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 2px 6px;
  border-bottom: 1px solid var(--cp-border);
  margin-bottom: 4px;
}
.cp-menu-search input {
  flex: 1;
  min-width: 0;
  height: 30px;
  border: 1px solid var(--cp-border);
  border-radius: 7px;
  background: var(--cp-panel-2);
  color: var(--cp-text);
  padding: 0 8px;
  font-size: 12px;
  font-family: var(--cp-sans);
}
.cp-menu-search input:focus { outline: 2px solid var(--cp-accent); outline-offset: 0; border-color: var(--cp-accent); }
.cp-menu-refresh {
  width: 28px; height: 28px; border: 1px solid transparent; background: transparent;
  color: var(--cp-muted); border-radius: 7px; display: grid; place-items: center; cursor: pointer;
}
.cp-menu-refresh:hover { background: var(--cp-panel-2); border-color: var(--cp-border); color: var(--cp-text); }
.cp-menu-refresh svg { width: 13px; height: 13px; }
.cp-menu-scroll { overflow-y: auto; min-height: 0; scrollbar-width: thin; }
.cp-menu-scroll::-webkit-scrollbar { width: 7px; }
.cp-menu-scroll::-webkit-scrollbar-thumb { background: var(--cp-border-strong); border-radius: 7px; }
.cp-menu-label {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 7px 4px; font-size: 9.5px; font-weight: 650;
  text-transform: uppercase; letter-spacing: .07em; color: var(--cp-muted);
}
.cp-menu-label-meta { margin-left: auto; font-weight: 500; text-transform: none; letter-spacing: 0; font-family: var(--cp-mono); font-size: 9.5px; }
.cp-menu-group + .cp-menu-group { border-top: 1px solid var(--cp-border); margin-top: 3px; }
.cp-menu-empty { padding: 8px 8px 10px; color: var(--cp-muted); font-size: 11px; }
.cp-menu-error { color: var(--cp-danger); overflow-wrap: anywhere; }
.cp-menu-item {
  display: flex; align-items: center; gap: 8px; width: 100%;
  border: 0; background: transparent; color: var(--cp-text);
  padding: 7px 8px; border-radius: 7px; cursor: pointer; text-align: left;
  font-family: var(--cp-sans); font-size: 12px;
}
.cp-menu-item:hover, .cp-menu-item-active { background: var(--cp-panel-2); }
.cp-menu-item-selected { background: var(--cp-accent-soft); }
.cp-menu-item-selected:hover, .cp-menu-item-selected.cp-menu-item-active { background: var(--cp-accent-soft); }
.cp-menu-item-icon { width: 14px; height: 14px; color: var(--cp-muted); flex: 0 0 auto; }
.cp-menu-item-selected .cp-menu-item-icon { color: var(--cp-accent); }
.cp-menu-item-main { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
.cp-menu-item-title { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-menu-item-meta { color: var(--cp-muted); font-size: 10px; font-family: var(--cp-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-menu-check { width: 13px; height: 13px; color: var(--cp-accent); flex: 0 0 auto; }

/* Composer pills (buttons) */
.cp-pill {
  display: inline-flex; align-items: center; gap: 4px; height: 28px;
  padding: 0 5px 0 7px; border-radius: 7px; border: 1px solid transparent;
  background: transparent; color: var(--cp-muted); min-width: 0; cursor: pointer;
  font-family: var(--cp-sans);
}
.cp-pill:hover { background: var(--cp-panel); border-color: var(--cp-border); color: var(--cp-text); }
.cp-pill-active { background: var(--cp-panel); border-color: var(--cp-border); color: var(--cp-text); }
.cp-pill-value { font-family: var(--cp-mono); font-size: 10.5px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-pill-muted { color: var(--cp-muted); }
.cp-pill svg.cp-pill-icon { width: 13px; height: 13px; flex: 0 0 auto; }

/* Session manager */
.cp-sessions { display: flex; flex-direction: column; min-height: 0; flex: 1; background: var(--cp-panel); }
.cp-sessions-head { padding: 12px 12px 10px; border-bottom: 1px solid var(--cp-border); display: flex; flex-direction: column; gap: 8px; background: linear-gradient(180deg, var(--cp-panel-2), var(--cp-panel)); }
.cp-sessions-title-row { display: flex; align-items: center; gap: 7px; }
.cp-sessions-title { font-weight: 650; font-size: 14px; letter-spacing: -.01em; }
.cp-sessions-count { font-family: var(--cp-mono); font-size: 10px; color: var(--cp-muted); border: 1px solid var(--cp-border); border-radius: 999px; padding: 0 6px; }
.cp-back-chevron { transform: rotate(90deg); }
.cp-session-search {
  width: 100%; height: 32px; border: 1px solid var(--cp-border); border-radius: 8px;
  background: var(--cp-panel-2); color: var(--cp-text); padding: 0 9px; font-size: 12px;
  font-family: var(--cp-sans);
}
.cp-session-search:focus { outline: 2px solid var(--cp-accent); outline-offset: 1px; border-color: var(--cp-accent); }
.cp-sessions-scroll { flex: 1; overflow-y: auto; padding: 8px 8px 18px; scrollbar-width: thin; }
.cp-sessions-scroll::-webkit-scrollbar { width: 8px; }
.cp-sessions-scroll::-webkit-scrollbar-thumb { background: var(--cp-border-strong); border-radius: 8px; }
.cp-session-empty { padding: 24px 12px; text-align: center; color: var(--cp-muted); font-size: 12px; }
.cp-session-group { margin-bottom: 6px; }
.cp-session-group-head { display: flex; align-items: center; gap: 2px; padding: 2px 2px 2px 0; border-radius: 8px; }
.cp-session-group-head:hover { background: var(--cp-panel-2); }
.cp-session-group-toggle {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px;
  border: 0; background: transparent; color: var(--cp-text); cursor: pointer;
  padding: 6px 6px; border-radius: 7px; font-family: var(--cp-sans); font-size: 12px; text-align: left;
}
.cp-session-chevron { width: 12px; height: 12px; color: var(--cp-muted); transition: transform .15s ease; flex: 0 0 auto; }
.cp-session-chevron.cp-collapsed { transform: rotate(-90deg); }
.cp-session-folder { width: 14px; height: 14px; color: var(--cp-accent); flex: 0 0 auto; }
.cp-session-pipeline { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-session-group-count { margin-left: auto; font-family: var(--cp-mono); font-size: 9.5px; color: var(--cp-muted); border: 1px solid var(--cp-border); border-radius: 999px; padding: 0 5px; }
.cp-session-new {
  width: 24px; height: 24px; border: 1px solid transparent; background: transparent; color: var(--cp-muted);
  border-radius: 6px; display: grid; place-items: center; cursor: pointer; margin-right: 4px;
}
.cp-session-new:hover { background: var(--cp-panel); border-color: var(--cp-border); color: var(--cp-text); }
.cp-session-new svg { width: 13px; height: 13px; }
.cp-session-rows { display: flex; flex-direction: column; gap: 1px; padding: 1px 0 4px 14px; }
.cp-session-row {
  display: flex; align-items: center; gap: 2px; border-radius: 8px; border: 1px solid transparent;
}
.cp-session-row:hover { background: var(--cp-panel-2); }
.cp-session-row-active { background: var(--cp-accent-soft); border-color: color-mix(in srgb, var(--cp-accent) 22%, transparent); }
.cp-session-row-main {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px;
  border: 0; background: transparent; color: inherit; text-align: left;
  padding: 7px 6px; cursor: pointer; font-family: var(--cp-sans); border-radius: 7px;
}
.cp-session-status { width: 7px; height: 7px; border-radius: 50%; background: var(--cp-border-strong); flex: 0 0 auto; }
.cp-status-awaiting_approval { background: var(--cp-warning); box-shadow: 0 0 0 3px color-mix(in srgb, var(--cp-warning) 18%, transparent); }
.cp-status-error { background: var(--cp-danger); }
.cp-status-idle { background: var(--cp-success); opacity: .65; }
.cp-session-row-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
.cp-session-name { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-session-meta { color: var(--cp-muted); font-size: 10px; font-family: var(--cp-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-session-rename {
  flex: 1; min-width: 0; height: 25px; border: 1px solid var(--cp-accent); border-radius: 6px;
  background: var(--cp-panel); color: var(--cp-text); padding: 0 6px; font-size: 12px; font-family: var(--cp-sans);
}
.cp-session-rename:focus { outline: 2px solid var(--cp-accent); outline-offset: 0; }
.cp-session-actions { display: none; align-items: center; gap: 1px; padding-right: 4px; }
.cp-session-row:hover .cp-session-actions, .cp-session-row-active .cp-session-actions { display: flex; }
.cp-session-action {
  width: 23px; height: 23px; border: 1px solid transparent; background: transparent;
  color: var(--cp-muted); border-radius: 6px; display: grid; place-items: center; cursor: pointer;
}
.cp-session-action:hover { background: var(--cp-panel); border-color: var(--cp-border); color: var(--cp-text); }
.cp-session-action svg { width: 12px; height: 12px; }
@media (hover: none) {
  .cp-session-actions { display: flex; }
}

/* Settings */
.cp-settings { display: flex; flex-direction: column; min-height: 0; flex: 1; background: var(--cp-panel); }
.cp-settings-head { display: flex; align-items: center; gap: 7px; padding: 12px 12px 10px; border-bottom: 1px solid var(--cp-border); background: linear-gradient(180deg, var(--cp-panel-2), var(--cp-panel)); }
.cp-settings-back { font-size: 16px; line-height: 1; }
.cp-settings-title { font-weight: 650; font-size: 14px; letter-spacing: -.01em; }
.cp-settings-tabs { display: flex; gap: 2px; padding: 7px 10px 0; border-bottom: 1px solid var(--cp-border); background: var(--cp-panel); }
.cp-settings-tab {
  border: 0; background: transparent; color: var(--cp-muted); cursor: pointer;
  padding: 7px 9px; font-size: 11.5px; font-weight: 600; font-family: var(--cp-sans);
  border-bottom: 2px solid transparent; margin-bottom: -1px;
}
.cp-settings-tab:hover { color: var(--cp-text); }
.cp-settings-tab-active { color: var(--cp-accent); border-bottom-color: var(--cp-accent); }
.cp-settings-scroll { flex: 1; overflow-y: auto; padding: 12px 12px 24px; scrollbar-width: thin; }
.cp-settings-scroll::-webkit-scrollbar { width: 8px; }
.cp-settings-scroll::-webkit-scrollbar-thumb { background: var(--cp-border-strong); border-radius: 8px; }
.cp-settings-section { display: flex; flex-direction: column; gap: 10px; }
.cp-settings-section h3 { margin: 0; font-size: 14px; font-weight: 650; }
.cp-settings-section p { margin: 3px 0 0; color: var(--cp-muted); font-size: 11.5px; line-height: 1.5; }
.cp-settings-section-head { display: flex; align-items: flex-start; gap: 8px; justify-content: space-between; }
.cp-settings-note { color: var(--cp-muted); font-size: 11px; line-height: 1.55; padding: 8px 10px; border: 1px dashed var(--cp-border); border-radius: 8px; }
.cp-settings-card {
  display: flex; align-items: center; gap: 9px; padding: 9px 10px;
  border: 1px solid var(--cp-border); border-radius: 10px; background: var(--cp-panel-2);
}
.cp-settings-card-icon {
  width: 28px; height: 28px; border-radius: 8px; background: var(--cp-accent-soft);
  color: var(--cp-accent); display: grid; place-items: center; flex: 0 0 auto;
}
.cp-settings-card-icon svg { width: 15px; height: 15px; }
.cp-settings-card-main { min-width: 0; flex: 1; }
.cp-settings-card-title { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; }
.cp-settings-card-meta { color: var(--cp-muted); font-size: 10.5px; font-family: var(--cp-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp-settings-card-actions { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; justify-content: flex-end; }
.cp-settings-badge {
  display: inline-flex; align-items: center; gap: 3px; font-size: 9px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .05em; color: var(--cp-success);
  border: 1px solid color-mix(in srgb, var(--cp-success) 35%, transparent);
  background: var(--cp-success-soft); border-radius: 999px; padding: 1px 6px;
}
.cp-settings-badge svg { width: 10px; height: 10px; }
.cp-settings-form { border: 1px solid var(--cp-border); border-radius: 10px; padding: 10px; display: flex; flex-direction: column; gap: 9px; background: var(--cp-panel-2); }
.cp-settings-form-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12.5px; }
.cp-settings-form .cp-provider-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.cp-settings-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.cp-settings-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--cp-border); }
.cp-settings-row > span { font-size: 12px; font-weight: 500; }
.cp-settings .cp-pill { border-color: var(--cp-border); background: var(--cp-panel-2); }
.cp-settings .cp-field input { background: var(--cp-panel); }
.cp-settings .cp-menu { z-index: 2147483002; }

/* Broken pipeline alert */
.cp-alert {
  border: 1px solid color-mix(in srgb, var(--cp-danger) 38%, var(--cp-border));
  background: var(--cp-danger-soft); border-radius: 11px; padding: 10px 11px;
  display: flex; flex-direction: column; gap: 7px;
}
.cp-alert-title { display: flex; align-items: center; gap: 6px; color: var(--cp-danger); font-weight: 650; font-size: 12px; }
.cp-alert-title svg { width: 14px; height: 14px; }
.cp-alert p { margin: 0; color: var(--cp-text); font-size: 11.5px; line-height: 1.5; }
.cp-alert-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.cp-fab-alert {
  animation: cp-fab-pulse 1.9s ease-in-out infinite;
  border-color: color-mix(in srgb, var(--cp-danger) 70%, transparent);
  background: linear-gradient(145deg, var(--cp-danger), #7f1d1d);
  box-shadow: 0 10px 26px rgba(220, 38, 38, .45);
}
.cp-logo-alert { color: var(--cp-danger); background: var(--cp-danger-soft); animation: cp-logo-pulse 1.9s ease-in-out infinite; }
@keyframes cp-fab-pulse {
  0%, 100% { box-shadow: 0 10px 24px rgba(220, 38, 38, .35); }
  50% { box-shadow: 0 10px 24px rgba(220, 38, 38, .35), 0 0 0 8px rgba(220, 38, 38, .12); }
}
@keyframes cp-logo-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, .25); }
  50% { box-shadow: 0 0 0 5px rgba(220, 38, 38, .06); }
}

@media (max-width: 640px) {
  .cp-drawer { width: 100vw !important; }
  .cp-fab { right: 14px; bottom: 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .cp-drawer, .cp-fab { transition: none; }
  .cp-cursor, .cp-spin, .cp-fab-alert, .cp-logo-alert { animation: none; }
}
`;
