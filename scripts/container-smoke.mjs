import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';

// Opt-in: requires Docker, downloads a BusyBox fixture, and never uses the user's
// Docker credentials or existing data. --keep retains this run for manual UI checks.
const keep = process.argv.includes('--keep');
assert(
  process.argv.slice(2).every((argument) => argument === '--keep'),
  'Unknown argument',
);
const root = resolve(import.meta.dirname, '..');
const runID = `${Date.now()}-${randomBytes(3).toString('hex')}`;
const container = `hypod-smoke-${runID}`;
const volume = `${container}-data`;
const image = process.env.HYPOD_CONTAINER_IMAGE ?? `hypod:smoke-${runID}`;
const temporary = await mkdtemp(join(tmpdir(), 'hypod-container-smoke-'));
const configuration = join(temporary, 'docker');
const environmentFile = join(temporary, 'hypod.env');
const artifactDirectory = join(root, '.artifacts', 'container-smoke', runID);
const owner = 'container-smoke';
const key = randomBytes(32).toString('hex');
const basic = `Basic ${Buffer.from(`${owner}:${key}`).toString('base64')}`;
const checks = [];
const imageTags = [];
let dockerEnvironment = process.env;
let succeeded = false;
let createdContainer = false;
let createdVolume = false;

const docker = (arguments_, { input, quiet = false } = {}) => {
  try {
    const result = execFileSync('docker', arguments_, {
      cwd: root,
      env: dockerEnvironment,
      encoding: 'utf8',
      input,
      timeout: 600_000,
      maxBuffer: 16 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    if (!quiet && result.trim()) console.log(result.trim());
    return result.trim();
  } catch (error) {
    throw new Error(`docker ${arguments_.join(' ')} failed: ${error.stderr ?? error.message}`, {
      cause: error,
    });
  }
};

const passed = (name) => {
  checks.push(name);
  console.log(`PASS ${name}`);
};

const freePort = () =>
  new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((error) => (error ? reject(error) : resolvePort(port)));
    });
  });

const port = Number(process.env.HYPOD_SMOKE_PORT ?? (await freePort()));
assert(Number.isInteger(port) && port > 0 && port <= 65535, 'Invalid smoke-test port');
const address = `127.0.0.1:${port}`;
const origin = `http://${address}`;
const repository = 'smoke/hello';
const mirror = 'smoke/mirror';
const indexType = 'application/vnd.oci.image.index.v1+json';
const manifestTypes = `${indexType},application/vnd.oci.image.manifest.v1+json,application/vnd.docker.distribution.manifest.v2+json`;
const digest = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const request = (path, options = {}) =>
  fetch(new URL(path, origin), {
    ...options,
    headers: { Authorization: basic, Accept: manifestTypes, ...options.headers },
    signal: AbortSignal.timeout(15_000),
  });
const waitReady = async () => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await request('/health/ready');
      if (response.ok) return;
    } catch {
      /* Startup and restart briefly refuse connections. */
    }
    await setTimeout(100);
  }
  throw new Error(`Registry did not become ready: ${docker(['logs', container], { quiet: true })}`);
};
const graphql = async (query, variables = {}) => {
  const response = await request('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.errors, undefined, JSON.stringify(result.errors));
  for (const value of Object.values(result.data))
    assert.equal(value.status, true, JSON.stringify(value.error));
  return result.data;
};
const manifest = async (name, reference) => {
  const response = await request(`/v2/${name}/manifests/${reference}`);
  assert.equal(response.status, 200);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(response.headers.get('docker-content-digest'), digest(bytes));
  return {
    bytes,
    json: JSON.parse(bytes),
    digest: digest(bytes),
    mediaType: response.headers.get('content-type'),
  };
};

try {
  await mkdir(configuration, { mode: 0o700 });
  await mkdir(artifactDirectory, { recursive: true });
  const host =
    process.env.DOCKER_HOST ??
    docker(['context', 'inspect', '--format', '{{.Endpoints.docker.Host}}'], { quiet: true });
  dockerEnvironment = { ...process.env, DOCKER_HOST: host, DOCKER_CONFIG: configuration };
  delete dockerEnvironment.DOCKER_CONTEXT;
  if (!process.env.HYPOD_CONTAINER_IMAGE) {
    console.log(`Building ${image}…`);
    docker(['build', '--tag', image, '.']);
  }
  const imageDetails = JSON.parse(docker(['image', 'inspect', image], { quiet: true }))[0];
  assert.equal(imageDetails.Config.User, '10001:10001');
  passed('runtime image declares non-root UID/GID 10001');
  await writeFile(
    environmentFile,
    [
      `HYPOD_MODE=${process.env.HYPOD_SMOKE_MODE ?? 'public'}`,
      `HYPOD_EXTERNAL_URL=${origin}`,
      `HYPOD_OWNER_IDENTONYM=${owner}`,
      `HYPOD_OWNER_KEY=${key}`,
      `HYPOD_TOKEN_SECRET=${randomBytes(32).toString('hex')}`,
      '',
    ].join('\n'),
    { mode: 0o600 },
  );
  docker(['volume', 'create', '--label', 'hypod.test=container-smoke', volume]);
  createdVolume = true;
  const hardening = [
    '--read-only',
    '--tmpfs',
    '/tmp:size=16m',
    '--cap-drop',
    'ALL',
    '--security-opt',
    'no-new-privileges',
    '--mount',
    `type=volume,source=${volume},target=/var/lib/hypod`,
    '--env-file',
    environmentFile,
  ];
  docker([
    'run',
    '--detach',
    '--name',
    container,
    '--label',
    'hypod.test=container-smoke',
    ...hardening,
    '--publish',
    `127.0.0.1:${port}:56565`,
    image,
  ]);
  createdContainer = true;
  await waitReady();
  const running = JSON.parse(docker(['inspect', container], { quiet: true }))[0];
  assert.equal(running.HostConfig.ReadonlyRootfs, true);
  assert(running.HostConfig.CapDrop.includes('ALL'));
  const runtime = JSON.parse(
    docker(
      [
        'exec',
        container,
        'node',
        '-e',
        "console.log(JSON.stringify({uid:process.getuid(),node:process.version,cache:require('node:fs').existsSync('/app/.pnpm-store')}))",
      ],
      { quiet: true },
    ),
  );
  assert.equal(runtime.uid, 10001);
  assert.equal(runtime.cache, false, 'Build cache leaked into runtime');
  passed('healthy runtime on read-only root, dropped capabilities, no build cache');
  const admin = await request('/', { headers: { Accept: 'text/html' } });
  assert.equal(admin.status, 200);
  assert.match(await admin.text(), /assets\/index-.*\.js/);
  assert.equal((await request('/v2/')).status, 200);
  passed('packaged admin assets and OCI endpoint are served');
  const denied = await request(`/v2/${repository}/blobs/uploads/`, {
    method: 'POST',
    headers: { Authorization: '' },
  });
  assert.equal(denied.status, 401);
  passed('anonymous push is rejected');
  docker(['login', address, '--username', owner, '--password-stdin'], { input: `${key}\n` });
  const fixture = join(temporary, 'fixture');
  await mkdir(fixture);
  await writeFile(
    join(fixture, 'Dockerfile'),
    'FROM busybox:1.37.0\nCOPY message.txt /message.txt\nCMD ["cat", "/message.txt"]\n',
  );
  await writeFile(join(fixture, 'message.txt'), 'Hello from Hypod container smoke test\n');
  const descriptors = [];
  for (const architecture of ['arm64', 'amd64']) {
    const tag = `${address}/${repository}:v1-${architecture}`;
    imageTags.push(tag);
    console.log(`Building and pushing ${architecture} fixture…`);
    docker([
      'build',
      '--platform',
      `linux/${architecture}`,
      '--provenance=false',
      '--tag',
      tag,
      fixture,
    ]);
    docker(['push', tag]);
    const entry = await manifest(repository, `v1-${architecture}`);
    descriptors.push({
      mediaType: entry.mediaType,
      digest: entry.digest,
      size: entry.bytes.length,
      platform: { os: 'linux', architecture },
    });
  }
  passed('real Docker image push for linux/arm64 and linux/amd64; exact manifest digests');
  const index = JSON.stringify({ schemaVersion: 2, mediaType: indexType, manifests: descriptors });
  const indexDigest = digest(index);
  const indexed = await request(`/v2/${repository}/manifests/${indexDigest}?tag=v1&tag=latest`, {
    method: 'PUT',
    headers: { 'Content-Type': indexType },
    body: index,
  });
  assert.equal(indexed.status, 201);
  assert.match(indexed.headers.get('oci-tag'), /latest/);
  assert.equal((await manifest(repository, 'latest')).digest, indexDigest);
  passed('multi-platform OCI index and digest push with repeated tag parameters');
  const pullTag = `${address}/${repository}:latest`;
  imageTags.push(pullTag);
  docker(['pull', pullTag]);
  assert.equal(
    docker(['run', '--rm', '--network', 'none', '--read-only', '--cap-drop', 'ALL', pullTag], {
      quiet: true,
    }),
    'Hello from Hypod container smoke test',
  );
  passed('Docker pulls the index, chooses the native platform, and runs the image');
  const architecture = docker(['info', '--format', '{{.Architecture}}'], { quiet: true });
  const nativeArchitecture =
    architecture === 'aarch64' || architecture === 'arm64' ? 'arm64' : 'amd64';
  const native = await manifest(repository, `v1-${nativeArchitecture}`);
  const mirrorTag = `${address}/${mirror}:v1`;
  imageTags.push(mirrorTag);
  docker(['tag', `${address}/${repository}:v1-${nativeArchitecture}`, mirrorTag]);
  const mountOutput = docker(['push', mirrorTag]);
  assert.match(mountOutput, /Mounted from/);
  assert.equal((await manifest(mirror, 'v1')).digest, native.digest);
  passed('Docker cross-repository push mounts shared layers instead of uploading them');
  const blob = native.json.layers[0];
  const full = await request(`/v2/${repository}/blobs/${blob.digest}`);
  assert.equal(full.status, 200);
  const fullBytes = Buffer.from(await full.arrayBuffer());
  assert.equal(digest(fullBytes), blob.digest);
  const partial = await request(`/v2/${repository}/blobs/${blob.digest}`, {
    headers: { Range: 'bytes=10-19' },
  });
  assert.equal(partial.status, 206);
  assert.equal(partial.headers.get('accept-ranges'), 'bytes');
  assert.equal(partial.headers.get('content-range'), `bytes 10-19/${fullBytes.length}`);
  assert.deepEqual(Buffer.from(await partial.arrayBuffer()), fullBytes.subarray(10, 20));
  const outside = await request(`/v2/${repository}/blobs/${blob.digest}`, {
    headers: { Range: `bytes=${fullBytes.length}-` },
  });
  assert.equal(outside.status, 416);
  passed('byte-range download is exact; unsatisfiable range returns 416');
  const fdCount = () =>
    Number(
      docker(
        [
          'exec',
          container,
          'node',
          '-e',
          "console.log(require('node:fs').readdirSync('/proc/1/fd').length)",
        ],
        { quiet: true },
      ),
    );
  const before = fdCount();
  for (let index = 0; index < 200; index += 1)
    assert.equal(
      (await request(`/v2/${repository}/blobs/${blob.digest}`, { method: 'HEAD' })).status,
      200,
    );
  assert(fdCount() <= before + 4, 'HEAD requests leaked file descriptors');
  passed('200 blob HEAD requests do not accumulate file descriptors');
  const temporaryTag = await request(`/v2/${mirror}/manifests/disposable`, {
    method: 'PUT',
    headers: { 'Content-Type': native.mediaType },
    body: native.bytes,
  });
  assert.equal(temporaryTag.status, 201);
  assert.equal(
    (await request(`/v2/${mirror}/manifests/disposable`, { method: 'DELETE' })).status,
    202,
  );
  assert.equal((await request(`/v2/${mirror}/manifests/disposable`)).status, 404);
  assert.equal((await manifest(mirror, 'v1')).digest, native.digest);
  passed('delete by tag removes only the selected reference');
  const { getImagenes } = await graphql(
    '{ getImagenes { status error { message } data { id name tags { name } } } }',
  );
  const imagene = getImagenes.data.find((item) => item.name === repository);
  assert(imagene);
  assert.equal(
    (await request(`/v2/${repository}/manifests/latest`, { headers: { Authorization: '' } }))
      .status,
    401,
  );
  await graphql(
    'mutation ($input: InputTogglePublicImagene!) { togglePublicImagene(input: $input) { status error { message } } }',
    { input: { id: imagene.id, value: true } },
  );
  assert.equal(
    (await request(`/v2/${repository}/manifests/latest`, { headers: { Authorization: '' } }))
      .status,
    200,
  );
  assert.equal(
    (await request(`/v2/${mirror}/manifests/v1`, { headers: { Authorization: '' } })).status,
    401,
  );
  passed('GraphQL catalog matches pushed images; public visibility stays repository-scoped');
  let refused = false;
  try {
    docker(['run', '--rm', ...hardening, image, 'doctor'], { quiet: true });
  } catch (error) {
    assert.match(error.message, /locked/i);
    refused = true;
  }
  assert(refused, 'Second writer unexpectedly acquired the live data root');
  passed('another container cannot take a live data-root lock');
  docker(['stop', '--time', '10', container]);
  const stopped = JSON.parse(docker(['inspect', container], { quiet: true }))[0];
  assert.equal(stopped.State.ExitCode, 0);
  const doctor = JSON.parse(
    docker(['run', '--rm', ...hardening, image, 'doctor'], { quiet: true }),
  );
  assert.equal(doctor.ok, true);
  passed('SIGTERM exits cleanly; offline doctor verifies SQLite, references, and bytes');
  docker(['start', container]);
  await waitReady();
  assert.equal((await manifest(repository, 'latest')).digest, indexDigest);
  passed('tags and manifests survive a graceful restart');
  docker(['kill', '--signal', 'KILL', container]);
  docker(['start', container]);
  await waitReady();
  assert.equal((await manifest(repository, 'latest')).digest, indexDigest);
  docker(['pull', pullTag]);
  passed('SIGKILL releases the kernel lock; restart and Docker pull need no recovery');
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const state = JSON.parse(docker(['inspect', container], { quiet: true }))[0].State;
    if (state.Health.Status === 'healthy') break;
    assert.notEqual(state.Health.Status, 'unhealthy');
    assert(attempt < 99, 'Docker healthcheck never became healthy');
    await setTimeout(500);
  }
  passed('Docker HEALTHCHECK reaches healthy after crash restart');
  const statistics = docker(['stats', '--no-stream', '--format', '{{json .}}', container], {
    quiet: true,
  });
  await writeFile(
    join(artifactDirectory, 'report.json'),
    JSON.stringify(
      {
        runID,
        date: new Date().toISOString(),
        image,
        imageID: imageDetails.Id,
        imageBytes: imageDetails.Size,
        runtime,
        origin,
        container,
        volume,
        checks,
        indexDigest,
        descriptors,
        statistics: JSON.parse(statistics),
        kept: keep,
      },
      null,
      2,
    ),
  );
  await writeFile(
    join(artifactDirectory, 'registry.log'),
    docker(['logs', container], { quiet: true }),
  );
  succeeded = true;
  console.log(
    `\n${checks.length} container checks passed. Report: ${artifactDirectory}/report.json`,
  );
  if (keep) {
    console.log(
      `Registry retained at ${origin}\nContainer: ${container}\nVolume: ${volume}\nTemporary credentials: ${environmentFile}\nStop: docker stop ${container}`,
    );
  }
} catch (error) {
  if (createdContainer) {
    const log = docker(['logs', container], { quiet: true });
    await writeFile(join(artifactDirectory, 'failure.log'), log);
    for (const line of log.split('\n')) {
      try {
        const entry = JSON.parse(line);
        if (entry.message === 'HTTP request')
          console.error(`${entry.method} ${entry.path}: ${entry.status}`);
      } catch {
        /* Startup also prints a multiline address object. */
      }
    }
    console.error(`Failure evidence: ${artifactDirectory}/failure.log`);
  }
  throw error;
} finally {
  if (!keep || !succeeded) {
    if (createdContainer) docker(['rm', '--force', container], { quiet: true });
    if (createdVolume) docker(['volume', 'rm', volume], { quiet: true });
    for (const tag of imageTags) {
      try {
        docker(['image', 'rm', tag], { quiet: true });
      } catch {
        /* A failed build may not have created this tag. */
      }
    }
    await rm(temporary, { recursive: true, force: true });
  }
}
