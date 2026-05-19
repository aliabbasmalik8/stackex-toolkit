/**
 * Custom Metro transformer that auto-wraps the root _layout.tsx
 * with StackExErrorBoundary at build time. User code is never modified on disk.
 */

const upstreamTransformer = require('@expo/metro-config/babel-transformer');

function isRootLayout(filename) {
  return (
    (filename.includes('app/_layout.tsx') ||
      filename.includes('app/_layout.js')) &&
    !filename.includes('app/(')
  );
}

function wrapWithErrorBoundary(src) {
  const match = src.match(/export\s+default\s+function\s+(\w+)/);
  if (!match) return src;

  const originalName = match[1];

  let transformed = src.replace(
    /export\s+default\s+function\s+(\w+)/,
    `function ${originalName}`,
  );

  transformed =
    `import { StackExErrorBoundary } from '@stackex/toolkit-sdk/lib/dev/error-boundary';\n` +
    transformed;

  transformed += `
export default function StackExRootLayoutWrapper() {
  return (
    <StackExErrorBoundary>
      <${originalName} />
    </StackExErrorBoundary>
  );
}
`;

  return transformed;
}

async function transform(props) {
  if (isRootLayout(props.filename)) {
    const wrapped = wrapWithErrorBoundary(props.src);
    return upstreamTransformer.transform({ ...props, src: wrapped });
  }

  return upstreamTransformer.transform(props);
}

module.exports = { transform };
