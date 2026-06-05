import { useState, useEffect, type ChangeEvent, useRef } from 'react';
import {
    RiSettings3Line, RiDownloadLine, RiUploadLine,
    RiSaveLine, RiMagicLine, RiRestartLine
} from "react-icons/ri";
import { DatabaseEngine, type AppSettings, DEFAULT_SETTINGS } from '../../engine/db/DatabaseEngine';
import { LANDMARK_NAMES } from '../../types/landmarks';
import './style.css';

// --- Sub-components ---

const FilterConfigurationPanel = ({ settings, onChange }: { settings: AppSettings, onChange: (k: keyof AppSettings, v: any) => void }): JSX.Element => {
    const handleArrayChange = (e: ChangeEvent<HTMLInputElement>, key: keyof AppSettings) => {
        const values = e.target.value.split(',').map(v => parseFloat(v.trim()) || 0);
        onChange(key, values);
    };

    return (
        <section className="settings-section">
            <div className="settings-section__header">
                <h2>Filter Configuration</h2>
                <p>Adjust the mathematical smoothing applied to the raw skeletal tracking data.</p>
            </div>

            <div className="settings-group">
                <div className="setting-item">
                    <div className="setting-item__info">
                        <label>Filter Method</label>
                        <p><strong>Global:</strong> Apply the same algorithm to all joints. <strong>Local:</strong> Target specific joints.</p>
                    </div>
                    <select className="setting-input" value={settings.filterMethod} onChange={(e) => onChange('filterMethod', e.target.value)}>
                        <option value="global">Global</option>
                        <option value="local">Local</option>
                    </select>
                </div>

                <div className="setting-item">
                    <div className="setting-item__info">
                        <label>Filter Algorithm</label>
                        <p>The core mathematical approach used to eliminate coordinate jitter.</p>
                    </div>
                    <select className="setting-input" value={settings.filterType} onChange={(e) => onChange('filterType', e.target.value)}>
                        <option value="OneEuro">1-Euro (Adaptive Smoothing)</option>
                        <option value="IIR">IIR (Feedforward / Feedback)</option>
                        <option value="Freqz">Freqz (FIR Mask)</option>
                    </select>
                </div>

                <div className="setting-item">
                    <div className="setting-item__info">
                        <label>Sample Rate (Hz)</label>
                        <p>The assumed camera capture rate used for velocity calculations.</p>
                    </div>
                    <input type="number" className="setting-input" value={settings.sampleRate} onChange={(e) => onChange('sampleRate', Number(e.target.value))} />
                </div>

                {/* Flattened Conditional Parameters for OneEuro */}
                {settings.filterType === 'OneEuro' && (
                    <>
                        <div className="setting-item">
                            <div className="setting-item__info">
                                <label>Min Cutoff Frequency</label>
                                <p>Lower values increase smoothing but introduce more lag during slow movements.</p>
                            </div>
                            <input type="number" className="setting-input" step="0.1" value={settings.mincutoff} onChange={(e) => onChange('mincutoff', Number(e.target.value))} />
                        </div>
                        <div className="setting-item">
                            <div className="setting-item__info">
                                <label>Beta (Speed Coefficient)</label>
                                <p>Higher values force the skeleton to snap faster to sudden, rapid movements.</p>
                            </div>
                            <input type="number" className="setting-input" step="0.0001" value={settings.beta_} onChange={(e) => onChange('beta_', Number(e.target.value))} />
                        </div>
                        <div className="setting-item">
                            <div className="setting-item__info">
                                <label>Derivative Cutoff</label>
                                <p>Controls the strictness of the internal speed estimation.</p>
                            </div>
                            <input type="number" className="setting-input" step="0.1" value={settings.dcutoff} onChange={(e) => onChange('dcutoff', Number(e.target.value))} />
                        </div>
                    </>
                )}

                {/* Flattened Conditional Parameters for IIR */}
                {settings.filterType === 'IIR' && (
                    <>
                        <div className="setting-item">
                            <div className="setting-item__info">
                                <label>IIR B Coefficients</label>
                                <p>Feedforward coefficients (comma-separated).</p>
                            </div>
                            <input type="text" className="setting-input" value={settings.IIRB.join(', ')} onChange={(e) => handleArrayChange(e, 'IIRB')} />
                        </div>
                        <div className="setting-item">
                            <div className="setting-item__info">
                                <label>IIR A Coefficients</label>
                                <p>Feedback coefficients (comma-separated).</p>
                            </div>
                            <input type="text" className="setting-input" value={settings.IIRA.join(', ')} onChange={(e) => handleArrayChange(e, 'IIRA')} />
                        </div>
                    </>
                )}

                {/* Flattened Conditional Parameters for Freqz */}
                {settings.filterType === 'Freqz' && (
                    <>
                        <div className="setting-item">
                            <div className="setting-item__info">
                                <label>FFT Granularity</label>
                                <p>Must be a power of 2 (e.g., 128, 256, 512).</p>
                            </div>
                            <input type="number" className="setting-input" value={settings.fftGranularity} onChange={(e) => onChange('fftGranularity', Number(e.target.value))} />
                        </div>
                        <div className="setting-item">
                            <div className="setting-item__info">
                                <label>Frequency Response</label>
                                <p>Real/imaginary sequence pairs (comma-separated).</p>
                            </div>
                            <input type="text" className="setting-input" value={settings.freqResponse.join(', ')} onChange={(e) => handleArrayChange(e, 'freqResponse')} />
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

const ThrowSettingsPanel = ({ settings, onChange }: { settings: AppSettings, onChange: (k: keyof AppSettings, v: any) => void }): JSX.Element => {
    const min = 45;
    const max = 180;
    const percent = ((settings.swingAngle - min) / (max - min)) * 100;

    return (
        <section className="settings-section">
            <div className="settings-section__header">
                <h2>Underarm Throw Logic</h2>
                <p>Specific thresholds and targets for the underarm throw evaluation engine.</p>
            </div>

            <div className="settings-group">
                <div className="setting-item">
                    <div className="setting-item__info">
                        <label>Target Throwing Arm</label>
                        <p>Select which arm the engine should monitor for the release angle.</p>
                    </div>
                    <div className="arm-toggle-group">
                        <button
                            className={`btn ${settings.throwingArm === 'Left' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => onChange('throwingArm', 'Left')}
                        >Left</button>
                        <button
                            className={`btn ${settings.throwingArm === 'Right' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => onChange('throwingArm', 'Right')}
                        >Right</button>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-item__info">
                        <label>Swing Angle Threshold</label>
                        <p>Degrees required to register a valid forward throw motion.</p>
                    </div>
                    <div className="swing-slider-container">
                        <input
                            type="range"
                            className="swing-slider"
                            min={min} max={max}
                            value={settings.swingAngle}
                            onChange={(e) => onChange('swingAngle', Number(e.target.value))}
                            style={{ background: `linear-gradient(to right, var(--colour-zinc-800) 0%, var(--colour-zinc-800) ${percent}%, var(--colour-zinc-200) ${percent}%, var(--colour-zinc-200) 100%)` }}
                        />
                        <span className="swing-slider__value">{settings.swingAngle}°</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

const LocalGridPanel = ({
                            selected,
                            toggleSelection,
                            selectAll,
                            deselectAll
                        }: {
    selected: Set<string>,
    toggleSelection: (id: string) => void,
    selectAll: () => void,
    deselectAll: () => void
}): JSX.Element => {
    const handleRowSelect = (landmark: string) => {
        ['x', 'y', 'z'].forEach(axis => toggleSelection(`${landmark}_${axis}`));
    };

    return (
        <section className="settings-section">
            <div className="settings-section__header">
                <h2>Local Filter Targeting</h2>
                <p>Select specific coordinates to override with the current filter settings above.</p>
            </div>

            <div className="grid-controls">
                <button className="btn btn-secondary btn-sm" onClick={selectAll}>Select All</button>
                <button className="btn btn-secondary btn-sm" onClick={deselectAll}>Deselect All</button>
                <span className="selection-info-text">{selected.size} active targets</span>
            </div>

            <div className="landmark-grid-wrapper shadow-1">
                <table className="landmark-grid">
                    <thead>
                    <tr>
                        <th>Joint / Landmark</th>
                        <th>X</th>
                        <th>Y</th>
                        <th>Z</th>
                        <th>Row</th>
                    </tr>
                    </thead>
                    <tbody>
                    {LANDMARK_NAMES.map(name => (
                        <tr key={name}>
                            <td className="font-medium capitalize">{name.replace(/_/g, ' ')}</td>
                            {['x', 'y', 'z'].map(axis => {
                                const id = `${name}_${axis}`;
                                return (
                                    <td key={id}>
                                        <input
                                            type="checkbox"
                                            className="grid-checkbox"
                                            checked={selected.has(id)}
                                            onChange={() => toggleSelection(id)}
                                        />
                                    </td>
                                );
                            })}
                            <td>
                                <button className="btn-text text-sm" onClick={() => handleRowSelect(name)}>All</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

// --- Main Page Component ---

export const SettingsPage = (): JSX.Element => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [selectedLandmarks, setSelectedLandmarks] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dbRef = useRef(new DatabaseEngine());

    useEffect(() => {
        const init = async () => setSettings(await dbRef.current.loadSettings());
        init();
    }, []);

    const updateSetting = (key: keyof AppSettings, value: any): void => {
        if (settings) setSettings({ ...settings, [key]: value });
    };

    const handleSave = async (): Promise<void> => {
        if (settings) await dbRef.current.saveSettings(settings);
    };

    const handleReset = async (): Promise<void> => {
        setSettings(DEFAULT_SETTINGS);
        await dbRef.current.saveSettings(DEFAULT_SETTINGS);
    };

    const handleApplyLocal = (): void => {
        if (!settings) return;
        const currentConfig = {
            filterType: settings.filterType,
            sampleRate: settings.sampleRate,
            mincutoff: settings.mincutoff,
            beta_: settings.beta_,
            dcutoff: settings.dcutoff,
            IIRB: settings.IIRB,
            IIRA: settings.IIRA,
            fftGranularity: settings.fftGranularity,
            freqResponse: settings.freqResponse
        };

        const updatedLocal = { ...settings.localFilters };
        selectedLandmarks.forEach(id => { updatedLocal[id] = currentConfig; });
        updateSetting('localFilters', updatedLocal);
        setSelectedLandmarks(new Set());
    };

    const exportJSON = (): void => {
        if (!settings) return;
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'movesense_settings.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importJSON = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                setSettings({ ...DEFAULT_SETTINGS, ...imported });
            } catch (err) {
                console.error("Failed to parse settings JSON");
            }
        };
        reader.readAsText(file);
    };

    const toggleLandmark = (id: string): void => {
        const next = new Set(selectedLandmarks);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedLandmarks(next);
    };

    const selectAllLandmarks = (): void => {
        const all = new Set<string>();
        LANDMARK_NAMES.forEach(name => ['x', 'y', 'z'].forEach(axis => all.add(`${name}_${axis}`)));
        setSelectedLandmarks(all);
    };

    if (!settings) return <div className="p-8 text-zinc-500">Loading configurations...</div>;

    return (
        <div className="learn-page relative h-full flex flex-col bg-zinc-50">
            <header className="learn-page__header shrink-0 bg-white shadow-sm z-10">
                <div className="learn-page__header-left">
                    <h1 className="learn-title">Preferences</h1>
                </div>
                <div className="learn-page__header-right">
                    <button className="btn btn-secondary btn-sm" onClick={exportJSON}>
                        <RiDownloadLine /> Export JSON
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
                        <RiUploadLine /> Import JSON
                    </button>
                    {/*<input type="file" className="hidden" accept=".json" ref={fileInputRef} onChange={importJSON} />*/}
                </div>
            </header>

            <main className="settings-scroll-container">
                <div className="settings-content-wrapper">
                    <FilterConfigurationPanel settings={settings} onChange={updateSetting} />
                    <hr className="settings-divider" />

                    {settings.filterMethod === 'local' && (
                        <>
                            <LocalGridPanel
                                selected={selectedLandmarks}
                                toggleSelection={toggleLandmark}
                                selectAll={selectAllLandmarks}
                                deselectAll={() => setSelectedLandmarks(new Set())}
                            />
                            <hr className="settings-divider" />
                        </>
                    )}

                    <ThrowSettingsPanel settings={settings} onChange={updateSetting} />
                </div>
            </main>

            {/* Sticky Action Bar at the bottom */}
            <div className="settings-action-bar">
                <div className="settings-action-bar__content">
                    <button className="btn btn-danger btn-outline" onClick={handleReset}>
                        <RiRestartLine /> Reset Defaults
                    </button>

                    <div className="settings-action-bar__right">
                        {settings.filterMethod === 'local' && selectedLandmarks.size > 0 && (
                            <button className="btn btn-secondary shadow-1" onClick={handleApplyLocal}>
                                <RiMagicLine /> Apply to {selectedLandmarks.size} Selected
                            </button>
                        )}
                        <button className="btn btn-primary shadow-1" onClick={handleSave}>
                            <RiSaveLine /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};