# Sourcemap Configuration Guide

## Overview
Your React app is already generating sourcemaps! This guide shows you how to optimize and configure them.

## Current Status
✅ Sourcemaps are already being generated in your build output
✅ Development sourcemaps are enabled by default
✅ Production sourcemaps are available but not served by default

## Configuration Options

### 1. Environment Variables
Create a `.env` file in your project root:

```bash
# Enable sourcemaps in production builds
GENERATE_SOURCEMAP=true

# Source map type (cheap-module-source-map is recommended)
REACT_APP_SOURCEMAP_TYPE=cheap-module-source-map
```

### 2. Build Scripts
Use these commands for different sourcemap configurations:

```bash
# Development build with sourcemaps
npm run build:dev

# Production build without sourcemaps (smaller bundle)
npm run build:prod

# Regular build (uses .env settings)
npm run build
```

### 3. Sourcemap Types Explained

| Type | Performance | Accuracy | Use Case |
|------|-------------|----------|----------|
| `eval-source-map` | Fast | High | Development only |
| `cheap-module-source-map` | Medium | High | Development & Production |
| `source-map` | Slow | Highest | Production debugging |
| `cheap-source-map` | Fast | Low | Quick debugging |

### 4. Development vs Production

**Development:**
- Sourcemaps are automatically enabled
- Use `eval-source-map` for fastest rebuilds
- Maps are inlined for better performance

**Production:**
- Sourcemaps are separate `.map` files
- Use `cheap-module-source-map` for balance
- Consider security implications

## Verification

### Check if sourcemaps are working:

1. **Build your app:**
   ```bash
   npm run build:dev
   ```

2. **Check build output:**
   ```bash
   ls -la build/static/js/*.map
   ```

3. **Test in browser:**
   - Open DevTools → Sources tab
   - Look for your original source files
   - Set breakpoints in original code

### Browser DevTools Verification:
1. Open your app in browser
2. Press F12 to open DevTools
3. Go to Sources tab
4. You should see your original source files (not minified)
5. Set breakpoints work in original code

## Security Considerations

**For Production:**
- Sourcemaps expose your source code
- Consider using `GENERATE_SOURCEMAP=false` for production
- Or serve sourcemaps only to authenticated users
- Use different domains for sourcemaps

## Troubleshooting

### Sourcemaps not working?
1. Check if `.map` files exist in build directory
2. Verify browser DevTools settings
3. Clear browser cache
4. Check network tab for 404 errors on `.map` files

### Performance issues?
1. Use `cheap-module-source-map` instead of `source-map`
2. Disable sourcemaps in production
3. Use `eval-source-map` only in development

## Advanced Configuration

If you need more control, you can eject from Create React App:

```bash
npm run eject
```

Then modify `webpack.config.js` for custom sourcemap settings.
