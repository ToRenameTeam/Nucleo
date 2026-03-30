# appointments-service Helm values

This folder contains Helm overrides for deploying `appointments-service` and its PostgreSQL dependency.

## Charts

- Application: `kubernetes/helm-chart/kotlin-chart`
- Database: `kubernetes/helm-chart/postgres-chart`

## Example usage

```bash
helm upgrade --install appointments-db ../../kubernetes/helm-chart/postgres-chart \
  -f helm-values/postgres.values.yaml

helm upgrade --install appointments-service ../../kubernetes/helm-chart/kotlin-chart \
  -f helm-values/app.values.yaml
```

