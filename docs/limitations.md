# Limitations

These are current, real limitations.

## Jenkins

1. **Restart from stage** is not an open-source Jenkins feature. The tool catalog does not expose a fake
   version of it.
2. **Scripted pipeline validation is structural only.** Declarative Jenkinsfiles use
   pipeline-model-definition's parser. Scripted Jenkinsfiles are checked for balanced delimiters and general
   shape, never executed.
3. **Stage detection is console-derived**, based on `[Pipeline] { (Stage)` and `[Pipeline] // stage` markers.
   Parallel stages with identical names can be ambiguous.
4. **Console log retrieval is bounded** to the tail (plus optional grep) and redacted.
5. **Job config reads are redacted XML**, not a lossless copy.
6. **`copy_job` currently copies at the Jenkins root**, not into a folder.
7. **No per-job overrides.** Configuration is global to the controller.

## Agent

8. **Tools execute sequentially.** This is deliberate for deterministic infrastructure changes.
9. **Approvals resume at tool-call boundaries.** A crash in the middle of a provider request or tool
   execution marks the run as errored; there is no mid-step replay.
10. **Completed runs are replayed as text history.** Tool results are not re-injected into later turns; the
    model re-reads live Jenkins state.
11. **Thinking is best-effort for compatible gateways.** OpenAI receives `reasoning_effort`; some gateways
    may reject it. If that happens, set thinking to Off or Auto.
12. **Reasoning text is not rendered.** The UI shows a thinking phase indicator, not the model's private
    reasoning stream.

## Storage and deployment

13. **File storage is per controller.** No shared state across Jenkins controllers or HA replicas.
14. **Rate limiting is in-memory** and per controller.
15. **Conversation files are not encrypted at rest.** They rely on Jenkins home permissions.
16. **Rollback targets are a JSON file** (`recovery/deployments.json`), not a UI-managed form.
17. **Deployment execution requires a configured webhook** and a previously recorded healthy digest.
18. **A failed build alone never triggers a rollback.**

## Repository intelligence

19. **GitHub is the only provider API.** OpenRouter/opencode go are model providers, not repository hosts.
20. **Generic Git hosting is not supported** by repository tools; only GitHub URLs are accepted.
21. **File reads are bounded** (16 KB default, 40 KB maximum). Large files are never loaded whole.
22. **`AGENTS.md` is untrusted convention guidance.** It cannot change policy.

## Attachments

23. **Images only.** PNG, JPEG, and WebP; no PDFs, archives, or other files.
24. **Maximum 4 images per message**, downscaled client-side, server-validated size and magic bytes.
25. **Vision support depends on the selected model.** The provider will reject images for non-vision models;
    the UI warns only after install if the model is unknown.

## Distribution

26. **Update-center listing is not included.** The HPI installs manually; public update-center submission is
    a separate process.
