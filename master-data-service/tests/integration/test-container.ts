import { GenericContainer, type StartedTestContainer, Wait } from 'testcontainers';

const TEST_MONGO_DB_NAME = 'master_data_integration_test';

export interface MongoTestContainerContext {
  container: StartedTestContainer;
  mongoUri: string;
}

export async function startMongoTestContainer(): Promise<MongoTestContainerContext> {
  const container = await new GenericContainer('mongo:7.0')
    .withExposedPorts(27017)
    .withWaitStrategy(Wait.forLogMessage('Waiting for connections'))
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(27017);
  const mongoUri = `mongodb://${host}:${port}/${TEST_MONGO_DB_NAME}`;

  return {
    container,
    mongoUri,
  };
}

export async function stopMongoTestContainer(container: StartedTestContainer): Promise<void> {
  await container.stop();
}
