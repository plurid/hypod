import { useId } from 'react';

import type { Imagene } from './RegistryConsole';

export interface ImageneDetailProperties {
  imagene: Imagene;
  presentation?: 'dialog' | 'plane';
  projectName: string | null;
  onClose: () => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KiB', 'MiB', 'GiB', 'TiB'];
  let value = bytes / 1024;
  let unit = units[0];
  for (const next of units.slice(1)) {
    if (value < 1024) break;
    value /= 1024;
    unit = next;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${unit}`;
};

const CloseIcon = () => (
  <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
  </svg>
);

const BackIcon = () => (
  <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
    <path
      d="M19 12H5m6-6-6 6 6 6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const ImageneDetail = ({
  imagene,
  presentation = 'dialog',
  projectName,
  onClose,
}: ImageneDetailProperties) => {
  const titleID = useId();
  const tagListTitleID = `${titleID}-tags`;
  const content = (
    <>
      <div className="detail-heading">
        <div>
          <p className="eyebrow">Imagene record</p>
          <h2 id={titleID}>{imagene.name}</h2>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={onClose}
          aria-label={presentation === 'plane' ? 'Back to registry' : 'Close details'}
        >
          {presentation === 'plane' ? <BackIcon /> : <CloseIcon />}
        </button>
      </div>

      <dl className="detail-facts">
        <div>
          <dt>Visibility</dt>
          <dd>{imagene.isPublic ? 'Public' : 'Private'}</dd>
        </div>
        <div>
          <dt>Project</dt>
          <dd>{projectName ?? 'Unassigned'}</dd>
        </div>
        <div>
          <dt>Latest</dt>
          <dd className="monospace">{imagene.latest || 'No tagged manifest'}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{new Date(imagene.generatedAt).toLocaleString()}</dd>
        </div>
      </dl>

      <section aria-labelledby={tagListTitleID} className="detail-tags">
        <div className="section-heading compact">
          <h3 id={tagListTitleID}>Published tags</h3>
          <span className="count-badge">{imagene.tags.length}</span>
        </div>
        {imagene.tags.length === 0 ? (
          <p className="muted">No manifests have been tagged.</p>
        ) : (
          <ul>
            {imagene.tags.map((tag) => (
              <li key={tag.id}>
                <div>
                  <strong>{tag.name}</strong>
                  <span className="digest monospace" title={tag.digest}>
                    {tag.digest}
                  </span>
                </div>
                <span>{formatBytes(tag.size)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );

  if (presentation === 'plane') {
    return (
      <section aria-labelledby={titleID} className="detail-plane">
        <div className="detail-plane-panel">{content}</div>
      </section>
    );
  }

  return (
    <div className="detail-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        aria-labelledby={titleID}
        aria-modal="true"
        className="detail-panel"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {content}
      </aside>
    </div>
  );
};

export default ImageneDetail;
