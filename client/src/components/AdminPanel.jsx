import React, { useState, useEffect } from 'react';

function AdminPanel({ onBack }) {
    const [activeTab, setActiveTab] = useState('courts');
    const [data, setData] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch data based on tab
    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            if (activeTab === 'rules') endpoint = '/api/admin/rules';
            else if (activeTab === 'bookings') endpoint = '/api/admin/bookings';
            else endpoint = '/api/resources'; // Reusing resource endpoint for list

            const API_URL = import.meta.env.VITE_API_URL;
            const res = await fetch(`${API_URL}${endpoint}`);
            const result = await res.json();

            if (activeTab === 'courts') setData(result.courts || []);
            else if (activeTab === 'equipment') setData(result.equipment || []);
            else if (activeTab === 'coaches') setData(result.coaches || []);
            else setData(result);

        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleDelete = async (id, type) => {
        if (!confirm('Are you sure?')) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            let endpoint = `/api/admin/${type}/${id}`;
            await fetch(`${API_URL}${endpoint}`, { method: 'DELETE' });
            fetchData();
        } catch (e) { alert(e.message); }
    };

    const handleCreate = async (type, payload) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            let endpoint = `/api/admin/${type}`;
            await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            fetchData();
            // Close modal (simplified: just refresh)
        } catch (e) { alert(e.message); }
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <button className="btn" onClick={onBack}>Exit Admin</button>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {['courts', 'equipment', 'coaches', 'rules'].map(tab => (
                    <button
                        key={tab}
                        className={`btn ${activeTab === tab ? 'btn-primary' : ''}`}
                        onClick={() => setActiveTab(tab)}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? <div>Loading...</div> : (
                <div className="card">
                    {activeTab === 'courts' && <CourtsManager data={data} onCreate={p => handleCreate('courts', p)} onDelete={id => handleDelete(id, 'courts')} />}
                    {activeTab === 'equipment' && <EquipmentManager data={data} onCreate={p => handleCreate('equipment', p)} onDelete={id => handleDelete(id, 'equipment')} />}
                    {activeTab === 'coaches' && <CoachManager data={data} onCreate={p => handleCreate('coaches', p)} onDelete={id => handleDelete(id, 'coaches')} />}
                    {activeTab === 'rules' && <RulesManager data={data} onCreate={p => handleCreate('rules', p)} onDelete={id => handleDelete(id, 'rules')} />}
                </div>
            )}
        </div>
    );
}

// Sub-components for brevity (would actully be separate files in large app)

const CourtsManager = ({ data, onCreate, onDelete }) => {
    const [form, setForm] = useState({ name: '', type: 'INDOOR', basePrice: 100 });
    return (
        <div>
            <h3>Manage Courts</h3>
            <div className="grid grid-cols-3" style={{ margin: '1rem 0' }}>
                <input placeholder="Name" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="INDOOR">Indoor</option>
                    <option value="OUTDOOR">Outdoor</option>
                </select>
                <input type="number" placeholder="Price" className="input" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} />
                <button className="btn btn-primary" onClick={() => onCreate(form)}>Add Court</button>
            </div>
            <ul>
                {data.map(item => (
                    <li key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                        <span>{item.name} ({item.type}) - ${item.basePrice}/hr</span>
                        <button onClick={() => onDelete(item._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const EquipmentManager = ({ data, onCreate, onDelete }) => {
    const [form, setForm] = useState({ name: '', type: 'RACKET', price: 10, quantity: 10 });
    return (
        <div>
            <h3>Manage Equipment</h3>
            <div className="grid grid-cols-2" style={{ margin: '1rem 0' }}>
                <input placeholder="Name" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input placeholder="Price" className="input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                <input placeholder="Qty" className="input" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="RACKET">Racket</option>
                    <option value="SHOES">Shoes</option>
                </select>
                <button className="btn btn-primary" onClick={() => onCreate(form)}>Add Item</button>

            </div>
            <ul>
                {data.map(item => (
                    <li key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                        <span>{item.name} - ${item.price} (Qty: {item.quantity})</span>
                        <button onClick={() => onDelete(item._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const CoachManager = ({ data, onCreate, onDelete }) => {
    const [form, setForm] = useState({ name: '', hourlyRate: 50 });
    return (
        <div>
            <h3>Manage Coaches</h3>
            <div className="grid grid-cols-3" style={{ margin: '1rem 0' }}>
                <input placeholder="Name" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input placeholder="Rate" className="input" type="number" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} />
                <button className="btn btn-primary" onClick={() => onCreate(form)}>Add Coach</button>
            </div>
            <ul>
                {data.map(item => (
                    <li key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                        <span>{item.name} - ${item.hourlyRate}/hr</span>
                        <button onClick={() => onDelete(item._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const RulesManager = ({ data, onCreate, onDelete }) => {
    // Simplified Rule Creator for Peak/Weekend
    const [form, setForm] = useState({
        name: '',
        type: 'PEAK_HOUR',
        value: 1.5,
        adjustmentType: 'MULTIPLIER',
        // flattened conditions for UI
        startTime: '18:00',
        endTime: '21:00',
        days: ''
    });

    const handleSubmit = () => {
        const payload = {
            name: form.name,
            type: form.type,
            value: Number(form.value),
            adjustmentType: form.adjustmentType,
            conditions: {}
        };

        if (form.type === 'PEAK_HOUR') {
            payload.conditions = { startTime: form.startTime, endTime: form.endTime };
        } else if (form.type === 'WEEKEND') {
            payload.conditions = { days: [0, 6] }; // Hardcoded for simplified UI
        }

        onCreate(payload);
    };

    return (
        <div>
            <h3>Pricing Rules</h3>
            <div className="card" style={{ background: '#f9fafb' }}>
                <h4>Add New Rule</h4>
                <div className="grid grid-cols-2">
                    <input placeholder="Rule Name" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                        <option value="PEAK_HOUR">Peak Hours</option>
                        <option value="WEEKEND">Weekend</option>
                    </select>
                    {form.type === 'PEAK_HOUR' && (
                        <>
                            <input type="time" className="input" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                            <input type="time" className="input" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                        </>
                    )}
                    <input type="number" placeholder="Multiplier (e.g 1.5)" className="input" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
                    <button className="btn btn-primary" onClick={handleSubmit}>Create Rule</button>
                </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
                {data.map(item => (
                    <div key={item._id} className="card" style={{ padding: '1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <strong>{item.name}</strong> ({item.type})
                            <br />
                            <small>{item.adjustmentType}: {item.value}x</small>
                        </div>
                        <button onClick={() => onDelete(item._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPanel;
