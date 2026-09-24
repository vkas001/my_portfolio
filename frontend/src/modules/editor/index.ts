export { default as EditorScreen } from './screens/EditorScreen';

export { default as SectionEditor } from './components/SectionEditor/SectionEditor';
export { default as Field } from './components/Field/Field';
export { default as StringListInput } from './components/StringListInput/StringListInput';
export { default as SelectInput } from './components/SelectInput/SelectInput';
export { default as FloatingSaveButton } from './components/FloatingSaveButton/FloatingSaveButton';
export { default as ProfileTab } from './components/ProfileTab/ProfileTab';
export { default as SkillsTab } from './components/SkillsTab/SkillsTab';
export { default as ProjectsTab } from './components/ProjectsTab/ProjectsTab';
export { default as ExperienceTab } from './components/ExperienceTab/ExperienceTab';

export { emptyProject, emptyExperience, newId, SOCIAL_ICONS } from './lib/scaffolding';
export type { SaveBridge, SectionScaffold, BaseItem } from './lib/scaffolding';