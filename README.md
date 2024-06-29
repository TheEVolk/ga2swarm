# Github Actions to Docker Swarm

Simple Docker Swarm service updater similar to Portainer webhooks.

## Inputs

### `serviceId`

**Description:** The ID of the service  
**Required:** true

### `imageTag`

**Description:** The Docker image tag  
**Required:** false

### `dockerOptions`

**Description:** JSON connection options ([dockerode](https://github.com/apocas/dockerode))  
**Required:** true  
**Hint:** You can use `dockerOptions.privateKeyPath` to specify the path to your private key for secure connections.

## Usage

To use this action, include it in your GitHub Actions workflow YAML file. Below is an example demonstrating how to configure and use this action:

```yaml
name: Update Docker Swarm Service
on:
  push:
    branches:
      - main

jobs:
  update-swarm-service:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Update Docker Swarm Service
        uses: theevolk/ga2swarm
        with:
          serviceId: 'your-service-id'
          imageTag: 'latest'
          dockerOptions: '{"host": "tcp://your-docker-host:2375", "protocol": "https", "privateKeyPath": "/path/to/your/private/key"}'
```

### Example Configuration Details

- **serviceId:** Replace `'your-service-id'` with the actual ID of your Docker Swarm service that you want to update.
- **imageTag:** Replace `'latest'` with the specific Docker image tag you wish to deploy. If not provided, the action will use the default tag.
- **dockerOptions:** Provide the appropriate JSON connection options for connecting to your Docker Swarm manager node. Adjust the host and protocol as needed. Use `dockerOptions.privateKeyPath` to specify the path to your private key for secure connections.

This action simplifies the process of updating a Docker Swarm service directly from your GitHub repository using GitHub Actions.