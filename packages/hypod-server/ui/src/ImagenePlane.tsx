import { useQuery } from '@apollo/client/react';
import { PLURID_PUBSUB_TOPIC, type PluridPlaneComponentProperty } from '@plurid/plurid-react';

import ImageneDetail from './ImageneDetail';
import type { Imagene, Project } from './RegistryConsole';
import { GET_IMAGENES, GET_PROJECTS } from './graphql';

interface Envelope<T> {
  data?: T | null;
  error?: { message: string } | null;
  status: boolean;
}

interface ImagenePlaneProperties {
  plurid: PluridPlaneComponentProperty;
}

const ImagenePlane = ({ plurid }: ImagenePlaneProperties) => {
  const imagenesQuery = useQuery<{ getImagenes: Envelope<Imagene[]> }>(GET_IMAGENES);
  const projectsQuery = useQuery<{ getProjects: Envelope<Project[]> }>(GET_PROJECTS);
  const imageneID = plurid.plane.parameters.id;
  const imagene = imagenesQuery.data?.getImagenes.data?.find((item) => item.id === imageneID);
  const project = projectsQuery.data?.getProjects.data?.find(
    (item) => item.id === imagene?.projectID,
  );

  const returnToRegistry = () => {
    if (plurid.plane.parentPlaneID) {
      plurid.pubSub.publish({
        topic: PLURID_PUBSUB_TOPIC.NAVIGATE_TO_PLANE,
        data: { id: plurid.plane.parentPlaneID },
      });
    }

    plurid.pubSub.publish({
      topic: PLURID_PUBSUB_TOPIC.CLOSE_PLANE,
      data: { id: plurid.plane.planeID },
    });
  };

  if (imagenesQuery.loading || projectsQuery.loading) {
    return (
      <section className="detail-plane detail-plane-state" aria-busy="true">
        <p>Loading imagene record…</p>
      </section>
    );
  }

  const error =
    imagenesQuery.error?.message ??
    projectsQuery.error?.message ??
    imagenesQuery.data?.getImagenes.error?.message ??
    projectsQuery.data?.getProjects.error?.message;

  if (error || !imagene) {
    return (
      <section className="detail-plane detail-plane-state">
        <div>
          <p className="eyebrow">Imagene record</p>
          <h2>{error ? 'Could not load this imagene' : 'Imagene not found'}</h2>
          <p>{error ?? 'This record may have been removed from the registry.'}</p>
          <button className="button quiet" type="button" onClick={returnToRegistry}>
            Back to registry
          </button>
        </div>
      </section>
    );
  }

  return (
    <ImageneDetail
      imagene={imagene}
      presentation="plane"
      projectName={project?.name ?? null}
      onClose={returnToRegistry}
    />
  );
};

export default ImagenePlane;
