import React from 'react';
import { ImageBackground, StyleSheet, ViewStyle } from 'react-native';

const bgImage = require('../assets/backgrounds/gonext-bg.png');

interface ScreenBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenBackground({ children, style }: ScreenBackgroundProps) {
  return (
    <ImageBackground
      source={bgImage}
      style={[styles.background, style]}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
