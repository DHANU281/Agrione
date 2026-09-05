const configuredDemoMode = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_DEMO_MODE : undefined;
export const demoMode = configuredDemoMode === undefined ? true : configuredDemoMode !== 'false';
export const demoLabel = 'DEMO MODE';
export const demoDisclaimer = 'Information shown here is prototype data and should not be treated as live, verified or guaranteed.';
