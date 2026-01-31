<script setup lang="ts">
/**
 * CardList - Componente riutilizzabile per liste di card
 * 
 * Usato per garantire una presentazione uniforme delle card in:
 * - Homepage: Prossimi appuntamenti, Documenti recenti
 * - Pagina Documenti
 * - Pagina Calendario/Appuntamenti
 */

export interface CardListProps {
  /** Gap tra le card (default: 1rem) */
  gap?: 'sm' | 'md' | 'lg'
  /** Direzione del layout (default: column) */
  direction?: 'column' | 'row'
  /** Classe CSS aggiuntiva */
  class?: string
}

withDefaults(defineProps<CardListProps>(), {
  gap: 'md',
  direction: 'column'
})
</script>

<template>
  <div 
    class="card-list"
    :class="[
      `card-list--gap-${gap}`,
      `card-list--${direction}`
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.card-list {
  display: flex;
  width: 100%;
  min-width: 0;
}

/* Direction variants */
.card-list--column {
  flex-direction: column;
}

.card-list--row {
  flex-direction: row;
  flex-wrap: wrap;
}

/* Gap variants */
.card-list--gap-sm {
  gap: 0.75rem;
}

.card-list--gap-md {
  gap: 1rem;
}

.card-list--gap-lg {
  gap: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .card-list--gap-sm {
    gap: 0.5rem;
  }

  .card-list--gap-md {
    gap: 0.75rem;
  }

  .card-list--gap-lg {
    gap: 1rem;
  }
}
</style>
