const db = require('./backend/src/config/db');

async function checkTriggers() {
    try {
        const res = await db.query(`
            SELECT event_object_table, trigger_name, event_manipulation, action_statement 
            FROM information_schema.triggers
        `);
        console.log("TRIGGERS FOUND:", res.rows.length);
        res.rows.forEach(t => {
            console.log(`Table: ${t.event_object_table}, Name: ${t.trigger_name}, Event: ${t.event_manipulation}`);
        });
        
        const constraints = await db.query(`
            SELECT table_name, constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_schema = 'public'
        `);
        console.log("\nCONSTRAINTS FOUND:", constraints.rows.length);
        constraints.rows.filter(c => c.table_name === 'order_items' || c.table_name === 'orders' || c.table_name === 'carts').forEach(c => {
            console.log(`Table: ${c.table_name}, Name: ${c.constraint_name}, Type: ${c.constraint_type}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkTriggers();
