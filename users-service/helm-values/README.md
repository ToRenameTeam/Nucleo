# users-service Helm values

This folder contains Helm overrides for deploying `users-service` and its MongoDB dependency.

## Charts

- Application: `kubernetes/helm-chart/node-chart`
- Database: `kubernetes/helm-chart/mongo-chart`

## Example usage

```bash
helm upgrade --install users-service ../../kubernetes/helm-chart/node-chart \
  -f helm-values/app.values.yaml

helm upgrade --install users-db ../../kubernetes/helm-chart/mongo-chart \
  -f helm-values/mongo.values.yaml
```

