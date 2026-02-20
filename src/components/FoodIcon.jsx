import { UtensilsCrossed, Beef, Egg, Milk, Wheat, Croissant, Salad, Apple, Banana, Cherry, Grape, Pizza, Sandwich, Coffee, CakeSlice, CupSoda, Fish, Cookie } from 'lucide-react';

export const foodIconMap = {
  utensils: UtensilsCrossed,
  beef: Beef,
  egg: Egg,
  milk: Milk,
  wheat: Wheat,
  croissant: Croissant,
  salad: Salad,
  apple: Apple,
  banana: Banana,
  cherry: Cherry,
  grape: Grape,
  pizza: Pizza,
  sandwich: Sandwich,
  coffee: Coffee,
  cake: CakeSlice,
  'cup-soda': CupSoda,
  fish: Fish,
  cookie: Cookie,
};

export const foodIconKeys = Object.keys(foodIconMap);

export default function FoodIcon({ name, size = 16, className = '' }) {
  const Icon = foodIconMap[name] || UtensilsCrossed;
  return <Icon size={size} className={className} />;
}
