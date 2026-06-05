# Docker Foundation

This Docker setup is a foundation for future local web service deployment.

The current project is a static Web Demo plus local CLI workflow. It does not yet include a production backend server. The Docker image installs dependencies and runs project checks so the deployment foundation is ready for a later private local service.

## Build

```bash
docker compose -f docker/docker-compose.yml build
```

## Check

```bash
docker compose -f docker/docker-compose.yml run --rm short-video-review-tool
```

## Reserved Port

Port `3000` is reserved for a future local web service.
