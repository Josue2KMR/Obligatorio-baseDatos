SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE obligatorio;

-- INSERTAR TURNOS
INSERT INTO turno ( hora_inicio, hora_fin) VALUES
('08:00:00', '09:00:00'),
('09:00:00', '10:00:00'),
('10:00:00', '11:00:00'),
('11:00:00', '12:00:00'),
('12:00:00', '13:00:00'),
('13:00:00', '14:00:00'),
('14:00:00', '15:00:00'),
('15:00:00', '16:00:00'),
('16:00:00', '17:00:00'),
('17:00:00', '18:00:00'),
('18:00:00', '19:00:00'),
('19:00:00', '20:00:00'),
('20:00:00', '21:00:00'),
('21:00:00', '22:00:00'),
('22:00:00', '23:00:00');

-- INSERTAR FACULTADES
INSERT INTO facultad (nombre) VALUES
('CIENCIAS EMPRESARIALES'),
('DERECHO Y CIENCIAS HUMANAS'),
('INGENIERÍA Y TECNOLOGÍAS'),
('CIENCIAS DE LA SALUD');

-- INSERTAR EDIFICIOS --
INSERT INTO edificio (nombre_edificio, direccion, departamento) VALUES
('Madre Marta', 'Av. Garibaldi 2831', 'Montevideo'),
('Sacre Coeur', 'Av. 8 de Octubre', 'Montevideo'),
('Mullin', 'Comandante Braga 2715', 'Montevideo'),
('San José', 'Av. 8 de Octubre 2733', 'Montevideo');

-- INSERTAR PROGRAMAS ACADEMICOS
INSERT INTO programa_academico (nombre_programa, id_facultad, tipo) VALUES
('Ingeniería en Sistemas', 3, 'grado'),
('Ingeniería Industrial', 3, 'grado'),
('Contador Público', 1, 'grado'),
('Maestría en Administración', 1, 'posgrado'),
('Abogacía', 2, 'grado'),
('Maestría en Derecho', 2, 'posgrado');

-- INSERTAR SALAS
INSERT INTO sala(nombre_sala, edificio, capacidad, tipo_sala) VALUES
('Sala 101', 'Mullin', 6, 'libre'),
('Sala 102', 'Mullin', 8, 'libre'),
('Sala 201', 'Sacre Coeur', 4, 'libre'),
('Sala Posgrado A', 'Sacre Coeur', 10, 'posgrado'),
('Sala Posgrado B', 'San José', 8, 'posgrado'),
('Sala Docentes 1', 'San José', 6, 'docente'),
('Sala Docentes 2', 'Sacre Coeur', 4, 'docente'),
('Sala 301', 'Madre Marta', 12, 'libre');

-- INSERTAR PARTICIPANTES
INSERT INTO participante(ci, nombre, apellido, email) VALUES
(51122334, 'Avril', 'Fernández', 'avril.fernandez@correo.ucu.uy'),
(43215678, 'Josue', 'Pérez', 'josue.perez@correo.ucu.uy'),
(49876543, 'Mateo', 'Castro', 'mateo.castro@correo.ucu.uy'),
(52345671, 'Joaquin', 'Silva', 'joaquin.silva@correo.ucu.uy'),
(51478932, 'Guillermo', 'López', 'guillermo.lopez@correo.ucu.uy'),
(50987456, 'Lucía', 'Rodríguez', 'lucia.rodriguez@correo.ucu.uy'),
(47654321, 'Camila', 'Santos', 'camila.santos@correo.ucu.uy'),
(48976540, 'Martín', 'González', 'martin.gonzalez@correo.ucu.uy'),
(52789452, 'Valentina', 'Suárez', 'valentina.suarez@correo.ucu.uy'),
(50123498, 'Sofía', 'Torres', 'sofia.torres@correo.ucu.uy'),
(11111111, 'Admin', 'Sistema', 'admin@correo.ucu.uy');

INSERT INTO
    login (correo, contraseña)
VALUES
    ('avril.fernandez@correo.ucu.uy', 'pass123'),
    ('josue.perez@correo.ucu.uy', 'pass123'),
    ('mateo.castro@correo.ucu.uy', 'pass123'),
    ('joaquin.silva@correo.ucu.uy', 'pass123'),
    ('guillermo.lopez@correo.ucu.uy', 'pass123'),
    ('lucia.rodriguez@correo.ucu.uy', 'pass123'),
    ('camila.santos@correo.ucu.uy', 'pass123'),
    ('martin.gonzalez@correo.ucu.uy', 'pass123'),
    ('valentina.suarez@correo.ucu.uy', 'pass123'),
    ('sofia.torres@correo.ucu.uy', 'pass123'),
    ('admin@correo.ucu.uy', 'admin123');


-- Asignar roles a los participantes existentes
-- Participante 1: Estudiante de grado (Ingeniería en Sistemas)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(51122334, 'Ingeniería en Sistemas', 3, 'estudiante');

-- Participante 2: Estudiante de grado (Ingeniería Industrial)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(43215678, 'Ingeniería Industrial', 3, 'estudiante');

-- Participante 3: Estudiante de posgrado (Maestría en Administración)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(49876543, 'Maestría en Administración', 1, 'estudiante');

-- Participante 4: Docente (Abogacía)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(52345671, 'Abogacía', 2, 'docente');

-- Participante 5: Docente (Ingeniería en Sistemas)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(51478932, 'Ingeniería en Sistemas', 3, 'docente');

-- Participante 6: Estudiante de grado (Contador Público)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(50987456, 'Contador Público', 1, 'estudiante');

-- Participante 7: Estudiante de posgrado (Maestría en Derecho)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(47654321, 'Maestría en Derecho', 2, 'estudiante');

-- Participante 8: Estudiante de grado (Abogacía)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(48976540, 'Abogacía', 2, 'estudiante');

-- Participante 9: Estudiante de grado (Ingeniería Industrial)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(52789452, 'Ingeniería Industrial', 3, 'estudiante');

-- Participante 10: Estudiante de grado (Contador Público)
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(50123498, 'Contador Público', 1, 'estudiante');

INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol)
VALUES (11111111, 'Ingeniería en Sistemas', 3, 'admin');

-- Verificar que los roles se insertaron correctamente
SELECT
    p.ci,
    p.nombre,
    p.apellido,
    ppa.rol,
    ppa.nombre_programa,
    pa.tipo
FROM participante p
JOIN participante_programa_academico ppa ON p.ci = ppa.ci_participante
JOIN programa_academico pa ON pa.nombre_programa = ppa.nombre_programa
ORDER BY p.ci;



-- ============================================================
-- DATOS DE PRUEBA EXTENDIDOS
-- ============================================================

-- AGREGAR MÁS PARTICIPANTES PARA TESTING
INSERT INTO participante(ci, nombre, apellido, email) VALUES
(12345678, 'Juan', 'Martínez', 'juan.martinez@correo.ucu.uy'),
(54321987, 'Ana', 'Ramírez', 'ana.ramirez@correo.ucu.uy'),
(45678912, 'Diego', 'Morales', 'diego.morales@correo.ucu.uy'),
(78912345, 'Laura', 'Benítez', 'laura.benitez@correo.ucu.uy'),
(32165498, 'Carlos', 'Vega', 'carlos.vega@correo.ucu.uy'),
(65498732, 'María', 'Ortiz', 'maria.ortiz@correo.ucu.uy'),
(98765432, 'Pedro', 'Núñez', 'pedro.nunez@correo.ucu.uy'),
(14725836, 'Gabriela', 'Acosta', 'gabriela.acosta@correo.ucu.uy'),
(36985214, 'Fernando', 'Méndez', 'fernando.mendez@correo.ucu.uy'),
(25836914, 'Valentina', 'Flores', 'valentina.flores@correo.ucu.uy');

INSERT INTO login (correo, contraseña) VALUES
('juan.martinez@correo.ucu.uy', 'pass123'),
('ana.ramirez@correo.ucu.uy', 'pass123'),
('diego.morales@correo.ucu.uy', 'pass123'),
('laura.benitez@correo.ucu.uy', 'pass123'),
('carlos.vega@correo.ucu.uy', 'pass123'),
('maria.ortiz@correo.ucu.uy', 'pass123'),
('pedro.nunez@correo.ucu.uy', 'pass123'),
('gabriela.acosta@correo.ucu.uy', 'pass123'),
('fernando.mendez@correo.ucu.uy', 'pass123'),
('valentina.flores@correo.ucu.uy', 'pass123');

-- ASIGNAR PROGRAMAS A LOS NUEVOS PARTICIPANTES
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, id_facultad, rol) VALUES
(12345678, 'Ingeniería en Sistemas', 3, 'estudiante'),
(54321987, 'Contador Público', 1, 'estudiante'),
(45678912, 'Abogacía', 2, 'estudiante'),
(78912345, 'Maestría en Administración', 1, 'estudiante'),
(32165498, 'Ingeniería Industrial', 3, 'docente'),
(65498732, 'Maestría en Derecho', 2, 'estudiante'),
(98765432, 'Ingeniería en Sistemas', 3, 'estudiante'),
(14725836, 'Contador Público', 1, 'estudiante'),
(36985214, 'Abogacía', 2, 'docente'),
(25836914, 'Ingeniería Industrial', 3, 'estudiante');

-- ============================================================
-- RESERVAS DE PRUEBA - DISTRIBUCIÓN TEMPORAL
-- ============================================================

-- RESERVAS PASADAS (hace 3-5 días)
INSERT INTO reserva (nombre_sala, edificio, id_turno, fecha, estado) VALUES
('Sala 101', 'Mullin', 1, '2025-11-20', 'confirmada'),
('Sala 102', 'Mullin', 3, '2025-11-20', 'confirmada'),
('Sala 201', 'Sacre Coeur', 5, '2025-11-20', 'confirmada'),
('Sala 301', 'Madre Marta', 7, '2025-11-20', 'confirmada'),
('Sala Posgrado A', 'Sacre Coeur', 2, '2025-11-19', 'confirmada'),
('Sala Docentes 1', 'San José', 4, '2025-11-19', 'confirmada'),
('Sala 102', 'Mullin', 6, '2025-11-19', 'confirmada'),
('Sala 201', 'Sacre Coeur', 8, '2025-11-18', 'confirmada'),
('Sala 101', 'Mullin', 1, '2025-11-18', 'cancelada');

-- RESERVAS DE AYER (2025-11-22)
INSERT INTO reserva (nombre_sala, edificio, id_turno, fecha, estado) VALUES
('Sala 101', 'Mullin', 1, '2025-11-22', 'confirmada'),
('Sala 102', 'Mullin', 2, '2025-11-22', 'confirmada'),
('Sala 201', 'Sacre Coeur', 3, '2025-11-22', 'confirmada'),
('Sala 301', 'Madre Marta', 4, '2025-11-22', 'confirmada'),
('Sala Posgrado A', 'Sacre Coeur', 5, '2025-11-22', 'confirmada'),
('Sala Docentes 1', 'San José', 6, '2025-11-22', 'confirmada'),
('Sala 101', 'Mullin', 9, '2025-11-22', 'confirmada'),
('Sala 102', 'Mullin', 10, '2025-11-22', 'confirmada');

-- RESERVAS DE HOY (2025-11-23) - PASADAS (antes de las 16:30)
INSERT INTO reserva (nombre_sala, edificio, id_turno, fecha, estado) VALUES
('Sala 101', 'Mullin', 1, '2025-11-23', 'confirmada'),
('Sala 102', 'Mullin', 2, '2025-11-23', 'confirmada'),
('Sala 201', 'Sacre Coeur', 3, '2025-11-23', 'confirmada'),
('Sala 301', 'Madre Marta', 4, '2025-11-23', 'confirmada'),
('Sala Posgrado A', 'Sacre Coeur', 5, '2025-11-23', 'pendiente'),
('Sala Docentes 1', 'San José', 6, '2025-11-23', 'confirmada'),
('Sala 101', 'Mullin', 7, '2025-11-23', 'confirmada'),
('Sala 102', 'Mullin', 8, '2025-11-23', 'cancelada');

-- RESERVAS DE HOY - EN USO AHORA (16:00-17:00, aprox hora actual)
INSERT INTO reserva (nombre_sala, edificio, id_turno, fecha, estado) VALUES
('Sala 201', 'Sacre Coeur', 9, '2025-11-23', 'confirmada'),
('Sala 301', 'Madre Marta', 9, '2025-11-23', 'confirmada');

-- RESERVAS DE HOY - FUTURAS (después de las 17:00)
INSERT INTO reserva (nombre_sala, edificio, id_turno, fecha, estado) VALUES
('Sala 301', 'Madre Marta', 10, '2025-11-23', 'confirmada'),
('Sala 102', 'Mullin', 11, '2025-11-23', 'pendiente'),
('Sala Posgrado A', 'Sacre Coeur', 12, '2025-11-23', 'confirmada'),
('Sala Docentes 1', 'San José', 13, '2025-11-23', 'pendiente');

-- RESERVAS FUTURAS (próximos días)
INSERT INTO reserva (nombre_sala, edificio, id_turno, fecha, estado) VALUES
('Sala 101', 'Mullin', 1, '2025-11-24', 'pendiente'),
('Sala 102', 'Mullin', 2, '2025-11-24', 'pendiente'),
('Sala 201', 'Sacre Coeur', 3, '2025-11-24', 'pendiente'),
('Sala 301', 'Madre Marta', 4, '2025-11-24', 'confirmada'),
('Sala Posgrado A', 'Sacre Coeur', 5, '2025-11-24', 'confirmada'),
('Sala Docentes 1', 'San José', 3, '2025-11-24', 'confirmada'),
('Sala 101', 'Mullin', 6, '2025-11-25', 'pendiente'),
('Sala 102', 'Mullin', 7, '2025-11-25', 'pendiente'),
('Sala 201', 'Sacre Coeur', 8, '2025-11-25', 'pendiente'),
('Sala 301', 'Madre Marta', 9, '2025-11-25', 'pendiente'),
('Sala Posgrado A', 'Sacre Coeur', 1, '2025-11-26', 'confirmada'),
('Sala 101', 'Mullin', 2, '2025-11-26', 'pendiente'),
('Sala Docentes 1', 'San José', 5, '2025-11-26', 'confirmada');

-- RESERVAS CANCELADAS (futuras)
INSERT INTO reserva (nombre_sala, edificio, id_turno, fecha, estado) VALUES
('Sala Posgrado A', 'Sacre Coeur', 7, '2025-11-24', 'cancelada'),
('Sala 301', 'Madre Marta', 8, '2025-11-25', 'cancelada');

-- ============================================================
-- ASIGNAR PARTICIPANTES A LAS RESERVAS
-- ============================================================

-- Obtener IDs de reservas recién creadas (método más robusto)
SET @r1 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-20' AND nombre_sala = 'Sala 101' AND id_turno = 1 LIMIT 1);
SET @r2 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-20' AND nombre_sala = 'Sala 102' AND id_turno = 3 LIMIT 1);
SET @r3 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-20' AND nombre_sala = 'Sala 201' AND id_turno = 5 LIMIT 1);
SET @r4 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-20' AND nombre_sala = 'Sala 301' AND id_turno = 7 LIMIT 1);
SET @r5 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-19' AND nombre_sala = 'Sala Posgrado A' AND id_turno = 2 LIMIT 1);
SET @r6 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-19' AND nombre_sala = 'Sala Docentes 1' AND id_turno = 4 LIMIT 1);
SET @r7 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-19' AND nombre_sala = 'Sala 102' AND id_turno = 6 LIMIT 1);
SET @r8 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-18' AND nombre_sala = 'Sala 201' AND id_turno = 8 LIMIT 1);
SET @r9 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-18' AND nombre_sala = 'Sala 101' AND id_turno = 1 AND estado = 'cancelada' LIMIT 1);

-- Reservas de ayer
SET @r10 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-22' AND nombre_sala = 'Sala 101' AND id_turno = 1 LIMIT 1);
SET @r11 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-22' AND nombre_sala = 'Sala 102' AND id_turno = 2 LIMIT 1);
SET @r12 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-22' AND nombre_sala = 'Sala 201' AND id_turno = 3 LIMIT 1);
SET @r13 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-22' AND nombre_sala = 'Sala 301' AND id_turno = 4 LIMIT 1);

-- Reservas de hoy - pasadas
SET @r14 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-23' AND nombre_sala = 'Sala 101' AND id_turno = 1 LIMIT 1);
SET @r15 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-23' AND nombre_sala = 'Sala 102' AND id_turno = 2 LIMIT 1);
SET @r16 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-23' AND nombre_sala = 'Sala 201' AND id_turno = 3 LIMIT 1);

-- Reservas de hoy - en uso
SET @r17 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-23' AND nombre_sala = 'Sala 201' AND id_turno = 9 LIMIT 1);
SET @r18 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-23' AND nombre_sala = 'Sala 301' AND id_turno = 9 LIMIT 1);

-- Reservas de hoy - futuras
SET @r19 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-23' AND nombre_sala = 'Sala 301' AND id_turno = 10 LIMIT 1);
SET @r20 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-23' AND nombre_sala = 'Sala 102' AND id_turno = 11 LIMIT 1);

-- Reservas futuras
SET @r21 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-24' AND nombre_sala = 'Sala Posgrado A' AND id_turno = 5 LIMIT 1);
SET @r22 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-24' AND nombre_sala = 'Sala Docentes 1' AND id_turno = 3 LIMIT 1);
SET @r23 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-25' AND nombre_sala = 'Sala 101' AND id_turno = 6 LIMIT 1);

-- Reservas canceladas
SET @r24 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-24' AND nombre_sala = 'Sala Posgrado A' AND id_turno = 7 AND estado = 'cancelada' LIMIT 1);
SET @r25 = (SELECT id_reserva FROM reserva WHERE fecha = '2025-11-25' AND nombre_sala = 'Sala 301' AND id_turno = 8 AND estado = 'cancelada' LIMIT 1);

-- Insertar participantes en las reservas
INSERT INTO reserva_participante (id_reserva, ci_participante, fecha_solicitud_reserva) VALUES
-- Reservas pasadas (hace 3-5 días)
(@r1, 51122334, '2025-11-19 10:00:00'),
(@r1, 12345678, '2025-11-19 10:05:00'),
(@r1, 98765432, '2025-11-19 10:10:00'),
(@r2, 54321987, '2025-11-19 11:00:00'),
(@r2, 45678912, '2025-11-19 11:05:00'),
(@r3, 50987456, '2025-11-19 12:00:00'),
(@r3, 78912345, '2025-11-19 12:05:00'),
(@r3, 14725836, '2025-11-19 12:10:00'),
(@r4, 52789452, '2025-11-18 13:00:00'),
(@r4, 25836914, '2025-11-18 13:05:00'),
(@r5, 49876543, '2025-11-18 14:00:00'),
(@r6, 52345671, '2025-11-18 15:00:00'),
(@r7, 43215678, '2025-11-18 16:00:00'),
(@r7, 65498732, '2025-11-18 16:05:00'),
(@r8, 48976540, '2025-11-17 17:00:00'),
(@r9, 50123498, '2025-11-17 18:00:00'),

-- Reservas de ayer
(@r10, 51122334, '2025-11-21 10:00:00'),
(@r10, 43215678, '2025-11-21 10:05:00'),
(@r10, 49876543, '2025-11-21 10:10:00'),
(@r11, 52345671, '2025-11-21 11:00:00'),
(@r11, 51478932, '2025-11-21 11:05:00'),
(@r12, 50987456, '2025-11-21 12:00:00'),
(@r12, 47654321, '2025-11-21 12:05:00'),
(@r12, 48976540, '2025-11-21 12:10:00'),
(@r13, 52789452, '2025-11-21 13:00:00'),
(@r13, 50123498, '2025-11-21 13:05:00'),

-- Reservas de hoy - pasadas
(@r14, 51122334, '2025-11-22 10:00:00'),
(@r14, 12345678, '2025-11-22 10:05:00'),
(@r15, 54321987, '2025-11-22 11:00:00'),
(@r15, 45678912, '2025-11-22 11:05:00'),
(@r16, 78912345, '2025-11-22 12:00:00'),
(@r16, 14725836, '2025-11-22 12:05:00'),

-- Reservas de hoy - en uso AHORA
(@r17, 51122334, '2025-11-23 08:00:00'),
(@r17, 52345671, '2025-11-23 08:05:00'),
(@r18, 98765432, '2025-11-23 09:00:00'),
(@r18, 25836914, '2025-11-23 09:05:00'),

-- Reservas de hoy - futuras
(@r19, 51122334, '2025-11-23 09:00:00'),
(@r19, 48976540, '2025-11-23 09:05:00'),
(@r20, 51122334, '2025-11-23 10:00:00'),

-- Reservas futuras (próximos días)
(@r21, 51122334, '2025-11-23 11:00:00'),
(@r21, 50987456, '2025-11-23 11:05:00'),
(@r22, 51122334, '2025-11-23 12:00:00'),
(@r23, 51122334, '2025-11-23 13:00:00'),
(@r23, 47654321, '2025-11-23 13:05:00'),
(@r23, 52789452, '2025-11-23 13:10:00'),

-- Reservas canceladas
(@r24, 51122334, '2025-11-22 10:00:00'),
(@r24, 49876543, '2025-11-22 10:05:00'),
(@r25, 51122334, '2025-11-22 11:00:00');

-- ============================================================
-- SANCIONES DE PRUEBA
-- ============================================================
INSERT INTO sancion_participante (ci_participante, fecha_inicio, fecha_fin) VALUES
(51122334, '2025-11-20', '2025-11-27'),
(43215678, '2025-11-21', '2025-11-28'),
(49876543, '2025-11-15', '2025-11-22'),
(50987456, '2025-11-18', '2025-11-25'),
(47654321, '2025-11-19', '2025-11-26'),
(12345678, '2025-11-17', '2025-11-24'),
(54321987, '2025-11-16', '2025-11-23'),
(78912345, '2025-11-20', '2025-11-30');