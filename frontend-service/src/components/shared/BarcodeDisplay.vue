<script setup lang="ts">
interface Props {
  code: string
}

defineProps<Props>()
</script>

<template>
  <svg viewBox="0 0 200 80" class="barcode-svg">
    <!-- Pattern del codice a barre -->
    <rect x="10" y="10" width="3" height="50" class="barcode-bar"/>
    <rect x="15" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="18" y="10" width="2" height="50" class="barcode-bar"/>
    <rect x="22" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="25" y="10" width="4" height="50" class="barcode-bar"/>
    <rect x="31" y="10" width="2" height="50" class="barcode-bar"/>
    <rect x="35" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="38" y="10" width="3" height="50" class="barcode-bar"/>
    <rect x="43" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="46" y="10" width="2" height="50" class="barcode-bar"/>
    <rect x="50" y="10" width="4" height="50" class="barcode-bar"/>
    <rect x="56" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="59" y="10" width="3" height="50" class="barcode-bar"/>
    <rect x="64" y="10" width="2" height="50" class="barcode-bar"/>
    <rect x="68" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="71" y="10" width="4" height="50" class="barcode-bar"/>
    <rect x="77" y="10" width="2" height="50" class="barcode-bar"/>
    <rect x="81" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="84" y="10" width="3" height="50" class="barcode-bar"/>
    <rect x="89" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="92" y="10" width="2" height="50" class="barcode-bar"/>
    <rect x="96" y="10" width="4" height="50" class="barcode-bar"/>
    <rect x="102" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="105" y="10" width="3" height="50" class="barcode-bar"/>
    <rect x="110" y="10" width="2" height="50" class="barcode-bar"/>
    <rect x="114" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="117" y="10" width="4" height="50" class="barcode-bar"/>
    <rect x="123" y="10" width="2" height="50" class="barcode-bar"/>
    <rect x="127" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="130" y="10" width="3" height="50" class="barcode-bar"/>
    <rect x="135" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="138" y="10" width="2" height="50" class="barcode-bar"/>
    <rect x="142" y="10" width="4" height="50" class="barcode-bar"/>
    <rect x="148" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="151" y="10" width="3" height="50" class="barcode-bar"/>
    <rect x="156" y="10" width="2" height="50" class="barcode-bar"/>
    <rect x="160" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="163" y="10" width="4" height="50" class="barcode-bar"/>
    <rect x="169" y="10" width="2" height="50" class="barcode-bar"/>
    <rect x="173" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="176" y="10" width="3" height="50" class="barcode-bar"/>
    <rect x="181" y="10" width="1" height="50" class="barcode-bar"/>
    <rect x="184" y="10" width="2" height="50" class="barcode-bar"/>
    <rect x="188" y="10" width="2" height="50" class="barcode-bar"/>
    
    <!-- Numero sotto il codice a barre -->
    <text x="100" y="72" text-anchor="middle" font-family="monospace" font-size="10" class="barcode-text">
      {{ code }}
    </text>
  </svg>
</template>

<style scoped>
.barcode-svg {
  width: 100%;
  max-width: 300px;
  height: auto;
}

.barcode-bar {
  fill: var(--gray-171717, --black);
}

.barcode-text {
  fill: var(--gray-171717, --black);
}
</style>
