ALTER TABLE barberia ADD COLUMN precio_color DECIMAL(10,2) DEFAULT 300.00;
ALTER TABLE barberia ADD COLUMN precio_alisado DECIMAL(10,2) DEFAULT 400.00;
ALTER TABLE barberia ADD COLUMN precio_semi_permanente DECIMAL(10,2) DEFAULT 350.00;
ALTER TABLE barberia ADD COLUMN servicio_color_enabled BOOLEAN DEFAULT false;
ALTER TABLE barberia ADD COLUMN servicio_alisado_enabled BOOLEAN DEFAULT false;
ALTER TABLE barberia ADD COLUMN servicio_semi_permanente_enabled BOOLEAN DEFAULT false;

UPDATE barberia SET precio_color = 300.00, precio_alisado = 400.00, precio_semi_permanente = 350.00;
UPDATE barberia SET servicio_color_enabled = false, servicio_alisado_enabled = false, servicio_semi_permanente_enabled = false;