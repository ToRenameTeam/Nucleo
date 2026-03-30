# ai-service Helm values

This folder contains Helm overrides for deploying `ai-service`.

## Chart

- Application: `kubernetes/helm-chart/python-chart`

## Example usage

```bash
helm upgrade --install ai-service ../../kubernetes/helm-chart/python-chart \
  -f helm-values/app.values.yaml
```

