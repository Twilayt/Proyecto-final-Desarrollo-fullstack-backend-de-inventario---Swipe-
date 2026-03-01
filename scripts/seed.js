require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/db');

async function run() {
  await pool.query('DELETE FROM public.sale_items;').catch(() => {});
  await pool.query('DELETE FROM public.sales;').catch(() => {});
  await pool.query('DELETE FROM public.products;').catch(() => {});
  await pool.query('DELETE FROM public.clients;').catch(() => {});
  await pool.query('DELETE FROM public.users;').catch(() => {});

  const adminHash = await bcrypt.hash('Admin123!', 10);
  const userHash = await bcrypt.hash('User123!', 10);

  const usersRes = await pool.query(
    `INSERT INTO public.users (nombre,email,password_hash,role)
     VALUES ($1,$2,$3,$4), ($5,$6,$7,$8)
     RETURNING id,email,role`,
    [
      'Admin SWIPE', 'admin@swipe.com', adminHash, 'admin',
      'Usuario SWIPE', 'user@swipe.com', userHash, 'user'
    ]
  );

  const clientsRes = await pool.query(
    `INSERT INTO public.clients (nombre, telefono, email, direccion, activo)
     VALUES
     ('Hotel Sierra Norte', '614-000-0001', 'compras@hotelsierra.com', 'Chihuahua, CHIH', true),
     ('Restaurante El Rincón', '614-000-0002', 'admin@elrincon.mx', 'Chihuahua, CHIH', true),
     ('Limpieza Express', '614-000-0003', 'contacto@limpiezaexpress.mx', 'Chihuahua, CHIH', true)
     RETURNING id, nombre`
  );

  await pool.query(
    `INSERT INTO public.products (sku,nombre,categoria,descripcion,presentacion,precio,stock,fecha_caducidad)
     VALUES
     ($1,$2,$3,$4,$5,$6,$7,$8),
     ($9,$10,$11,$12,$13,$14,$15,$16),
     ($17,$18,$19,$20,$21,$22,$23,$24),
     ($25,$26,$27,$28,$29,$30,$31,$32),
     ($33,$34,$35,$36,$37,$38,$39,$40),
     ($41,$42,$43,$44,$45,$46,$47,$48)`,
    [
      'SW-001','Cloro 1L','DESINFECTANTES','Cloro doméstico para desinfección general','1 L', 25, 25, '2026-05-10',
      'SW-014','Detergente 5L','COCINA','Detergente para limpieza general','5 L', 110, 8, '2026-03-20',
      'SW-021','Desinfectante 1L','DESINFECTANTES','Desinfectante para superficies','1 L', 55, 12, '2026-03-05',
      'SW-045','Jabón líquido 1L','MANOS','Jabón líquido para manos','1 L', 45, 30, '2027-01-15',
      'SW-052','Aromatizante 500ml','AMBIENTAL','Aromatizante para interiores','500 ml', 60, 4, '2026-04-01',
      'SW-063','Sanitizante 1L','DESINFECTANTES','Sanitizante para superficies','1 L', 70, 9, '2026-03-02'
    ]
  );

  const adminId = usersRes.rows.find(u => u.role === 'admin')?.id;
  const clientId = clientsRes.rows[0]?.id;

  if (adminId && clientId) {
    const saleRes = await pool.query(
      `INSERT INTO public.sales (client_id, user_id, total)
       VALUES ($1,$2,$3) RETURNING id`,
      [clientId, adminId, 0]
    );
    const saleId = saleRes.rows[0].id;

    const prods = await pool.query(`SELECT id, precio FROM public.products ORDER BY created_at ASC LIMIT 2`);
    if (prods.rows.length === 2) {
      const [p1, p2] = prods.rows;
      await pool.query(
        `INSERT INTO public.sale_items (sale_id, product_id, cantidad, precio_unit)
         VALUES ($1,$2,$3,$4), ($1,$5,$6,$7)`,
        [saleId, p1.id, 2, p1.precio, p2.id, 1, p2.precio]
      );
      const total = 2 * Number(p1.precio) + 1 * Number(p2.precio);
      await pool.query(`UPDATE public.sales SET total=$1 WHERE id=$2`, [total, saleId]);
    }
  }

  console.log('Seed listo ✅');
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
