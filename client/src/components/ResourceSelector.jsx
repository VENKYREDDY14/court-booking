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
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <span>🎾</span> Equipment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.equipment.map(item => {
                        const qty = getQuantity(item._id);
                        return (
                            <div
                                key={item._id}
                                className={`
                                    flex flex-col justify-between p-4 rounded-xl border-2 transition-all
                                    ${qty > 0 ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-slate-300'}
                                `}
                            >
                                <div className="mb-4">
                                    <div className="font-semibold text-slate-900">{item.name}</div>
                                    <div className="text-sm text-slate-500">${item.price} <span className="text-xs">/ session</span></div>
                                </div>
                                <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-1">
                                    <button
                                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                        onClick={() => handleEquipmentChange(item, Math.max(0, qty - 1))}
                                    >-</button>
                                    <span className="font-medium w-8 text-center text-slate-900">{qty}</span>
                                    <button
                                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                        onClick={() => handleEquipmentChange(item, Math.min(item.quantity, qty + 1))}
                                    >+</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <span>👨‍🏫</span> Coach
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div
                        className={`
                            p-4 rounded-xl cursor-pointer text-center border-2 transition-all flex flex-col items-center justify-center h-24
                            ${selected.coach === null
                                ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }
                        `}
                        onClick={() => onChange({ coach: null })}
                    >
                        <span className="font-medium">No Coach</span>
                    </div>
                    {resources.coaches.map(coach => (
                        <div
                            key={coach._id}
                            className={`
                                p-4 rounded-xl cursor-pointer border-2 transition-all flex flex-col justify-between h-24
                                ${selected.coach === coach._id
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                                    : 'border-slate-200 hover:bg-slate-50'
                                }
                            `}
                            onClick={() => onChange({ coach: coach._id })}
                        >
                            <span className="font-semibold">{coach.name}</span>
                            <span className="text-sm bg-white/50 px-2 py-1 rounded self-start font-medium">${coach.hourlyRate}/hr</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ResourceSelector;
