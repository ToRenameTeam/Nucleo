export interface WidgetOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'quick' | 'health-metric' | 'health-chart';
}

export type WidgetSelectorProps = {
  isOpen: boolean;
  availableWidgets: WidgetOption[];
  selectedWidgetIds: string[];
}