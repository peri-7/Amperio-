const db = require('../config/db'); 

class AdminStatsModel {
    
   static async MonthlyFinancial(monthsLimit = 12) {
    const sql = `
        SELECT 
            DATE_FORMAT(start_time, '%b %Y') AS month_label,
           ROUND(SUM(energy_delivered * price_per_kwh), 2) AS revenue,
            ROUND(SUM(wholesale_cost), 2) AS cost
        FROM Session
        WHERE start_time >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY YEAR(start_time), MONTH(start_time), month_label
        ORDER BY YEAR(start_time), MONTH(start_time)
    `;
    const [rows] = await db.execute(sql, [monthsLimit]);
    return rows;
}

    static async RevenueByStation() {
        const query = `
            SELECT 
                st.station_name, 
                ROUND(SUM(s.energy_delivered * s.price_per_kwh),2) AS total_revenue
            FROM Session s
            JOIN Charger c ON s.charger_id = c.charger_id
            JOIN Station st ON c.station_id = st.station_id
            GROUP BY st.station_id
            ORDER BY total_revenue DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
    
    static async EnergyDemandHeatmap() {
        const sql = `
            SELECT 
                DAYNAME(start_time) AS day,
                HOUR(start_time) AS hour,
                ROUND(AVG(energy_delivered), 2) AS average_energy
            FROM Session
            GROUP BY day, hour
            ORDER BY FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), hour
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }

    static async PowerEfficiency() {
        const sql = `
            SELECT 
                c.power AS charger_power,
                ROUND(AVG(s.energy_delivered), 1) AS avg_energy
            FROM Session s
            JOIN Charger c ON s.charger_id = c.charger_id
            GROUP BY c.power
            ORDER BY c.power ASC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }

        static async GetChargerList() {
        const sql = `
            SELECT c.charger_id, s.station_name 
            FROM Charger c 
            JOIN Station s ON c.station_id = s.station_id
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }

    static async ChargerHealthUptime(chargerId) {
        // Logic: Calculate total duration and subtract duration where state was 'malfunction' or 'offline'
        const sql = `
            WITH StatusDurations AS (
                SELECT 
                    new_state,
                    time_ref,
                    LEAD(time_ref) OVER (PARTITION BY charger_id ORDER BY time_ref) as next_time
                FROM ChargerStatusHistory
                WHERE charger_id = ?
            )
            SELECT 
                new_state as status,
                SUM(TIMESTAMPDIFF(SECOND, time_ref, IFNULL(next_time, NOW()))) as total_seconds
            FROM StatusDurations
            GROUP BY new_state
        `;
        const [rows] = await db.execute(sql, [chargerId]);
        return rows;
    }

    static async ChargerFailures(chargerId) {
        // Logic: Count 'malfunction' entries per month for the selected charger
        const sql = `
            SELECT 
                DATE_FORMAT(time_ref, '%b %Y') as month_label,
                COUNT(*) as failure_count
            FROM ChargerStatusHistory
            WHERE charger_id = ? AND new_state = 'malfunction'
            GROUP BY YEAR(time_ref), MONTH(time_ref), month_label
            ORDER BY YEAR(time_ref), MONTH(time_ref)
        `;
        const [rows] = await db.execute(sql, [chargerId]);
        return rows;
    }

    static async GetUserGrowth(monthsLimit = 12) {
        const sql = `
            SELECT 
                DATE_FORMAT(created_at, '%b %Y') AS month_label, 
                COUNT(user_id) AS new_registrations
            FROM Users
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
            GROUP BY YEAR(created_at), MONTH(created_at), month_label
            ORDER BY YEAR(created_at), MONTH(created_at)
        `;
        const [rows] = await db.execute(sql, [monthsLimit]);
        return rows;
    }
    
    static async GetReturningUsers(monthsLimit = 12) {
        const sql = `
            SELECT 
                DATE_FORMAT(s.start_time, '%b %Y') AS month_label,
                COUNT(DISTINCT s.user_id) AS returning_user_count
            FROM Session s
            JOIN Users u ON s.user_id = u.user_id
            WHERE s.start_time >= DATE_SUB(NOW(), INTERVAL ? MONTH)
              AND DATE_FORMAT(s.start_time, '%Y-%m') > DATE_FORMAT(u.created_at, '%Y-%m')
            GROUP BY YEAR(s.start_time), MONTH(s.start_time), month_label
            ORDER BY YEAR(s.start_time), MONTH(s.start_time)
        `;
        const [rows] = await db.execute(sql, [monthsLimit]);
        return rows;
    }

};

    module.exports = AdminStatsModel;