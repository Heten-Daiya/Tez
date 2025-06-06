export const MARKDOWN_CONTENT_TYPE = 'text/markdown';
export const FILE_EXTENSION_MD = '.md';

export const FRONTMATTER_REGEX = /---\n([\s\S]*?)\n---/;
export const TITLE_REGEX = /title:\s*(.*)/;
export const CREATED_REGEX = /created:\s*(.*)/;
export const COLOR_REGEX = /color:\s*(.*)/;
export const TAGS_REGEX = /tags:\s*\[(.*)]\//;
export const TASK_LINE_REGEX = /- \[(x| )] .*/g;
export const TASK_TEXT_REGEX = /- \[(x| )] /;
export const TASKS_SECTION_REGEX = /## Tasks\n[\s\S]*/;

export const DEFAULT_NOTE_TITLE = 'Untitled';
export const DEFAULT_NOTE_COLOR = 'bg-white';

// Add default accent color constant
export const DEFAULT_ACCENT_COLOR = 'bg-indigo-600';

export const NOTE_COLORS = [
  'bg-slate-100/90 dark:bg-slate-900/80',
  'bg-gray-100/90 dark:bg-gray-900/80',
  'bg-zinc-100/90 dark:bg-zinc-900/80',
  'bg-neutral-100/90 dark:bg-neutral-900/80',
  'bg-stone-100/90 dark:bg-stone-900/80',
  'bg-red-100/90 dark:bg-red-900/70',
  'bg-orange-100/90 dark:bg-orange-900/70',
  'bg-amber-100/90 dark:bg-amber-900/70',
  'bg-yellow-100/90 dark:bg-yellow-900/70',
  'bg-lime-100/90 dark:bg-lime-900/70',
  'bg-green-100/90 dark:bg-green-900/70',
  'bg-emerald-100/90 dark:bg-emerald-900/70',
  'bg-teal-100/90 dark:bg-teal-900/70',
  'bg-cyan-100/90 dark:bg-cyan-900/70',
  'bg-sky-100/90 dark:bg-sky-900/70',
  'bg-blue-100/90 dark:bg-blue-900/70',
  'bg-indigo-100/90 dark:bg-indigo-900/70',
  'bg-violet-100/90 dark:bg-violet-900/70',
  'bg-purple-100/90 dark:bg-purple-900/70',
  'bg-fuchsia-100/90 dark:bg-fuchsia-900/70',
  'bg-pink-100/90 dark:bg-pink-900/70',
  'bg-rose-100/90 dark:bg-rose-900/70'
];

export const ACCENT_COLORS = [
  'bg-slate-600',
  'bg-gray-600',
  'bg-zinc-600',
  'bg-neutral-600',
  'bg-stone-600',
  'bg-red-600',
  'bg-orange-600',
  'bg-amber-600',
  'bg-yellow-600',
  'bg-lime-600',
  'bg-green-600',
  'bg-emerald-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-sky-600',
  'bg-blue-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-purple-600',
  'bg-fuchsia-600',
  'bg-pink-600',
  'bg-rose-600'
];

// Add color mapping for footer buttons
export const FOOTER_BUTTON_COLOR_MAP = {
  'bg-slate-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-slate-600 to-slate-800 shadow-slate-900/30' 
    : 'from-slate-400 to-slate-600 shadow-slate-900/20',
  'bg-gray-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-gray-600 to-gray-800 shadow-gray-900/30' 
    : 'from-gray-400 to-gray-600 shadow-gray-900/20',
  'bg-zinc-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-zinc-600 to-zinc-800 shadow-zinc-900/30' 
    : 'from-zinc-400 to-zinc-600 shadow-zinc-900/20',
  'bg-neutral-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-neutral-600 to-neutral-800 shadow-neutral-900/30' 
    : 'from-neutral-400 to-neutral-600 shadow-neutral-900/20',
  'bg-stone-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-stone-600 to-stone-800 shadow-stone-900/30' 
    : 'from-stone-400 to-stone-600 shadow-stone-900/20',
  'bg-red-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-red-600 to-red-800 shadow-red-900/30' 
    : 'from-red-400 to-red-600 shadow-red-900/20',
  'bg-orange-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-orange-600 to-orange-800 shadow-orange-900/30' 
    : 'from-orange-400 to-orange-600 shadow-orange-900/20',
  'bg-amber-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-amber-600 to-amber-800 shadow-amber-900/30' 
    : 'from-amber-400 to-amber-600 shadow-amber-900/20',
  'bg-yellow-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-yellow-600 to-yellow-800 shadow-yellow-900/30' 
    : 'from-yellow-400 to-yellow-600 shadow-yellow-900/20',
  'bg-lime-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-lime-600 to-lime-800 shadow-lime-900/30' 
    : 'from-lime-400 to-lime-600 shadow-lime-900/20',
  'bg-green-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-green-600 to-green-800 shadow-green-900/30' 
    : 'from-green-400 to-green-600 shadow-green-900/20',
  'bg-emerald-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-emerald-600 to-emerald-800 shadow-emerald-900/30' 
    : 'from-emerald-400 to-emerald-600 shadow-emerald-900/20',
  'bg-teal-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-teal-600 to-teal-800 shadow-teal-900/30' 
    : 'from-teal-400 to-teal-600 shadow-teal-900/20',
  'bg-cyan-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-cyan-600 to-cyan-800 shadow-cyan-900/30' 
    : 'from-cyan-400 to-cyan-600 shadow-cyan-900/20',
  'bg-sky-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-sky-600 to-sky-800 shadow-sky-900/30' 
    : 'from-sky-400 to-sky-600 shadow-sky-900/20',
  'bg-blue-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-blue-600 to-blue-800 shadow-blue-900/30' 
    : 'from-blue-400 to-blue-600 shadow-blue-900/20',
  'bg-indigo-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-indigo-600 to-indigo-800 shadow-indigo-900/30' 
    : 'from-indigo-400 to-indigo-600 shadow-indigo-900/20',
  'bg-violet-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-violet-600 to-violet-800 shadow-violet-900/30' 
    : 'from-violet-400 to-violet-600 shadow-violet-900/20',
  'bg-purple-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-purple-600 to-purple-800 shadow-purple-900/30' 
    : 'from-purple-400 to-purple-600 shadow-purple-900/20',
  'bg-fuchsia-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-fuchsia-600 to-fuchsia-800 shadow-fuchsia-900/30' 
    : 'from-fuchsia-400 to-fuchsia-600 shadow-fuchsia-900/20',
  'bg-pink-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-pink-600 to-pink-800 shadow-pink-900/30' 
    : 'from-pink-400 to-pink-600 shadow-pink-900/20',
  'bg-rose-600': (isDarkMode: boolean) => isDarkMode 
    ? 'from-rose-600 to-rose-800 shadow-rose-900/30' 
    : 'from-rose-400 to-rose-600 shadow-rose-900/20'
};

export const EMBEDDED_LINK_ICON = '🔗';
export const EMBEDDED_NOTE_PREFIX = 'Embedded: ';

export const ERROR_MESSAGES = {
  EXPORT_FAILED: 'Failed to export notes:',
  IMPORT_FAILED: 'Failed to import notes:'
};