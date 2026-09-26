import { createHypod, type HypodApplication, type HypodAddress } from './application';
import { LegacyHypodLogicAdapter, type HypodLogic } from './access/legacy-hypod-logic';
import type { HypodConfigInput } from './config/config';

class LegacyHypodServer {
  #logic: HypodLogic | undefined;
  #application: HypodApplication | undefined;
  #configuration: HypodConfigInput = {};

  public setup(logic?: HypodLogic): this {
    this.#logic = logic;
    return this;
  }

  public configure(configuration: HypodConfigInput): this {
    this.#configuration = { ...this.#configuration, ...configuration };
    return this;
  }

  public async start(port?: number | string): Promise<HypodAddress> {
    if (this.#application) return this.#application.start();
    const parsedPort =
      typeof port === 'string' && port !== ''
        ? Number(port)
        : typeof port === 'number'
          ? port
          : undefined;
    const accessPolicy = this.#logic ? new LegacyHypodLogicAdapter(this.#logic) : undefined;
    this.#application = await createHypod({
      ...this.#configuration,
      ...(parsedPort === undefined ? {} : { port: parsedPort }),
      ...(accessPolicy ? { mode: 'custom', accessPolicy } : {}),
    });
    return this.#application.start();
  }

  public async stop(): Promise<void> {
    await this.#application?.stop();
    this.#application = undefined;
  }

  public get application(): HypodApplication | undefined {
    return this.#application;
  }
}

const hypodServer = new LegacyHypodServer();

export const hypodSetup = (logic?: HypodLogic): LegacyHypodServer => hypodServer.setup(logic);

export { LegacyHypodServer, hypodServer };
