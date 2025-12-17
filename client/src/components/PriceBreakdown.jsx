import React from 'react';

function PriceBreakdown({ state, price, onConfirm }) {
    if (!state.court) {
        return (
            <div className="card bg-slate-50 border-dashed border-2 border-slate-300 flex items-center justify-center p-8 text-center h-full">
                <div>
                    <div className="text-4xl mb-2">🏷️</div>
                    <h2 className="text-slate-500 font-medium">Select a court to see price estimate</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="card ring-1 ring-slate-900/5 shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
                <span>Booking Summary</span>
                <span className="text-xs font-normal bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">Draft</span>
            </h2>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Date</span>
                    <strong className="text-slate-900">{new Date(state.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Time</span>
                    <strong className="text-slate-900">{state.startTime} - {state.endTime}</strong>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Equipment</span>
                    <strong className="text-slate-900">{state.equipment.reduce((acc, curr) => acc + curr.quantity, 0)} items</strong>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500 text-sm">Coach</span>
                    <strong className="text-slate-900">{state.coach ? 'Yes (+Fees)' : 'No'}</strong>
                </div>
            </div>

            <div className="bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-xl border-t border-slate-100">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-slate-600 font-medium">Total</span>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-indigo-600">${price}</span>
                        <span className="text-slate-400 text-sm block">Diagnostics included</span>
                    </div>
                </div>

                <button
                    className="w-full bg-indigo-600 text-white py-3.5 px-4 rounded-xl font-bold text-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all shadow-lg shadow-indigo-200"
                    onClick={onConfirm}
                >
                    Confirm Booking
                </button>
            </div>
        </div>
    );
}

export default PriceBreakdown;
