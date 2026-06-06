import { useState, useEffect, type ChangeEvent, useRef } from 'react';
import {
    RiErrorWarningLine, RiSaveLine, RiDownloadLine,
    RiUploadLine, RiRestartLine, RiMagicLine
} from "react-icons/ri";
import { DatabaseEngine, type AppSettings, DEFAULT_SETTINGS } from '../../engine/db/DatabaseEngine';
import { LANDMARK_NAMES } from '../../types/landmarks';
import { Button } from '../../components/common/Button';
import { ToggleTabs } from '../../components/common/ToggleTabs';
import './style.css';

// --- Pure UI Components ---

const SettingsTabs = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }): JSX.Element => (
    <nav className="settings-tabs">
        {['General', 'Filters', 'Movements'].map(tab => (
            <button
                key={tab}
                className={`settings-tab ${activeTab === tab ? 'settings-tab--active' : ''}`}
                onClick={() => onTabChange(tab)}
            >
                {tab}
            </button>
        ))}
    </nav>
);

const SettingRow = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }): JSX.Element => (
    <div className="setting-row">
        <div className="setting-row__info">
            <h4>{title}</h4>
            <p>{description}</p>
        </div>
        <div className="setting-row__control">
            {children}
        </div>
    </div>
);

// --- Section Components ---

const GeneralSection = ({ settings, onChange }: { settings: AppSettings, onChange: (k: keyof AppSettings, v: unknown) => void }): JSX.Element => (
    <div className="settings-section">
        <h3 className="settings-section__title">Profile Overview</h3>

        <SettingRow title="Display Name" description="Your name will be displayed on the sidebar and used in your generated assessment reports.">
            <input
                type="text"
                className="setting-input"
                placeholder="e.g. John Doe"
                value={settings.userName || ''}
                onChange={(e) => onChange('userName', e.target.value)}
            />
        </SettingRow>
    </div>
);

const FiltersSection = ({ settings, onChange }: { settings: AppSettings, onChange: (k: keyof AppSettings, v: unknown) => void }): JSX.Element => (
    <div className="settings-section">
        <h3 className="settings-section__title">Basics</h3>

        <SettingRow title="Filter Method" description="Apply globally or target specific anatomical joints.">
            <select className="setting-input" value={settings.filterMethod} onChange={(e) => onChange('filterMethod', e.target.value)}>
                <option value="global">Global Filtering</option>
                <option value="local">Local Overrides</option>
            </select>
        </SettingRow>

        <SettingRow title="Algorithm Type" description="The core mathematical approach used to eliminate coordinate jitter.">
            <select className="setting-input" value={settings.filterType} onChange={(e) => onChange('filterType', e.target.value)}>
                <option value="OneEuro">OneEuro (Adaptive)</option>
                <option value="IIR">IIR (Feedback)</option>
                <option value="Freqz">Freqz (FIR Mask)</option>
            </select>
        </SettingRow>

        <SettingRow title="Sample Rate (Hz)" description="Assumed camera capture rate for velocity calculations.">
            <input type="number" className="setting-input w-24" value={settings.sampleRate} onChange={(e) => onChange('sampleRate', Number(e.target.value))} />
        </SettingRow>
    </div>
);

const AlgorithmSection = ({ settings, onChange }: { settings: AppSettings, onChange: (k: keyof AppSettings, v: unknown) => void }): JSX.Element => {
    if (settings.filterType !== 'OneEuro') return <></>;

    return (
        <div className="settings-section">
            <h3 className="settings-section__title">1-Euro Parameters</h3>

            <SettingRow title="Min Cutoff Frequency" description="Lower values increase smoothing but introduce motion lag.">
                <input type="number" className="setting-input w-24" step="0.1" value={settings.mincutoff} onChange={(e) => onChange('mincutoff', Number(e.target.value))} />
            </SettingRow>

            <SettingRow title="Speed Coefficient (Beta)" description="Higher values force faster snapping to sudden movements.">
                <input type="number" className="setting-input w-24" step="0.0001" value={settings.beta_} onChange={(e) => onChange('beta_', Number(e.target.value))} />
            </SettingRow>

            <SettingRow title="Derivative Cutoff" description="Strictness of internal speed estimation.">
                <input type="number" className="setting-input w-24" step="0.1" value={settings.dcutoff} onChange={(e) => onChange('dcutoff', Number(e.target.value))} />
            </SettingRow>
        </div>
    );
};

const ThrowSettingsPanel = ({ settings, onChange }: { settings: AppSettings, onChange: (k: keyof AppSettings, v: any) => void }): JSX.Element => {
    const min = 45;
    const max = 180;
    const percent = ((settings.swingAngle - min) / (max - min)) * 100;

    return (
        <div className="settings-section">
            <h3 className="settings-section__title">Underarm Throw Logic</h3>

            <SettingRow title="Target Throwing Arm" description="Select which arm the engine should monitor for the release angle.">
                <ToggleTabs
                    activeId={settings.throwingArm}
                    onChange={(id) => onChange('throwingArm', id)}
                    options={[
                        { id: 'Left', label: 'Left Arm' },
                        { id: 'Right', label: 'Right Arm' }
                    ]}
                />
            </SettingRow>

            <SettingRow title="Swing Angle Threshold" description="Degrees required to register a valid forward throw motion.">
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
            </SettingRow>
        </div>
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
        <div className="settings-section">
            <h3 className="settings-section__title">Local Filter Targeting</h3>

            <div className="grid-controls">
                <Button variant="secondary" size="small" onClick={selectAll}>Select All</Button>
                <Button variant="secondary" size="small" onClick={deselectAll}>Deselect All</Button>
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
                                <Button variant="text" size="small" onClick={() => handleRowSelect(name)}>All</Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export const SettingsPage = (): JSX.Element => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [originalSettings, setOriginalSettings] = useState<AppSettings | null>(null);
    const [selectedLandmarks, setSelectedLandmarks] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<string>('General'); // Default to General now

    const dbRef = useRef(new DatabaseEngine());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initialiseSettings = async (): Promise<void> => {
        const data = await dbRef.current.loadSettings();
        setSettings(data);
        setOriginalSettings(JSON.parse(JSON.stringify(data)));
    };

    useEffect(() => {
        initialiseSettings();
    }, []);

    const updateSetting = (key: keyof AppSettings, value: unknown): void => {
        if (settings) setSettings({ ...settings, [key]: value });
    };

    const handleSave = async (): Promise<void> => {
        if (!settings) return;
        await dbRef.current.saveSettings(settings);
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
    };

    const handleReset = async (): Promise<void> => {
        setSettings(DEFAULT_SETTINGS);
        await dbRef.current.saveSettings(DEFAULT_SETTINGS);
        setOriginalSettings(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));
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
                const merged = { ...DEFAULT_SETTINGS, ...imported };
                setSettings(merged);
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

    if (!settings) return <div className="settings-layout">Loading...</div>;

    const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

    return (
        <div className="settings-layout">
            <div className="settings-container">

                <header className="settings-header">
                    <div className="settings-header__top">
                        <h1>Settings</h1>
                        <div className="settings-global-actions">
                            <Button variant="secondary" onClick={exportJSON}>
                                <RiDownloadLine className="inline-icon" /> Export
                            </Button>
                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                                <RiUploadLine className="inline-icon" /> Import
                            </Button>
                            <input type="file" className="hidden" accept=".json" ref={fileInputRef} onChange={importJSON} />
                        </div>
                    </div>
                    <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </header>

                <main className="settings-content">
                    {hasUnsavedChanges && (
                        <div className="settings-banner">
                            <div className="settings-banner__icon"><RiErrorWarningLine size={24} /></div>
                            <div className="settings-banner__content">
                                <h3>Unsaved Changes</h3>
                                <p>You have modified your configuration. Remember to save below.</p>
                            </div>
                        </div>
                    )}

                    {/* General Tab */}
                    {activeTab === 'General' && (
                        <GeneralSection settings={settings} onChange={updateSetting} />
                    )}

                    {/* Filters Tab */}
                    {activeTab === 'Filters' && (
                        <>
                            <FiltersSection settings={settings} onChange={updateSetting} />
                            <AlgorithmSection settings={settings} onChange={updateSetting} />
                            {settings.filterMethod === 'local' && (
                                <LocalGridPanel
                                    selected={selectedLandmarks}
                                    toggleSelection={toggleLandmark}
                                    selectAll={selectAllLandmarks}
                                    deselectAll={() => setSelectedLandmarks(new Set())}
                                />
                            )}
                        </>
                    )}

                    {/* Movements Tab */}
                    {activeTab === 'Movements' && (
                        <ThrowSettingsPanel settings={settings} onChange={updateSetting} />
                    )}

                    <div className="settings-footer">
                        <Button variant="text" className="text-danger" onClick={handleReset}>
                            <RiRestartLine className="inline-icon" /> Reset to Defaults
                        </Button>

                        <div className="settings-action-bar__right">
                            {settings.filterMethod === 'local' && selectedLandmarks.size > 0 && activeTab === 'Filters' && (
                                <Button variant="secondary" onClick={handleApplyLocal}>
                                    <RiMagicLine className="inline-icon" /> Apply to {selectedLandmarks.size} Selected
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                disabled={!hasUnsavedChanges}
                                style={{ opacity: hasUnsavedChanges ? 1 : 0.5 }}
                            >
                                <RiSaveLine className="inline-icon" />
                                {hasUnsavedChanges ? "Save Changes" : "Saved"}
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};