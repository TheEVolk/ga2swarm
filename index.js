const core = require('@actions/core');
const Docker = require('dockerode');
const fsp = require('fs/promises');

(async () => {
  try {
    let serviceId = core.getInput('serviceId') || process.env.SERVICE_ID;
    const dockerImageTag = core.getInput('imageTag') || process.env.IMAGE_TAG;
    const dockerOptions = JSON.parse(core.getInput('dockerOptions') || process.env.DOCKER_OPTIONS || '{}');
    const privateKeyPath = core.getInput('privateKeyPath') || process.env.PRIVATE_KEY_PATH;
    const privateKey = core.getInput('privateKey') || process.env.PRIVATE_KEY;

    if (privateKeyPath) {
      dockerOptions.sshOptions = dockerOptions.sshOptions || {};
      dockerOptions.sshOptions.privateKey = await fsp.readFile(privateKeyPath)
        .then((v) => v.toString());
    }

    if (privateKey) {
      dockerOptions.sshOptions = dockerOptions.sshOptions || {};
      dockerOptions.sshOptions.privateKey = privateKey;
    }

    core.info('Connecting to docker...');
    const docker = new Docker(dockerOptions);
    await docker.swarmInspect();

    if (serviceId.startsWith('!')) {
      const services = await docker.listServices();
      const foundService = services.find((service) => service.Spec.Name === serviceId.substring(1));
      if (!foundService) {
        throw new Error(`Service "${serviceId.substring(1)}" does not exist`);
      }

      serviceId = foundService.ID;
      core.info(`Resolved service ${serviceId}`);
    }

    /** @type Docker.Service */
    const service = await docker.getService(serviceId).inspect();

    /** @type string */
    let imageName = service.Spec.TaskTemplate.ContainerSpec.Image.split('@sha')[0];
    if (dockerImageTag) {
      if (imageName.includes(':')) {
        imageName = imageName.substring(0, imageName.lastIndexOf(':'));
      }

      imageName = `${imageName}:${dockerImageTag}`;
    }

    core.info(`Pulling image: ${imageName}`);
    await docker.pull(imageName);

    service.Spec.TaskTemplate.ForceUpdate++;
    service.Spec.TaskTemplate.ContainerSpec.Image = imageName;
    await service.update({
      version: service.Version.Index,
      ...service.Spec,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
})();