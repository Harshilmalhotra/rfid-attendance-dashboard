const fetchDashboardData = async () => {
    const res = await fetch("/api/dashboard");
    return res.json();
};

// Backend route in Express.js:
app.get("/api/dashboard", async (req, res) => {
    const dailyTimeSpent = await db.any(`
        SELECT date, SUM(total_time) AS total_time
        FROM daily_time_spent
        WHERE date >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY date
        ORDER BY date;
    `);

    const occupancy = await db.any(`
        SELECT hour, SUM(count) AS count
        FROM lab_occupancy
        WHERE date = CURRENT_DATE
        GROUP BY hour
        ORDER BY hour;
    `);

    res.json({ dailyTimeSpent, occupancy });
});
