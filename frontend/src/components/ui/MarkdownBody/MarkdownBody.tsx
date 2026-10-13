import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Theme-aware markdown renderer (shared by the Blogs reader and the editor
 *  preview). Raw HTML in the source is skipped, never rendered — posts stay
 *  XSS-safe without a sanitizer. Typography comes from the `.md-body` scope
 *  in global.css (theme tokens, no typography plugin). */
const MarkdownBody = memo(function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="md-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </div>
  );
});

export default MarkdownBody;
