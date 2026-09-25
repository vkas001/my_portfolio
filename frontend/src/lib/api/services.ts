/** Feature data fetching lives in each domain module (its own store + offline
 *  seeds). Re-exported here so ContentContext's data layer stays stable. */
export { fetchProfile } from '@/modules/about/lib/services';
export { fetchSkills } from '@/modules/skills/lib/services';
export { fetchProjects } from '@/modules/projects/lib/services';
export { fetchExperience } from '@/modules/experience/lib/services';