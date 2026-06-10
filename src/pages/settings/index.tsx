import { useState, useEffect, type ChangeEvent, useRef, type ReactNode } from 'react';
import {
    RiErrorWarningFill, RiSaveFill, RiDownloadFill,
    RiUploadFill, RiRestartLine, RiMagicFill, RiUserLine,
    RiRunLine, RiEqualizerLine, RiArrowRightSLine,
    RiInformationLine, RiCheckLine, RiAddLine,
    RiFileTextLine, RiUploadCloud2Line, RiDeleteBinLine,
    RiSparklingLine
} from "react-icons/ri";
import { DatabaseEngine, type AppSettings, DEFAULT_SETTINGS } from '../../engine/db/DatabaseEngine';
import { LANDMARK_NAMES } from '../../types/landmarks';
import { Button } from '../../components/common/Button';
import { ToggleTabs } from '../../components/common/ToggleTabs';
import { ScrubberBar } from '../../components/common/ScrubberBar';
import { LocalGridPanel } from './LocalGridPanel';
import { TextInput } from '../../components/common/TextInput';
import { SelectInput } from '../../components/common/SelectInput';
import { Toast } from '../../components/common/Toast';
import './style.css';

// --- Pure UI Components ---

interface SectionHeaderProps {
    title: string;
    subtitle: string;
    action?: ReactNode;
}

/** Free-flowing section header with optional right-aligned action. */
const SectionHeader = ({ title, subtitle, action }: SectionHeaderProps): JSX.Element => (
    <div className="settings-section__header">
        <div className="settings-section__header-text">
            <h3>{title}</h3>
            <p>{subtitle}</p>
        </div>
        {action && <div>{action}</div>}
    </div>
);

interface SettingRowProps {
    title: string;
    description: string;
    children: ReactNode;
}

const SettingRow = ({ title, description, children }: SettingRowProps): JSX.Element => (
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

// --- Slider Card ---

interface SliderCardProps {
    title: string;
    value: number;
    min: number;
    max: number;
    step: number;
    lowLabel: string;
    highLabel: string;
    formatValue?: (v: number) => string;
    onChange: (value: number) => void;
}

const SliderCard = ({
    title, value, min, max, step,
    lowLabel, highLabel, formatValue, onChange
}: SliderCardProps): JSX.Element => {
    const displayValue = formatValue ? formatValue(value) : String(value);

    return (
        <div className="settings-slider-card">
            <div className="settings-slider-card__header">
                <span className="settings-slider-card__title">{title}</span>
                <div className="settings-slider-card__info-icon">
                    <RiInformationLine size={14} />
                </div>
            </div>

            <ScrubberBar
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
            />

            <div className="settings-slider-card__labels">
                <span className="settings-slider-card__label">{lowLabel}</span>
                <span className="settings-slider-card__value">{displayValue}</span>
                <span className="settings-slider-card__label">{highLabel}</span>
            </div>

            <div className="settings-slider-card__footer">
                <div className="settings-slider-card__footer-left">
                    <RiSparklingLine size={14} />
                    <span>AI Suggestions</span>
                </div>
                <RiArrowRightSLine size={16} />
            </div>
        </div>
    );
};

// --- Tab definitions ---

type SettingsTab = 'General' | 'Filters' | 'Movements';

const TAB_OPTIONS: { id: SettingsTab; label: string; icon: ReactNode }[] = [
    { id: 'General', label: 'General', icon: <RiUserLine size={16} /> },
    { id: 'Filters', label: 'Filters', icon: <RiEqualizerLine size={16} /> },
    { id: 'Movements', label: 'Movements', icon: <RiRunLine size={16} /> },
];

// --- Section Components ---

const GeneralSection = ({ settings, onChange }: { settings: AppSettings, onChange: (k: keyof AppSettings, v: unknown) => void }): JSX.Element => (
    <div className="settings-section">
        <SectionHeader
            title="Profile Overview"
            subtitle="How you appear in the app and on exported reports."
        />

        <SettingRow title="Display Name" description="Your name as shown across the application.">
            <TextInput
                className="setting-input"
                placeholder="e.g. John Doe"
                value={settings.userName || ''}
                onChange={(e) => onChange('userName', e.target.value)}
            />
        </SettingRow>

        <SettingRow title="Physiotherapist" description="Your assigned healthcare professional.">
            <TextInput
                className="setting-input"
                placeholder="e.g. Dr. Sarah Johnson"
                value={settings.physiotherapist || ''}
                onChange={(e) => onChange('physiotherapist', e.target.value)}
            />
        </SettingRow>

        <SettingRow title="Notes" description="Key information about your rehab or fitness context.">
            <TextInput
                multiline
                resizable
                className="setting-input"
                placeholder="Add context notes here..."
                value={settings.notes || ''}
                onChange={(e) => onChange('notes', e.target.value)}
            />
        </SettingRow>
    </div>
);

interface FiltersSectionProps {
    settings: AppSettings;
    onChange: (key: keyof AppSettings, value: unknown) => void;
    selectedLandmarks: Set<string>;
    toggleLandmark: (id: string) => void;
    selectAllLandmarks: () => void;
    deselectAllLandmarks: () => void;
    handleApplyLocal: () => void;
}

const FiltersSection = ({
    settings,
    onChange,
    selectedLandmarks,
    toggleLandmark,
    selectAllLandmarks,
    deselectAllLandmarks,
    handleApplyLocal
}: FiltersSectionProps): JSX.Element => (
    <div className="settings-section">
        <SectionHeader
            title="Filter Configuration"
            subtitle="Choose your smoothing strategy and algorithm."
        />

        <SettingRow title="Filter Method" description="Apply globally or target specific anatomical joints.">
            <SelectInput
                className="setting-input"
                value={settings.filterMethod}
                onChange={(e) => onChange('filterMethod', e.target.value)}
                options={[
                    { value: 'global', label: 'Global Filtering' },
                    { value: 'local', label: 'Local Overrides' }
                ]}
            />
        </SettingRow>

        {settings.filterMethod === 'local' && (
            <>
                <div className="setting-row">
                    <div className="setting-row__info">
                        <h4>Local Filter Targeting</h4>
                        <p>Select specific landmarks to apply filter overrides to.</p>
                    </div>
                    <div className="setting-row__control">
                        <div className="settings-local-targeting__controls">
                            <Button variant="secondary" size="small" className="shadow-1" onClick={selectAllLandmarks}>Select All</Button>
                            <Button variant="secondary" size="small" className="shadow-1" onClick={deselectAllLandmarks}>Deselect All</Button>
                            <span className="selection-info-text">{selectedLandmarks.size} active targets</span>
                        </div>
                    </div>
                </div>

                <div className="settings-local-targeting__table-section">
                    <LocalGridPanel
                        selected={selectedLandmarks}
                        toggleSelection={toggleLandmark}
                    />
                    {selectedLandmarks.size > 0 && (
                        <div className="settings-local-targeting__apply">
                            <Button variant="secondary" className="shadow-1" onClick={handleApplyLocal}>
                                <RiMagicFill /> Apply to {selectedLandmarks.size} Selected
                            </Button>
                        </div>
                    )}
                </div>
            </>
        )}

        <SettingRow title="Algorithm Type" description="The core mathematical approach used to eliminate coordinate jitter.">
            <SelectInput
                className="setting-input"
                value={settings.filterType}
                onChange={(e) => onChange('filterType', e.target.value)}
                options={[
                    { value: 'OneEuro', label: 'OneEuro (Adaptive)' },
                    { value: 'IIR', label: 'IIR (Feedback)' },
                    { value: 'Freqz', label: 'Freqz (FIR Mask)' }
                ]}
            />
        </SettingRow>

        <SettingRow title="Sample Rate (Hz)" description="Assumed camera capture rate for velocity calculations.">
            <TextInput
                type="number"
                className="setting-input w-24"
                value={settings.sampleRate}
                onChange={(e) => onChange('sampleRate', Number(e.target.value))}
            />
        </SettingRow>
    </div>
);

const OneEuroSliderSection = ({ settings, onChange }: { settings: AppSettings, onChange: (k: keyof AppSettings, v: unknown) => void }): JSX.Element | null => {
    if (settings.filterType !== 'OneEuro') return null;

    return (
        <div className="settings-section">
            <SectionHeader
                title="1-Euro Parameters"
                subtitle="Fine-tune the adaptive smoothing algorithm."
            />

            <div className="settings-slider-grid">
                <SliderCard
                    title="Min Cutoff Frequency"
                    value={settings.mincutoff}
                    min={0.1}
                    max={5.0}
                    step={0.1}
                    lowLabel="SMOOTH"
                    highLabel="RESPONSIVE"
                    formatValue={(v) => v.toFixed(1)}
                    onChange={(v) => onChange('mincutoff', v)}
                />
                <SliderCard
                    title="Speed Coefficient (Beta)"
                    value={settings.beta_}
                    min={0}
                    max={0.01}
                    step={0.0001}
                    lowLabel="SLOW"
                    highLabel="FAST"
                    formatValue={(v) => v.toFixed(4)}
                    onChange={(v) => onChange('beta_', v)}
                />
            </div>
            <div className="settings-slider-grid">
                <SliderCard
                    title="Derivative Cutoff"
                    value={settings.dcutoff}
                    min={0.1}
                    max={5.0}
                    step={0.1}
                    lowLabel="STRICT"
                    highLabel="LOOSE"
                    formatValue={(v) => v.toFixed(1)}
                    onChange={(v) => onChange('dcutoff', v)}
                />
            </div>
        </div>
    );
};

const MovementsSection = ({ settings, onChange }: { settings: AppSettings, onChange: (k: keyof AppSettings, v: unknown) => void }): JSX.Element => (
    <div className="settings-section">
        <SectionHeader
            title="Underarm Throw"
            subtitle="Configure throw detection and analysis logic."
        />

        <div className="settings-control-grid">
            <div className="settings-control-card">
                <span className="settings-control-card__title">Target Throwing Arm</span>
                <span className="settings-control-card__description">Which arm the engine monitors for the release angle.</span>
                <ToggleTabs
                    activeId={settings.throwingArm}
                    onChange={(id) => onChange('throwingArm', id)}
                    options={[
                        { id: 'Left', label: 'Left Arm' },
                        { id: 'Right', label: 'Right Arm' }
                    ]}
                />
            </div>

            <SliderCard
                title="Swing Angle Threshold"
                value={settings.swingAngle}
                min={45}
                max={180}
                step={1}
                lowLabel="NARROW"
                highLabel="WIDE"
                formatValue={(v) => `${v}°`}
                onChange={(v) => onChange('swingAngle', v)}
            />
        </div>
    </div>
);

/** Split layout: title + buttons on left, action list on right. */
const DataManagementSection = ({
    onExport,
    onImportClick,
    onReset
}: {
    onExport: () => void;
    onImportClick: () => void;
    onReset: () => void;
}): JSX.Element => (
    <div className="settings-section">
        <div className="settings-data-layout">
            <div className="settings-data-left">
                <h3>Data Management</h3>
                <p>Import, export, or reset your configuration.</p>
                <div className="settings-data-actions">
                    <Button variant="primary" className="shadow-1" onClick={onExport}>
                        <RiDownloadFill /> Export Settings
                    </Button>
                </div>
            </div>

            <div className="settings-data-list">
                <div className="settings-data-list__item">
                    <div className="settings-data-list__item-left">
                        <div className="settings-data-list__item-icon">
                            <RiUploadCloud2Line size={16} />
                        </div>
                        Import Settings
                    </div>
                    <button
                        className="settings-data-list__item-action settings-data-list__item-action--default"
                        onClick={onImportClick}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
                    >
                        <RiAddLine size={14} /> Import
                    </button>
                </div>
                <div className="settings-data-list__item">
                    <div className="settings-data-list__item-left">
                        <div className="settings-data-list__item-icon">
                            <RiDeleteBinLine size={16} />
                        </div>
                        Reset to Defaults
                    </div>
                    <button
                        className="settings-data-list__item-action settings-data-list__item-action--default"
                        onClick={onReset}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
                    >
                        <RiRestartLine size={14} /> Reset
                    </button>
                </div>
                <div className="settings-data-list__item">
                    <div className="settings-data-list__item-left">
                        <div className="settings-data-list__item-icon">
                            <RiFileTextLine size={16} />
                        </div>
                        Current Config
                    </div>
                    <span className="settings-data-list__item-action settings-data-list__item-action--active">
                        <RiCheckLine size={14} /> Active
                    </span>
                </div>
            </div>
        </div>
    </div>
);

// --- Main Page Component ---

export const SettingsPage = (): JSX.Element => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [originalSettings, setOriginalSettings] = useState<AppSettings | null>(null);
    const [selectedLandmarks, setSelectedLandmarks] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<SettingsTab>('General');
    const [showUnsavedToast, setShowUnsavedToast] = useState<boolean>(false);

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

    useEffect(() => {
        if (settings && originalSettings) {
            const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
            if (hasChanges) {
                setShowUnsavedToast(true);
            } else {
                setShowUnsavedToast(false);
            }
        }
    }, [settings, originalSettings]);

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
                    <div className="settings-header__top-row">
                        <div>
                            <h1>Settings</h1>
                            <p className="settings-header__subtitle">Configure your profile, filters, and movement analysis.</p>
                        </div>
                        <Button
                            variant="primary"
                            className="shadow-1"
                            onClick={handleSave}
                            disabled={!hasUnsavedChanges}
                            style={{ opacity: hasUnsavedChanges ? 1 : 0.5 }}
                        >
                            <RiSaveFill />
                            {hasUnsavedChanges ? "Save Changes" : "Saved"}
                        </Button>
                    </div>
                    <div className="settings-header__tabs">
                        {TAB_OPTIONS.map(tab => (
                            <button
                                key={tab.id}
                                className={`settings-header-tab ${activeTab === tab.id ? 'settings-header-tab--active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                <main>
                    {showUnsavedToast && (
                        <Toast
                            title="Unsaved Changes"
                            message="You have modified your configuration. Remember to save."
                            icon={<RiErrorWarningFill size={24} style={{ color: 'var(--colour-amber-400)' }} />}
                            action={
                                <>
                                    <button 
                                        onClick={() => setShowUnsavedToast(false)} 
                                        style={{ background: 'none', border: 'none', color: 'var(--colour-slate-400)', fontWeight: 500, padding: 0, cursor: 'pointer', fontSize: 'var(--text-sm)' }}
                                    >
                                        Dismiss
                                    </button>
                                    <button 
                                        onClick={() => {
                                            handleSave();
                                            setShowUnsavedToast(false);
                                        }} 
                                        style={{ background: 'none', border: 'none', color: 'var(--colour-white)', fontWeight: 600, padding: 0, cursor: 'pointer', fontSize: 'var(--text-sm)' }}
                                    >
                                        Save changes
                                    </button>
                                </>
                            }
                            duration={5000}
                            onClose={() => setShowUnsavedToast(false)}
                        />
                    )}

                    {activeTab === 'General' && (
                        <GeneralSection settings={settings} onChange={updateSetting} />
                    )}

                    {activeTab === 'Filters' && (
                        <>
                            <FiltersSection
                                settings={settings}
                                onChange={updateSetting}
                                selectedLandmarks={selectedLandmarks}
                                toggleLandmark={toggleLandmark}
                                selectAllLandmarks={selectAllLandmarks}
                                deselectAllLandmarks={() => setSelectedLandmarks(new Set())}
                                handleApplyLocal={handleApplyLocal}
                            />
                            <OneEuroSliderSection settings={settings} onChange={updateSetting} />
                        </>
                    )}

                    {activeTab === 'Movements' && (
                        <MovementsSection settings={settings} onChange={updateSetting} />
                    )}

                    <DataManagementSection
                        onExport={exportJSON}
                        onImportClick={() => fileInputRef.current?.click()}
                        onReset={handleReset}
                    />
                    <input type="file" className="hidden" accept=".json" ref={fileInputRef} onChange={importJSON} />
                </main>
            </div>
        </div>
    );
};