import { Button } from '../../components/common/Button';
import { LANDMARK_NAMES } from '../../types/landmarks';

interface LocalGridPanelProps {
    selected: Set<string>;
    toggleSelection: (id: string) => void;
    selectAll: () => void;
    deselectAll: () => void;
}

export const LocalGridPanel = ({
    selected,
    toggleSelection,
    selectAll,
    deselectAll
}: LocalGridPanelProps): JSX.Element => {
    const handleRowSelect = (landmark: string): void => {
        ['x', 'y', 'z'].forEach(axis => toggleSelection(`${landmark}_${axis}`));
    };

    return (
        <div>
            <div className="settings-section__header">
                <div className="settings-section__header-text">
                    <h3>Local Filter Targeting</h3>
                    <p>Select specific landmarks to apply filter overrides to.</p>
                </div>
            </div>

            <div className="grid-controls">
                <Button variant="secondary" size="small" className="shadow-1" onClick={selectAll}>Select All</Button>
                <Button variant="secondary" size="small" className="shadow-1" onClick={deselectAll}>Deselect All</Button>
                <span className="selection-info-text">{selected.size} active targets</span>
            </div>

            <div className="landmark-table-container">
                <div className="landmark-table-header">
                    <div className="col-joint">Joint / Landmark</div>
                    <div className="col-axis">X</div>
                    <div className="col-axis">Y</div>
                    <div className="col-axis">Z</div>
                    <div className="col-actions">Actions</div>
                </div>

                <div className="landmark-table-body shadow-1">
                    {LANDMARK_NAMES.map(name => (
                        <div className="landmark-table-row" key={name}>
                            <div className="col-joint font-medium capitalize">{name.replace(/_/g, ' ')}</div>
                            {['x', 'y', 'z'].map(axis => {
                                const id = `${name}_${axis}`;
                                return (
                                    <div className="col-axis" key={id}>
                                        <input
                                            type="checkbox"
                                            className="grid-checkbox"
                                            checked={selected.has(id)}
                                            onChange={() => toggleSelection(id)}
                                        />
                                    </div>
                                );
                            })}
                            <div className="col-actions">
                                <Button variant="text" size="small" onClick={() => handleRowSelect(name)}>Select Row</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
