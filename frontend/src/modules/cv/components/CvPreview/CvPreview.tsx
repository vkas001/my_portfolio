import { useState } from 'react';
import { assetUrl } from '@/lib/api/assets';
import { cvInitials, displayUrl, formatCvRange, plainText, type CvData } from '@/modules/cv/lib/buildCv';

function CvAvatar({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const url = assetUrl(src);

  if (!url || failed) {
    return <div className="cv-monogram" aria-hidden>{cvInitials(name)}</div>;
  }

  return (
    <img
      className="cv-avatar"
      src={url}
      alt={`${name} profile`}
      onError={() => setFailed(true)}
    />
  );
}

export default function CvPreview({ cv }: { cv: CvData }) {
  const { profile } = cv;
  const socials = profile.socials.filter((social) => social.icon !== 'email');

  return (
    <article id="cv-paper" className="cv-paper" aria-label={`${profile.name} CV`}>
      <header className="cv-masthead">
        <div className="cv-identity">
          {profile.openToWork && <p className="cv-kicker">{profile.openToWork}</p>}
          <h1 className="cv-name">{profile.name}</h1>
          <p className="cv-role">{profile.title}</p>
        </div>

        <div className="cv-contact">
          <CvAvatar src={profile.avatarUrl} name={profile.name} />
          {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
          {profile.location && <span>{profile.location}</span>}
          {profile.yearsExperience > 0 && (
            <span>{profile.yearsExperience} {profile.yearsExperience === 1 ? 'year' : 'years'} experience</span>
          )}
          {socials.map((social) => (
            <a key={social.id} href={social.url} target="_blank" rel="noreferrer">
              {displayUrl(social.url)}
            </a>
          ))}
        </div>
      </header>

      {cv.summary && (
        <section className="cv-section">
          <h2>Profile</h2>
          <p className="cv-summary">{cv.summary}</p>
        </section>
      )}

      {cv.strengths.length > 0 && (
        <section className="cv-section">
          <h2>{profile.strengthsTitle || 'Core strengths'}</h2>
          <ul className="cv-strengths">
            {cv.strengths.map((strength, index) => (
              <li key={`${strength}-${index}`}>{strength}</li>
            ))}
          </ul>
        </section>
      )}

      {cv.experience.length > 0 && (
        <section className="cv-section">
          <h2>Experience</h2>
          {cv.experience.map((item) => (
            <div key={item.id} className="cv-item">
              <div className="cv-item-head">
                <h3>{item.role}</h3>
                <span className="cv-date">{formatCvRange(item.startDate, item.endDate)}</span>
              </div>
              <p className="cv-item-sub">
                {[item.company, item.employmentType, item.location].filter(Boolean).join(' · ')}
              </p>
              {item.highlights.length > 0 && (
                <ul className="cv-bullets">
                  {item.highlights.map((highlight, index) => (
                    <li key={`${item.id}-${index}`}>{plainText(highlight)}</li>
                  ))}
                </ul>
              )}
              {item.techStack.length > 0 && (
                <p className="cv-tech">{item.techStack.join(' · ')}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {cv.projects.length > 0 && (
        <section className="cv-section">
          <h2>Selected projects</h2>
          {cv.projects.map((project) => (
            <div key={project.id} className="cv-item">
              <div className="cv-item-head">
                <h3>{project.title}</h3>
                <span className="cv-date">{project.year}</span>
              </div>
              <p className="cv-summary">{plainText(project.description)}</p>
              {project.techStack.length > 0 && (
                <p className="cv-tech">{project.techStack.join(' · ')}</p>
              )}
              {(project.liveUrl || project.githubUrl) && (
                <p className="cv-links">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer">Live</a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer">Source</a>
                  )}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {cv.skillGroups.length > 0 && (
        <section className="cv-section">
          <h2>Skills</h2>
          <div className="cv-skill-groups">
            {cv.skillGroups.map((group) => (
              <div key={group.category} className="cv-skill-group">
                <h3>{group.category}</h3>
                <p>{group.items.join(' · ')}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {cv.education.length > 0 && (
        <section className="cv-section">
          <h2>Education</h2>
          {cv.education.map((item) => (
            <div key={item.id} className="cv-item">
              <div className="cv-item-head">
                <h3>{item.institution}</h3>
                <span className="cv-date">{formatCvRange(item.startDate, item.endDate)}</span>
              </div>
              <p className="cv-item-sub">{item.degree}</p>
              {item.description && <p className="cv-summary">{plainText(item.description)}</p>}
            </div>
          ))}
        </section>
      )}

      {cv.hobbies.length > 0 && (
        <section className="cv-section">
          <h2>Interests</h2>
          <p className="cv-summary">{cv.hobbies.map((hobby) => hobby.name).join(' · ')}</p>
        </section>
      )}
    </article>
  );
}
