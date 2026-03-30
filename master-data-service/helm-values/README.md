# master-data-service Helm values

This folder contains Helm overrides for deploying `master-data-service` and its MongoDB dependency.

## Charts

- Application: `kubernetes/helm-chart/node-chart`
- Database: `kubernetes/helm-chart/mongo-chart`

## Example usage

```bash
helm upgrade --install master-data-service ../../kubernetes/helm-chart/node-chart \
  -f helm-values/app.values.yaml

helm upgrade --install master-data-db ../../kubernetes/helm-chart/mongo-chart \
  -f helm-values/mongo.values.yaml
```

