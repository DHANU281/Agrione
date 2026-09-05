const REPORTS_KEY = 'agrione-disease-reports';

const DEMO_RESPONSE = {
    crop: 'Tomato',
    possibleIssue: 'Early Blight',
    prototypeConfidence: '94%',
    symptoms: [
        'Brown/dark spots on leaves',
        'Yellowing around affected areas',
        'Leaf damage progression'
    ],
    guidance: [
        'Remove severely affected leaves',
        'Maintain proper field hygiene',
        'Avoid unnecessary overhead watering',
        'Consult a qualified agricultural expert before applying treatment'
    ],
    disclaimer: 'AI-assisted prototype result — not a verified agricultural diagnosis.'
};

/**
 * Analysis boundary for a future backend/model integration.
 * A production app should call a server-side endpoint here, with API credentials
 * kept in server environment variables rather than shipped to the browser.
 */
export async function analyzeCropImage(image) {
    if (!image) throw new Error('NO_IMAGE');
    if (image.size > 8 * 1024 * 1024) throw new Error('IMAGE_TOO_LARGE');
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(image.type)) throw new Error('INVALID_FILE');

    // TODO: Replace this delay and response with a backend request such as:
    // fetch('/api/disease/analyze', { method: 'POST', body: formData }).
    await new Promise((resolve) => setTimeout(resolve, 900));
    return { ...DEMO_RESPONSE, analyzedAt: new Date().toISOString(), mode: 'demo' };
}

export function getDiseaseReports() {
    try {
        return JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveDiseaseReport(result) {
    const report = {
        id: 'DR-' + Date.now().toString().slice(-7),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        crop: result.crop,
        possibleIssue: result.possibleIssue,
        prototypeConfidence: result.prototypeConfidence,
        status: 'Demo report',
        ...result
    };
    const reports = [report, ...getDiseaseReports()].slice(0, 20);
    try {
        localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch {
        // The UI can still show the current report when browser storage is unavailable.
    }
    return report;
}
