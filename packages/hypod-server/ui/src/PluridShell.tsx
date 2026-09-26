import {
  PluridApplication,
  type PluridPartialConfiguration,
  type PluridReactPlane,
} from '@plurid/plurid-react';

import ImagenePlane from './ImagenePlane';
import { RegistryConsole } from './RegistryConsole';

const RegistryPlane = () => <RegistryConsole spatial />;

const planes: PluridReactPlane[] = [
  {
    route: '/registry',
    component: RegistryPlane,
  },
  {
    route: '/imagene/:id',
    component: ImagenePlane,
  },
];

const configuration: PluridPartialConfiguration = {
  global: {
    render: 'plurid',
    theme: {
      general: 'plurid',
      interaction: 'plurid',
    },
  },
  elements: {
    plane: {
      controls: {
        show: false,
      },
    },
    toolbar: {
      show: true,
      conceal: false,
      opaque: true,
    },
    viewcube: {
      show: true,
      conceal: false,
      opaque: true,
      buttons: true,
    },
  },
  space: {
    center: true,
    dimensions: {
      width: '100%',
      height: '100dvh',
    },
    opaque: true,
    perspective: 2000,
  },
};

const PluridShell = () => (
  <PluridApplication
    centerView="/registry"
    configuration={configuration}
    id="hypod-registry"
    planes={planes}
    view={['/registry']}
  />
);

export default PluridShell;
