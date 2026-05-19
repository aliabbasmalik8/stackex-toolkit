'use strict';

/**
 * Web polyfill for react-native-maps.
 * Renders a placeholder instead of crashing.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NoopComponent = () => null;

const MapView = React.forwardRef((props, ref) => (
  <View ref={ref} style={[styles.container, props.style]}>
    <Text style={styles.text}>Map preview not available on web</Text>
    {props.children}
  </View>
));
MapView.displayName = 'MapView';

export default MapView;
export const Marker = NoopComponent;
export const Callout = NoopComponent;
export const Polyline = NoopComponent;
export const Polygon = NoopComponent;
export const Circle = NoopComponent;
export const Overlay = NoopComponent;
export const Heatmap = NoopComponent;
export const UrlTile = NoopComponent;
export const WMSTile = NoopComponent;
export const LocalTile = NoopComponent;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = undefined;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  text: {
    color: '#999',
    fontSize: 13,
  },
});
