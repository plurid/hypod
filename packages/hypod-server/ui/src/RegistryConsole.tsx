import { useMutation, useQuery } from '@apollo/client/react';
import { useCallback, useId, useMemo, useState, type FormEvent, type ReactNode } from 'react';

import logoUrl from '../../../../about/identity/hypod-logo.png';
import ImageneDetail from './ImageneDetail';
import SpatialLink from './SpatialLink';
import {
  CREATE_NAMESPACE,
  CREATE_PROJECT,
  DELETE_IMAGENE,
  DELETE_NAMESPACE,
  DELETE_PROJECT,
  GET_IMAGENES,
  GET_NAMESPACES,
  GET_OWNER,
  GET_PROJECTS,
  GET_USAGE,
  LOGIN,
  LOGOUT,
  SET_IMAGENE_PROJECT,
  SET_PROJECT_NAMESPACE,
  TOGGLE_PUBLIC,
} from './graphql';

interface ApiError {
  message: string;
  path: string;
  type: string;
}

interface Envelope<T = undefined> {
  data?: T | null;
  error?: ApiError | null;
  status: boolean;
}

export interface ImageneTag {
  digest: string;
  generatedAt: number;
  id: string;
  name: string;
  size: number;
}

export interface Imagene {
  generatedAt: number;
  id: string;
  isPublic: boolean;
  latest: string;
  name: string;
  projectID?: string | null;
  tags: ImageneTag[];
}

export interface Namespace {
  generatedAt: number;
  generatedBy: string;
  id: string;
  name: string;
}

export interface Project {
  generatedAt: number;
  generatedBy: string;
  id: string;
  name: string;
  namespaceID?: string | null;
}

interface LoginCredentials {
  identonym: string;
  key: string;
}

type OperationResult = void | boolean | Promise<void | boolean>;
type Operation = () => OperationResult;

interface RegistryConsoleViewProperties {
  authenticated: boolean;
  busy: boolean;
  error: string | null;
  imagenes: Imagene[];
  loading: boolean;
  namespaces: Namespace[];
  projects: Project[];
  spatial?: boolean;
  usage: string;
  notice?: string | null;
  onCreateNamespace: (name: string) => OperationResult;
  onCreateProject: (name: string) => OperationResult;
  onDeleteImagene: (id: string) => OperationResult;
  onDeleteNamespace: (id: string) => OperationResult;
  onDeleteProject: (id: string) => OperationResult;
  onLogin: (credentials: LoginCredentials) => OperationResult;
  onLogout: Operation;
  onRetry: Operation;
  onSetImageneProject: (imageneID: string, projectID: string | null) => OperationResult;
  onSetProjectNamespace: (projectID: string, namespaceID: string | null) => OperationResult;
  onToggleVisibility: (id: string, isPublic: boolean) => OperationResult;
}

interface IconProperties {
  children: ReactNode;
  size?: number;
}

const Icon = ({ children, size = 18 }: IconProperties) => (
  <svg
    aria-hidden="true"
    className="icon"
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
  >
    {children}
  </svg>
);

const SearchIcon = () => (
  <Icon size={17}>
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
  </Icon>
);

const CubeIcon = () => (
  <Icon>
    <path
      d="m12 3 8 4.4v9.2L12 21l-8-4.4V7.4L12 3Z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
    <path d="m4.5 7.7 7.5 4.1 7.5-4.1M12 12v8.4" stroke="currentColor" strokeWidth="1.6" />
  </Icon>
);

const LayersIcon = () => (
  <Icon>
    <path
      d="m12 3 9 5-9 5-9-5 9-5Z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
    <path
      d="m4 12 8 4.5 8-4.5M4 16l8 4.5 8-4.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
  </Icon>
);

const ArrowIcon = () => (
  <Icon size={16}>
    <path
      d="M5 12h14m-5-5 5 5-5 5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </Icon>
);

const formatDate = (value: number) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));

const firstEnvelopeError = (...envelopes: Array<Envelope<unknown> | undefined>): string | null => {
  for (const envelope of envelopes) {
    if (envelope && !envelope.status) return envelope.error?.message ?? 'The request failed.';
  }
  return null;
};

const resultSucceeded = (envelope: Envelope<unknown> | null | undefined): boolean => {
  if (!envelope?.status) throw new Error(envelope?.error?.message ?? 'The operation failed.');
  return true;
};

export interface RegistryConsoleProperties {
  spatial?: boolean;
}

export const RegistryConsole = ({ spatial = false }: RegistryConsoleProperties) => {
  const usageQuery = useQuery<{ getUsageType: Envelope<string> }>(GET_USAGE);
  const ownerQuery = useQuery<{ getCurrentOwner: Envelope<{ id: string }> }>(GET_OWNER);
  const imagenesQuery = useQuery<{ getImagenes: Envelope<Imagene[]> }>(GET_IMAGENES);
  const namespacesQuery = useQuery<{ getNamespaces: Envelope<Namespace[]> }>(GET_NAMESPACES);
  const projectsQuery = useQuery<{ getProjects: Envelope<Project[]> }>(GET_PROJECTS);

  const [login] = useMutation<{ login: Envelope<{ id: string }> }>(LOGIN);
  const [logout] = useMutation<{ logout: Envelope }>(LOGOUT);
  const [togglePublic] = useMutation<{ togglePublicImagene: Envelope }>(TOGGLE_PUBLIC);
  const [deleteImagene] = useMutation<{ obliterateImagene: Envelope }>(DELETE_IMAGENE);
  const [createNamespace] = useMutation<{ registerNamespace: Envelope }>(CREATE_NAMESPACE);
  const [deleteNamespace] = useMutation<{ obliterateNamespace: Envelope }>(DELETE_NAMESPACE);
  const [createProject] = useMutation<{ generateProject: Envelope }>(CREATE_PROJECT);
  const [deleteProject] = useMutation<{ obliterateProject: Envelope }>(DELETE_PROJECT);
  const [setProjectNamespace] = useMutation<{ setProjectNamespace: Envelope<Project> }>(
    SET_PROJECT_NAMESPACE,
  );
  const [setImageneProject] = useMutation<{ setImageneProject: Envelope<Imagene> }>(
    SET_IMAGENE_PROJECT,
  );

  const [busy, setBusy] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      usageQuery.refetch(),
      ownerQuery.refetch(),
      imagenesQuery.refetch(),
      namespacesQuery.refetch(),
      projectsQuery.refetch(),
    ]);
  }, [imagenesQuery, namespacesQuery, ownerQuery, projectsQuery, usageQuery]);

  const perform = useCallback(
    async (successMessage: string, operation: () => Promise<boolean>): Promise<boolean> => {
      setBusy(true);
      setNotice(null);
      setOperationError(null);
      try {
        await operation();
        await refetchAll();
        setNotice(successMessage);
        return true;
      } catch (error) {
        setOperationError(error instanceof Error ? error.message : 'The operation failed.');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [refetchAll],
  );

  const transportError =
    usageQuery.error?.message ??
    imagenesQuery.error?.message ??
    namespacesQuery.error?.message ??
    projectsQuery.error?.message ??
    ownerQuery.error?.message ??
    null;
  const responseError = firstEnvelopeError(
    usageQuery.data?.getUsageType,
    imagenesQuery.data?.getImagenes,
    namespacesQuery.data?.getNamespaces,
    projectsQuery.data?.getProjects,
  );
  const loading =
    usageQuery.loading ||
    ownerQuery.loading ||
    imagenesQuery.loading ||
    namespacesQuery.loading ||
    projectsQuery.loading;

  return (
    <RegistryConsoleView
      authenticated={Boolean(
        ownerQuery.data?.getCurrentOwner.status && ownerQuery.data.getCurrentOwner.data,
      )}
      busy={busy}
      error={operationError ?? transportError ?? responseError}
      imagenes={imagenesQuery.data?.getImagenes.data ?? []}
      loading={loading}
      namespaces={namespacesQuery.data?.getNamespaces.data ?? []}
      notice={notice}
      projects={projectsQuery.data?.getProjects.data ?? []}
      spatial={spatial}
      usage={usageQuery.data?.getUsageType.data ?? 'public'}
      onRetry={refetchAll}
      onLogin={(credentials) =>
        perform('Signed in. Registry controls are now available.', async () => {
          const result = await login({ variables: { input: credentials } });
          return resultSucceeded(result.data?.login);
        })
      }
      onLogout={() =>
        perform('Signed out.', async () => {
          const result = await logout();
          return resultSucceeded(result.data?.logout);
        })
      }
      onToggleVisibility={(id, isPublic) =>
        perform(`Imagene is now ${isPublic ? 'public' : 'private'}.`, async () => {
          const result = await togglePublic({ variables: { input: { id, value: isPublic } } });
          return resultSucceeded(result.data?.togglePublicImagene);
        })
      }
      onDeleteImagene={(id) =>
        perform('Imagene metadata was deleted.', async () => {
          const result = await deleteImagene({ variables: { input: { value: id } } });
          return resultSucceeded(result.data?.obliterateImagene);
        })
      }
      onCreateNamespace={(name) =>
        perform('Namespace created.', async () => {
          const result = await createNamespace({ variables: { input: { value: name } } });
          return resultSucceeded(result.data?.registerNamespace);
        })
      }
      onDeleteNamespace={(id) =>
        perform('Namespace deleted. Related projects were unassigned.', async () => {
          const result = await deleteNamespace({ variables: { input: { value: id } } });
          return resultSucceeded(result.data?.obliterateNamespace);
        })
      }
      onCreateProject={(name) =>
        perform('Project created.', async () => {
          const result = await createProject({ variables: { input: { value: name } } });
          return resultSucceeded(result.data?.generateProject);
        })
      }
      onDeleteProject={(id) =>
        perform('Project deleted. Related imagenes were unassigned.', async () => {
          const result = await deleteProject({ variables: { input: { value: id } } });
          return resultSucceeded(result.data?.obliterateProject);
        })
      }
      onSetProjectNamespace={(projectID, namespaceID) =>
        perform('Project assignment updated.', async () => {
          const result = await setProjectNamespace({
            variables: { input: { projectID, namespaceID } },
          });
          return resultSucceeded(result.data?.setProjectNamespace);
        })
      }
      onSetImageneProject={(imageneID, projectID) =>
        perform('Imagene assignment updated.', async () => {
          const result = await setImageneProject({
            variables: { input: { imageneID, projectID } },
          });
          return resultSucceeded(result.data?.setImageneProject);
        })
      }
    />
  );
};

interface PendingDeletion {
  id: string;
  kind: 'imagene' | 'namespace' | 'project';
  name: string;
}

export const RegistryConsoleView = ({
  authenticated,
  busy,
  error,
  imagenes,
  loading,
  namespaces,
  notice = null,
  projects,
  spatial = false,
  usage,
  onCreateNamespace,
  onCreateProject,
  onDeleteImagene,
  onDeleteNamespace,
  onDeleteProject,
  onLogin,
  onLogout,
  onRetry,
  onSetImageneProject,
  onSetProjectNamespace,
  onToggleVisibility,
}: RegistryConsoleViewProperties) => {
  const [section, setSection] = useState<'imagenes' | 'organization'>('imagenes');
  const [search, setSearch] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);
  const [selectedImageneID, setSelectedImageneID] = useState<string | null>(null);
  const loginTitleID = useId();
  const deleteTitleID = useId();

  const filteredImagenes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return imagenes;
    return imagenes.filter(
      (imagene) =>
        imagene.name.toLocaleLowerCase().includes(query) ||
        imagene.tags.some((tag) => tag.name.toLocaleLowerCase().includes(query)),
    );
  }, [imagenes, search]);

  const selectedImagene = imagenes.find((imagene) => imagene.id === selectedImageneID);
  const totalTags = imagenes.reduce((total, imagene) => total + imagene.tags.length, 0);
  const publicCount = imagenes.filter((imagene) => imagene.isPublic).length;

  const confirmDeletion = async () => {
    if (!pendingDeletion) return;
    const operation =
      pendingDeletion.kind === 'imagene'
        ? onDeleteImagene(pendingDeletion.id)
        : pendingDeletion.kind === 'namespace'
          ? onDeleteNamespace(pendingDeletion.id)
          : onDeleteProject(pendingDeletion.id);
    const succeeded = await operation;
    if (succeeded !== false) setPendingDeletion(null);
  };

  return (
    <div className="registry-shell">
      <a className="skip-link" href="#registry-content">
        Skip to registry content
      </a>

      <header className="topbar">
        <div className="brand" aria-label="Hypod home">
          <img alt="" src={logoUrl} />
          <div>
            <strong>hypod</strong>
            <span>OCI registry</span>
          </div>
        </div>

        <div className="topbar-actions">
          <span className={`access-pill ${authenticated ? 'authenticated' : ''}`}>
            <span className="status-dot" aria-hidden="true" />
            {authenticated ? 'Owner session' : 'Read-only public access'}
          </span>
          {authenticated ? (
            <button className="button quiet" disabled={busy} type="button" onClick={onLogout}>
              Log out
            </button>
          ) : (
            <button
              className="button primary compact-button"
              type="button"
              onClick={() => setLoginOpen(true)}
            >
              Log in
              <ArrowIcon />
            </button>
          )}
        </div>
      </header>

      <main id="registry-content">
        <section className="hero" aria-labelledby="registry-title">
          <div className="hero-copy">
            <p className="eyebrow">Distribution, without the machinery</p>
            <h1 id="registry-title">Registry operations</h1>
            <p>
              Inspect OCI artifacts, control public access, and keep project ownership legible from
              one focused workspace.
            </p>
          </div>
          <div className="endpoint-card">
            <span>Registry endpoint</span>
            <code>
              {typeof window === 'undefined' ? 'your-registry.example' : window.location.host}
            </code>
            <small>{usage} mode · OCI Distribution 1.1</small>
          </div>
        </section>

        <section className="metric-strip" aria-label="Registry summary">
          <div>
            <span>Imagenes</span>
            <strong>{imagenes.length.toLocaleString()}</strong>
          </div>
          <div>
            <span>Published tags</span>
            <strong>{totalTags.toLocaleString()}</strong>
          </div>
          <div>
            <span>Public</span>
            <strong>{publicCount.toLocaleString()}</strong>
          </div>
          <div>
            <span>Projects</span>
            <strong>{authenticated ? projects.length.toLocaleString() : '—'}</strong>
          </div>
        </section>

        {(error || notice) && (
          <div
            className={`notice ${error ? 'error' : 'success'}`}
            role={error ? 'alert' : 'status'}
          >
            <div>
              <strong>{error ? 'Could not complete the request' : 'Registry updated'}</strong>
              <span>{error ?? notice}</span>
            </div>
            {error && (
              <button className="button quiet" type="button" onClick={onRetry}>
                Retry
              </button>
            )}
          </div>
        )}

        <div className="workspace">
          <nav aria-label="Registry sections" className="section-nav">
            <button
              aria-current={section === 'imagenes' ? 'page' : undefined}
              className={section === 'imagenes' ? 'active' : ''}
              type="button"
              onClick={() => setSection('imagenes')}
            >
              <CubeIcon />
              <span>Imagenes</span>
              <span className="nav-count">{imagenes.length}</span>
            </button>
            <button
              aria-current={section === 'organization' ? 'page' : undefined}
              className={section === 'organization' ? 'active' : ''}
              type="button"
              onClick={() => setSection('organization')}
            >
              <LayersIcon />
              <span>Organization</span>
              <span className="nav-count">
                {authenticated ? namespaces.length + projects.length : '·'}
              </span>
            </button>
            <div className="nav-note">
              <span className="status-dot" aria-hidden="true" />
              <p>
                <strong>Registry ready</strong>
                Health checks are available at <code>/health/ready</code>.
              </p>
            </div>
          </nav>

          <div className="workspace-content">
            {section === 'imagenes' ? (
              <section aria-labelledby="imagenes-title">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Artifact catalog</p>
                    <h2 id="imagenes-title">Imagenes</h2>
                  </div>
                  <label className="search-field">
                    <span className="visually-hidden">Search imagenes and tags</span>
                    <SearchIcon />
                    <input
                      type="search"
                      value={search}
                      placeholder="Search imagenes or tags…"
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>
                </div>

                {loading ? (
                  <LoadingGrid />
                ) : filteredImagenes.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-symbol">
                      <CubeIcon />
                    </div>
                    <h3>{search ? 'No matching imagenes' : 'The catalog is quiet'}</h3>
                    <p>
                      {search
                        ? 'Try a repository name or a published tag.'
                        : authenticated
                          ? 'Push an OCI artifact to this registry and it will appear here.'
                          : 'No public imagenes are available yet.'}
                    </p>
                    {!authenticated && (
                      <button
                        className="button primary"
                        type="button"
                        onClick={() => setLoginOpen(true)}
                      >
                        Log in to manage
                      </button>
                    )}
                  </div>
                ) : (
                  <ul className="imagene-grid">
                    {filteredImagenes.map((imagene) => {
                      const project = projects.find((item) => item.id === imagene.projectID);
                      return (
                        <li className="imagene-card" key={imagene.id}>
                          <div className="imagene-card-top">
                            <div className="artifact-mark">
                              <CubeIcon />
                            </div>
                            <span
                              className={`visibility ${imagene.isPublic ? 'public' : 'private'}`}
                            >
                              {imagene.isPublic ? 'Public' : 'Private'}
                            </span>
                          </div>
                          <div className="imagene-card-copy">
                            <h3>{imagene.name}</h3>
                            <p>
                              {imagene.tags.length} {imagene.tags.length === 1 ? 'tag' : 'tags'}
                              <span aria-hidden="true"> · </span>
                              Updated {formatDate(imagene.generatedAt)}
                            </p>
                            <div className="tag-row">
                              {imagene.tags.slice(0, 3).map((tag) => (
                                <span key={tag.id}>{tag.name}</span>
                              ))}
                              {imagene.tags.length > 3 && <span>+{imagene.tags.length - 3}</span>}
                            </div>
                          </div>
                          {authenticated && (
                            <label className="inline-select">
                              <span>Project</span>
                              <select
                                disabled={busy}
                                value={imagene.projectID ?? ''}
                                onChange={(event) =>
                                  onSetImageneProject(imagene.id, event.target.value || null)
                                }
                              >
                                <option value="">Unassigned</option>
                                {projects.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}
                          <div className="card-actions">
                            {spatial ? (
                              <SpatialLink route={`/imagene/${encodeURIComponent(imagene.id)}`}>
                                Inspect
                                <ArrowIcon />
                              </SpatialLink>
                            ) : (
                              <button
                                className="text-button"
                                type="button"
                                onClick={() => setSelectedImageneID(imagene.id)}
                              >
                                Inspect
                                <ArrowIcon />
                              </button>
                            )}
                            {authenticated && (
                              <div>
                                <button
                                  className="button quiet small"
                                  disabled={busy}
                                  type="button"
                                  onClick={() => onToggleVisibility(imagene.id, !imagene.isPublic)}
                                >
                                  Make {imagene.isPublic ? 'private' : 'public'}
                                </button>
                                <button
                                  className="button danger small"
                                  disabled={busy}
                                  type="button"
                                  aria-label={`Delete ${imagene.name}`}
                                  onClick={() =>
                                    setPendingDeletion({
                                      id: imagene.id,
                                      kind: 'imagene',
                                      name: imagene.name,
                                    })
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                          {project && <span className="project-ribbon">{project.name}</span>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            ) : (
              <OrganizationView
                authenticated={authenticated}
                busy={busy}
                namespaces={namespaces}
                projects={projects}
                onCreateNamespace={onCreateNamespace}
                onCreateProject={onCreateProject}
                onDelete={(deletion) => setPendingDeletion(deletion)}
                onLogin={() => setLoginOpen(true)}
                onSetProjectNamespace={onSetProjectNamespace}
              />
            )}
          </div>
        </div>
      </main>

      <footer>
        <span>hypod 0.2.0</span>
        <span>Content-addressed · OCI-native · self-hosted</span>
      </footer>

      {loginOpen && (
        <LoginDialog
          busy={busy}
          titleID={loginTitleID}
          onClose={() => setLoginOpen(false)}
          onSubmit={async (credentials) => {
            const succeeded = await onLogin(credentials);
            if (succeeded !== false) setLoginOpen(false);
          }}
        />
      )}

      {pendingDeletion && (
        <div className="dialog-backdrop" role="presentation">
          <div aria-labelledby={deleteTitleID} aria-modal="true" className="dialog" role="dialog">
            <p className="eyebrow">Confirmation required</p>
            <h2 id={deleteTitleID}>Delete {pendingDeletion.name}?</h2>
            <p>
              This removes the {pendingDeletion.kind} record. Unreferenced content is reclaimed only
              when garbage collection runs.
            </p>
            <div className="dialog-actions">
              <button
                className="button quiet"
                disabled={busy}
                type="button"
                onClick={() => setPendingDeletion(null)}
              >
                Cancel
              </button>
              <button
                className="button danger"
                disabled={busy}
                type="button"
                onClick={confirmDeletion}
              >
                {busy ? 'Deleting…' : `Delete ${pendingDeletion.kind}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedImagene && (
        <ImageneDetail
          imagene={selectedImagene}
          projectName={
            projects.find((project) => project.id === selectedImagene.projectID)?.name ?? null
          }
          onClose={() => setSelectedImageneID(null)}
        />
      )}
    </div>
  );
};

const LoadingGrid = () => (
  <div
    aria-busy="true"
    aria-label="Loading imagenes"
    className="imagene-grid loading-grid"
    role="status"
  >
    {[1, 2, 3].map((key) => (
      <div className="skeleton-card" key={key} />
    ))}
  </div>
);

interface OrganizationViewProperties {
  authenticated: boolean;
  busy: boolean;
  namespaces: Namespace[];
  projects: Project[];
  onCreateNamespace: (name: string) => OperationResult;
  onCreateProject: (name: string) => OperationResult;
  onDelete: (deletion: PendingDeletion) => void;
  onLogin: () => void;
  onSetProjectNamespace: (projectID: string, namespaceID: string | null) => OperationResult;
}

const OrganizationView = ({
  authenticated,
  busy,
  namespaces,
  projects,
  onCreateNamespace,
  onCreateProject,
  onDelete,
  onLogin,
  onSetProjectNamespace,
}: OrganizationViewProperties) => {
  const [namespaceName, setNamespaceName] = useState('');
  const [projectName, setProjectName] = useState('');

  if (!authenticated) {
    return (
      <section aria-labelledby="organization-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Ownership map</p>
            <h2 id="organization-title">Organization</h2>
          </div>
        </div>
        <div className="auth-gate">
          <div className="auth-gate-mark">
            <LayersIcon />
          </div>
          <div>
            <h3>Owner access keeps structure private</h3>
            <p>Log in to create namespaces, organize projects, and assign imagenes.</p>
          </div>
          <button className="button primary" type="button" onClick={onLogin}>
            Log in
          </button>
        </div>
      </section>
    );
  }

  const submitNamespace = async (event: FormEvent) => {
    event.preventDefault();
    const value = namespaceName.trim();
    if (!value) return;
    const succeeded = await onCreateNamespace(value);
    if (succeeded !== false) setNamespaceName('');
  };

  const submitProject = async (event: FormEvent) => {
    event.preventDefault();
    const value = projectName.trim();
    if (!value) return;
    const succeeded = await onCreateProject(value);
    if (succeeded !== false) setProjectName('');
  };

  return (
    <section aria-labelledby="organization-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Ownership map</p>
          <h2 id="organization-title">Organization</h2>
        </div>
      </div>

      <div className="organization-grid">
        <div className="entity-panel">
          <div className="panel-heading">
            <div>
              <h3>Namespaces</h3>
              <p>Stable boundaries for related projects.</p>
            </div>
            <span className="count-badge">{namespaces.length}</span>
          </div>
          <form className="create-row" onSubmit={submitNamespace}>
            <label>
              <span className="visually-hidden">New namespace name</span>
              <input
                required
                value={namespaceName}
                placeholder="Namespace name"
                onChange={(event) => setNamespaceName(event.target.value)}
              />
            </label>
            <button className="button primary" disabled={busy} type="submit">
              Create
            </button>
          </form>
          {namespaces.length === 0 ? (
            <p className="panel-empty">No namespaces yet.</p>
          ) : (
            <ul className="entity-list">
              {namespaces.map((namespace) => (
                <li key={namespace.id}>
                  <div>
                    <strong>{namespace.name}</strong>
                    <span>
                      {projects.filter((project) => project.namespaceID === namespace.id).length}{' '}
                      projects
                    </span>
                  </div>
                  <button
                    className="button danger small"
                    disabled={busy}
                    type="button"
                    aria-label={`Delete ${namespace.name}`}
                    onClick={() =>
                      onDelete({ id: namespace.id, kind: 'namespace', name: namespace.name })
                    }
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="entity-panel">
          <div className="panel-heading">
            <div>
              <h3>Projects</h3>
              <p>Assignments between repositories and teams.</p>
            </div>
            <span className="count-badge">{projects.length}</span>
          </div>
          <form className="create-row" onSubmit={submitProject}>
            <label>
              <span className="visually-hidden">New project name</span>
              <input
                required
                value={projectName}
                placeholder="Project name"
                onChange={(event) => setProjectName(event.target.value)}
              />
            </label>
            <button className="button primary" disabled={busy} type="submit">
              Create
            </button>
          </form>
          {projects.length === 0 ? (
            <p className="panel-empty">No projects yet.</p>
          ) : (
            <ul className="entity-list projects">
              {projects.map((project) => (
                <li key={project.id}>
                  <div>
                    <strong>{project.name}</strong>
                    <label className="inline-select">
                      <span>Namespace</span>
                      <select
                        disabled={busy}
                        value={project.namespaceID ?? ''}
                        onChange={(event) =>
                          onSetProjectNamespace(project.id, event.target.value || null)
                        }
                      >
                        <option value="">Unassigned</option>
                        {namespaces.map((namespace) => (
                          <option key={namespace.id} value={namespace.id}>
                            {namespace.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <button
                    className="button danger small"
                    disabled={busy}
                    type="button"
                    aria-label={`Delete ${project.name}`}
                    onClick={() =>
                      onDelete({ id: project.id, kind: 'project', name: project.name })
                    }
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

interface LoginDialogProperties {
  busy: boolean;
  titleID: string;
  onClose: () => void;
  onSubmit: (credentials: LoginCredentials) => void | Promise<void>;
}

const LoginDialog = ({ busy, titleID, onClose, onSubmit }: LoginDialogProperties) => {
  const [identonym, setIdentonym] = useState('');
  const [key, setKey] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({ identonym, key });
  };

  return (
    <div className="dialog-backdrop" role="presentation">
      <form
        aria-labelledby={titleID}
        aria-modal="true"
        className="dialog"
        role="dialog"
        onSubmit={submit}
      >
        <p className="eyebrow">Owner session</p>
        <h2 id={titleID}>Unlock registry controls</h2>
        <p>
          Your credentials are exchanged for a short-lived, scoped token and are never stored here.
        </p>
        <label className="field">
          <span>Identonym</span>
          <input
            autoComplete="username"
            autoFocus
            required
            value={identonym}
            onChange={(event) => setIdentonym(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Key</span>
          <input
            autoComplete="current-password"
            required
            type="password"
            value={key}
            onChange={(event) => setKey(event.target.value)}
          />
        </label>
        <div className="dialog-actions">
          <button className="button quiet" disabled={busy} type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" disabled={busy} type="submit">
            {busy ? 'Signing in…' : 'Log in'}
          </button>
        </div>
      </form>
    </div>
  );
};
