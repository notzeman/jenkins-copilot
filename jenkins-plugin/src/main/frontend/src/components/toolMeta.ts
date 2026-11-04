import type { SymbolName } from './jenkinsSymbols';

interface ToolMeta {
  icon: SymbolName;
  /** Present-tense description shown while the tool runs. */
  activity: string;
}

const RULES: Array<[RegExp, ToolMeta]> = [
  [/console|log/, { icon: 'logs', activity: 'Reading the console log' }],
  [/failed_stage|stage/, { icon: 'hammer', activity: 'Finding the failed stage' }],
  [/validate/, { icon: 'search', activity: 'Validating the pipeline' }],
  [/pipeline|jenkinsfile/, { icon: 'terminal', activity: 'Working on the pipeline' }],
  [/change|commit|compare|diff/, { icon: 'git-compare-outline', activity: 'Comparing changes' }],
  [/pull|pr_/, { icon: 'git-pull-request-outline', activity: 'Preparing the pull request' }],
  [/branch|repo|scm|github|file/, { icon: 'git-branch-outline', activity: 'Reading the repository' }],
  [/param/, { icon: 'parameters', activity: 'Reading build parameters' }],
  [/test/, { icon: 'document-text', activity: 'Reading test results' }],
  [/node|agent|executor/, { icon: 'computer', activity: 'Checking agents' }],
  [/plugin/, { icon: 'plugins', activity: 'Checking plugins' }],
  [/credential|secret/, { icon: 'key', activity: 'Checking credentials' }],
  [/user|permission|matrix/, { icon: 'people', activity: 'Checking access' }],
  [/view|dashboard/, { icon: 'view', activity: 'Working on views' }],
  [/queue/, { icon: 'jobs', activity: 'Checking the queue' }],
  [/build|job|folder/, { icon: 'jobs', activity: 'Inspecting jobs and builds' }],
  [/controller|system|version/, { icon: 'settings', activity: 'Checking the controller' }],
];

export function toolMeta(name: string): ToolMeta {
  const rule = RULES.find(([pattern]) => pattern.test(name));
  return rule ? rule[1] : { icon: 'hammer', activity: `Running ${name}` };
}
