import React from 'react';

function PriceBreakdown({ state, price, onConfirm }) {
    if (!state.court) {
        return (
            <div className="card">
                <h2 style={{ color: '#888' }}>Select a court to see price</h2>
            </div>
        );
    }

    return (
        <div className="card" style={{ position: 'sticky', top: '2rem' }}>
            <h2>Booking Summary</h2>

            <div style={{ margin: '1rem 0', padding: '1rem 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Date</span>
                    <strong>{state.date}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Time</span>
                    <strong>{state.startTime} - {state.endTime}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Equipment Items</span>
                    <strong>{state.equipment.reduce((acc, curr) => acc + curr.quantity, 0)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Coach</span>
                    <strong>{state.coach ? 'Yes' : 'No'}</strong>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>Total Price</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    ${price}
                </span>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={onConfirm}>
                Confirm Booking
            </button>
        </div>
    );
}

export default PriceBreakdown;
