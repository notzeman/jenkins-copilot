import { useEffect, useState } from 'react';
import {
  deleteSkill,
  getSkills,
  saveSkill,
  setSkillEnabled,
} from '../api';
import type { Skill, SkillInput } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { PencilIcon, PlusIcon, RibbonIcon, TrashIcon } from './icons';

interface SkillForm {
  id?: string;
  name: string;
  kind: string;
  description: string;
  whenToUse: string;
  tags: string;
  sourceJobs: string;
  body: string;
  enabled: boolean;
}

function emptyForm(): SkillForm {
  return {
    name: '',
    kind: 'pipeline-create',
    description: '',
    whenToUse: '',
    tags: '',
    sourceJobs: '',
    body: '',
    enabled: true,
  };
}

function editForm(skill: Skill): SkillForm {
  return {
    id: skill.id,
    name: skill.name,
    kind: skill.kind,
    description: skill.description,
    whenToUse: skill.whenToUse,
    tags: skill.tags.join(', '),
    sourceJobs: skill.sourceJobs.join(', '),
    body: skill.body,
    enabled: skill.enabled,
  };
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function SkillsPanel({
  isAdmin,
  onStartDraft,
}: {
  isAdmin: boolean;
  onStartDraft: (request: { name: string; folder: string; limit: number }) => void;
}): React.ReactElement {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SkillForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [draftName, setDraftName] = useState('Create a declarative pipeline');
  const [draftFolder, setDraftFolder] = useState('');
  const [draftLimit, setDraftLimit] = useState(25);

  const reload = async (): Promise<void> => {
    try {
      const result = await getSkills();
      setSkills(result.skills ?? []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      void reload();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const save = async (): Promise<void> => {
    if (!form) {
      return;
    }
    if (!form.name.trim() || !form.body.trim()) {
      setError('Name and body are required');
      return;
    }
    setSaving(true);
    setError(null);
    const payload: SkillInput = {
      ...(form.id ? { id: form.id } : {}),
      name: form.name.trim(),
      kind: form.kind.trim() || 'general',
      description: form.description.trim(),
      whenToUse: form.whenToUse.trim(),
      body: form.body,
      tags: splitList(form.tags),
      sourceJobs: splitList(form.sourceJobs),
      enabled: form.enabled,
    };
    try {
      const result = await saveSkill(payload);
      setSkills(result.skills ?? []);
      setForm(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the skill');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (skill: Skill): Promise<void> => {
    try {
      const result = await setSkillEnabled(skill.slug, !skill.enabled);
      setSkills(result.skills ?? []);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Could not change skill state');
    }
  };

  return (
    <section className="cp-settings-section cp-skills">
      <div className="cp-settings-section-head">
        <div>
          <h3>Skills</h3>
          <p>
            Reusable procedures the assistant loads on demand. The catalogue costs a few lines; the full
            body is fetched only when a skill matches.
          </p>
        </div>
        {isAdmin && !form && (
          <button type="button" className="cp-btn cp-primary" onClick={() => setForm(emptyForm())}>
            Add skill
          </button>
        )}
      </div>

      {!isAdmin && <div className="cp-settings-note">Only administrators can manage skills.</div>}
      {error && <div className="cp-errline">{error}</div>}

      {isAdmin && (
        <div className="cp-skill-draft">
          <div className="cp-skill-draft-head">
            <RibbonIcon />
            <strong>Draft a skill from pipelines</strong>
          </div>
          <p>
            Copilot scans pipeline structure, distils the repeated pattern, and proposes a skill for approval.
          </p>
          <div className="cp-skill-draft-fields">
            <label className="cp-field">
              <span>Skill name</span>
              <input value={draftName} onChange={(event) => setDraftName(event.target.value)} />
            </label>
            <label className="cp-field">
              <span>Folder scope (optional)</span>
              <input
                value={draftFolder}
                placeholder="All pipelines"
                onChange={(event) => setDraftFolder(event.target.value)}
              />
            </label>
            <label className="cp-field cp-skill-limit">
              <span>Limit</span>
              <input
                type="number"
                min={1}
                max={100}
                value={draftLimit}
                onChange={(event) => setDraftLimit(Number(event.target.value) || 25)}
              />
            </label>
          </div>
          <button
            type="button"
            className="cp-btn cp-primary"
            onClick={() =>
              onStartDraft({
                name: draftName.trim() || 'Create a declarative pipeline',
                folder: draftFolder.trim(),
                limit: Math.min(Math.max(draftLimit || 25, 1), 100),
              })
            }
          >
            Analyse pipelines with Copilot
          </button>
        </div>
      )}

      {form && (
        <div className="cp-settings-form cp-skill-form">
          <div className="cp-settings-form-head">
            <strong>{form.id ? 'Edit skill' : 'Add skill'}</strong>
            <button type="button" className="cp-btn" onClick={() => setForm(null)}>
              Cancel
            </button>
          </div>
          <label className="cp-field">
            <span>Name</span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="cp-field">
            <span>Kind</span>
            <input
              value={form.kind}
              placeholder="pipeline-create, failure-triage, release…"
              onChange={(event) => setForm({ ...form, kind: event.target.value })}
            />
          </label>
          <label className="cp-field">
            <span>Description</span>
            <input
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          <label className="cp-field">
            <span>When to use</span>
            <input
              value={form.whenToUse}
              onChange={(event) => setForm({ ...form, whenToUse: event.target.value })}
            />
          </label>
          <label className="cp-field">
            <span>Tags (comma separated)</span>
            <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
          </label>
          <label className="cp-field">
            <span>Source jobs (comma separated)</span>
            <input
              value={form.sourceJobs}
              onChange={(event) => setForm({ ...form, sourceJobs: event.target.value })}
            />
          </label>
          <label className="cp-field">
            <span>Body (Markdown)</span>
            <textarea
              className="cp-skill-body"
              value={form.body}
              rows={12}
              placeholder="## Procedure&#10;1. ...&#10;&#10;```groovy&#10;pipeline { ... }&#10;```"
              onChange={(event) => setForm({ ...form, body: event.target.value })}
            />
          </label>
          <label className="cp-skill-enabled">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) => setForm({ ...form, enabled: event.target.checked })}
            />
            Enabled
          </label>
          <div className="cp-settings-actions">
            <button type="button" className="cp-btn cp-primary" onClick={() => void save()} disabled={saving}>
              {saving ? 'Saving…' : 'Save skill'}
            </button>
          </div>
        </div>
      )}

      {loading && <div className="cp-settings-note">Loading skills…</div>}
      {!loading && skills.length === 0 && !form && (
        <div className="cp-settings-note">
          No skills yet. Add one manually, or let Copilot analyse your pipelines.
        </div>
      )}

      {skills.map((skill) => (
        <div className={`cp-skill-card ${skill.enabled ? '' : 'cp-skill-disabled'}`} key={skill.id}>
          <div className="cp-skill-card-main">
            <div className="cp-skill-card-title">
              <RibbonIcon />
              <span>{skill.name}</span>
              <span className="cp-skill-kind">{skill.kind}</span>
              {!skill.enabled && <span className="cp-skill-off">off</span>}
            </div>
            <div className="cp-skill-card-meta">
              {skill.description || skill.whenToUse || 'No description'}
            </div>
            {skill.tags.length > 0 && (
              <div className="cp-skill-tags">
                {skill.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
          {isAdmin && (
            <div className="cp-skill-card-actions">
              <button type="button" className="cp-btn cp-btn-sm" onClick={() => void toggle(skill)}>
                {skill.enabled ? 'Disable' : 'Enable'}
              </button>
              <button
                type="button"
                className="cp-iconbtn"
                data-tip="Edit"
                aria-label="Edit skill"
                onClick={() => setForm(editForm(skill))}
              >
                <PencilIcon />
              </button>
              <button
                type="button"
                className="cp-iconbtn"
                data-tip="Delete"
                aria-label="Delete skill"
                onClick={() => setDeleteTarget(skill)}
              >
                <TrashIcon />
              </button>
            </div>
          )}
          <details className="cp-skill-preview">
            <summary>Preview body</summary>
            <pre>{skill.body}</pre>
          </details>
        </div>
      ))}

      <div className="cp-settings-note">
        Skills are global and admin-managed. Enabled skills are offered to every assistant user; writes pause
        for approval when performed by the agent.
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete skill?"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently deleted. The assistant will stop using it immediately.`
            : ''
        }
        confirmLabel="Delete skill"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (!target) {
            return;
          }
          void deleteSkill(target.slug)
            .then((result) => setSkills(result.skills ?? []))
            .catch((deleteError) =>
              setError(deleteError instanceof Error ? deleteError.message : 'Could not delete the skill'),
            );
        }}
      />
    </section>
  );
}
