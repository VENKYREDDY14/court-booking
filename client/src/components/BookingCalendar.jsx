import React from 'react';

function BookingCalendar({ date, setDate, startTime, setStartTime, endTime, setEndTime }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="label">Date</label>
                <div className="relative">
                    <input
                        type="date"
                        className="input cursor-pointer"
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="label">Start Time</label>
                <div className="relative">
                    <input
                        type="time"
                        className="input cursor-pointer"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="label">End Time</label>
                <div className="relative">
                    <input
                        type="time"
                        className="input cursor-pointer"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}

export default BookingCalendar;
