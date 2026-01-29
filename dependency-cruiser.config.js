/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // Prevent circular dependencies
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed',
      from: {},
      to: {
        circular: true,
      },
    },

    // Features should not import from other features directly
    {
      name: 'no-cross-feature-imports',
      severity: 'error',
      comment: 'Features should not import from other features. Use shared hooks/components instead.',
      from: {
        path: '^src/features/([^/]+)/',
      },
      to: {
        path: '^src/features/(?!$1)[^/]+/',
      },
    },

    // Pages should not import from other pages
    {
      name: 'no-cross-page-imports',
      severity: 'error',
      comment: 'Pages should not import from other pages',
      from: {
        path: '^src/pages/',
      },
      to: {
        path: '^src/pages/',
        pathNot: '^src/pages/index\\.ts$',
      },
    },

    // Components should not import from features
    {
      name: 'no-component-feature-imports',
      severity: 'warn',
      comment: 'Shared components should not import from features',
      from: {
        path: '^src/components/',
      },
      to: {
        path: '^src/features/',
      },
    },

    // Lib should not import from features or pages
    {
      name: 'no-lib-feature-imports',
      severity: 'error',
      comment: 'Lib (infrastructure) should not import from features or pages',
      from: {
        path: '^src/lib/',
      },
      to: {
        path: '^src/(features|pages)/',
      },
    },
  ],

  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: './tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        theme: {
          graph: { rankdir: 'TB' },
        },
      },
    },
  },
};
