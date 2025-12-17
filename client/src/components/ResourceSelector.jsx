import React from 'react';

function ResourceSelector({ resources, selected, onChange }) {

    const handleEquipmentChange = (item, quantity) => {
        // Basic immutable update
        const currentList = [...selected.equipment];
        const index = currentList.findIndex(e => e.item === item._id);

        if (quantity > 0) {
            if (index >= 0) {
                currentList[index] = { item: item._id, quantity: Number(quantity) };
            } else {
                currentList.push({ item: item._id, quantity: Number(quantity) });
            }
        } else {
            if (index >= 0) currentList.splice(index, 1);
        }

        onChange({ equipment: currentList });
    };

    const getQuantity = (itemId) => {
        const found = selected.equipment.find(e => e.item === itemId);
        return found ? found.quantity : 0;
    };

    return (
        <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Equipment</h3>
            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                {resources.equipment.map(item => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', padding: '0.5rem', borderRadius: '6px' }}>
                        <div>
                            <div style={{ fontWeight: 500 }}>{item.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>${item.price} each</div>
                        </div>
                        <input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={getQuantity(item._id)}
                            onChange={(e) => handleEquipmentChange(item, e.target.value)}
                            style={{ width: '60px', padding: '0.2rem' }}
                        />
                    </div>
                ))}
            </div>

            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Coach</h3>
            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                <div
                    className={`coach-card ${selected.coach === null ? 'selected' : ''}`}
                    style={{
                        border: selected.coach === null ? '2px solid var(--primary-color)' : '1px solid #ddd',
                        padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', textAlign: 'center'
                    }}
                    onClick={() => onChange({ coach: null })}
                >
                    No Coach
                </div>
                {resources.coaches.map(coach => (
                    <div
                        key={coach._id}
                        style={{
                            border: selected.coach === coach._id ? '2px solid var(--primary-color)' : '1px solid #ddd',
                            padding: '0.5rem', borderRadius: '6px', cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                        onClick={() => onChange({ coach: coach._id })}
                    >
                        <span>{coach.name}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>${coach.hourlyRate}/hr</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ResourceSelector;
