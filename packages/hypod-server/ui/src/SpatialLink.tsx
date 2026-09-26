import { PluridLink } from '@plurid/plurid-react';
import type { PropsWithChildren } from 'react';

interface SpatialLinkProperties extends PropsWithChildren {
  route: string;
}

const SpatialLink = ({ children, route }: SpatialLinkProperties) => (
  <PluridLink className="text-button spatial-link" preview={false} route={route} suffix="">
    {children}
  </PluridLink>
);

export default SpatialLink;
