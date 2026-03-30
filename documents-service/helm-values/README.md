# documents-service Helm values

This folder contains Helm overrides for deploying `documents-service` and its data dependencies.

## Charts

- Application: `kubernetes/helm-chart/kotlin-chart`
- MongoDB: `kubernetes/helm-chart/mongo-chart`
- AI Service: `kubernetes/helm-chart/python-chart`

> MinIO is referenced as an existing in-cluster service (`minio:9000`).

## Example usage

```bash
helm upgrade --install documents-db ../../kubernetes/helm-chart/mongo-chart \
  -f helm-values/mongo.values.yaml

helm upgrade --install ai-service ../../kubernetes/helm-chart/python-chart \
  -f ../ai-service/helm-values/app.values.yaml

helm upgrade --install documents-service ../../kubernetes/helm-chart/kotlin-chart \
  -f helm-values/app.values.yaml
```

