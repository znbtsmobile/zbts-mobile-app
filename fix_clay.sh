find src/ -type f -name "*.tsx" -exec sed -i 's/clay-active//g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/clay-sm/shadow-sm border border-slate-200/g' {} +
find src/ -type f -name "*.tsx" -exec sed -i 's/\bclay\b/shadow-sm border border-slate-200/g' {} +
