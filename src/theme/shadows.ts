import { Platform, ViewStyle } from 'react-native';

// RN supports a single shadow layer; approximate the DS multi-layer web shadows.
type Shadow = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

function make(color: string, opacity: number, radius: number, y: number, elevation: number): Shadow {
  return Platform.select<Shadow>({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    default: { elevation },
  })!;
}

const INK = '#121114';

// --shadow-card: 0 1px 2px rgba(18,17,20,.04), 0 10px 24px -14px rgba(18,17,20,.14)
export const cardShadow = make(INK, 0.1, 14, 8, 4);
// --shadow-float: 0 8px 20px rgba(18,17,20,.14)
export const floatShadow = make(INK, 0.14, 12, 6, 8);
// --shadow-raised
export const raisedShadow = make(INK, 0.14, 18, 12, 10);
// --shadow-sheet: 0 -12px 40px -12px rgba(18,17,20,.22)
export const sheetShadow = make(INK, 0.18, 22, -10, 16);
